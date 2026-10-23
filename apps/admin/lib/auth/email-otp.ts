import { getCurrentAdapter, runWithTransaction } from "@better-auth/core/context";
import { APIError, createAuthEndpoint, isAPIError, signUpEmail } from "better-auth/api";
import type { BetterAuthPlugin } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";
import { emailOTP } from "better-auth/plugins/email-otp";

type EmailOTPWithPasswordPlugin = ReturnType<typeof emailOTP> & {
  endpoints: {
    signUpEmailOTP: NonNullable<BetterAuthPlugin["endpoints"]>[string];
  };
};

/** Native email OTP with a single-submit registration/password recovery endpoint. */
export function emailOTPWithPassword(
  options: Parameters<typeof emailOTP>[0],
): EmailOTPWithPasswordPlugin {
  const otp = emailOTP({
    otpLength: 6,
    expiresIn: 300,
    allowedAttempts: 3,
    storeOTP: "hashed",
    overrideDefaultEmailVerification: true,
    ...options,
    disableSignUp: false,
  });

  return {
    ...otp,
    endpoints: {
      ...otp.endpoints,
      signUpEmailOTP: createAuthEndpoint(
        "/sign-up/email-otp",
        {
          method: "POST",
          use: signUpEmail().options.use,
          body: signUpEmail().options.body.and(otp.endpoints.signInEmailOTP.options.body),
          metadata: { noStore: true },
        },
        async (ctx) => {
          const { password, email, otp: code, callbackURL: _callbackURL, rememberMe: _rememberMe, ...profile } = ctx.body;
          const { minPasswordLength, maxPasswordLength } = ctx.context.password.config;
          if (password.length < minPasswordLength || password.length > maxPasswordLength) {
            throw new APIError("BAD_REQUEST", {
              code: "INVALID_PASSWORD_LENGTH",
              message: `Password must contain ${minPasswordLength}–${maxPasswordLength} characters.`,
            });
          }
          // Validate and hash before spending the OTP; never pass a password as user data.
          const passwordHash = await ctx.context.password.hash(password);
          let temporaryToken: string | undefined;
          const adapter = ctx.context.internalAdapter;
          try {
            const outcome = await runWithTransaction(ctx.context.adapter, async () => {
              // Verify inside the same transaction: if anything below fails, the consumed
              // OTP and any newly created user roll back, so the code can be reused.
              // A rejected OTP is returned, not thrown, so its attempt counter commits.
              let verified;
              try {
                // Call the native endpoint in an isolated response scope. Its cookies and
                // provisional session must not reach the caller or the outer after-hooks.
                verified = await otp.endpoints.signInEmailOTP({
                  body: { ...profile, email: email.trim().toLowerCase(), otp: code },
                  headers: ctx.headers,
                  request: ctx.request,
                  context: {
                    ...ctx.context,
                    responseHeaders: new Headers(),
                    setNewSession: () => {},
                    internalAdapter: {
                      ...adapter,
                      createSession: async (...args: Parameters<typeof adapter.createSession>) => {
                        const session = await adapter.createSession(...args);
                        temporaryToken = session?.token;
                        return session;
                      },
                    },
                  },
                });
              } catch (error) {
                return { error };
              }

              const transaction = await getCurrentAdapter(ctx.context.adapter);
              if (transaction === ctx.context.adapter) {
                throw new Error("OTP password registration requires database transactions");
              }
              // Lock this user row so concurrent recoveries cannot create duplicate
              // credentials or leave a session for a superseded password.
              const lockedUser = await transaction.update({
                model: "user",
                where: [{ field: "id", value: verified.user.id }],
                update: { emailVerified: true },
              });
              if (!lockedUser) throw new APIError("BAD_REQUEST", { message: "Unable to complete this request." });
              await adapter.deleteUserSessions(verified.user.id);
              const credential = await adapter.findCredentialAccount(verified.user.id);
              if (credential) {
                await adapter.updatePassword(verified.user.id, passwordHash);
              } else {
                await adapter.createAccount({
                  userId: verified.user.id,
                  accountId: verified.user.id,
                  providerId: "credential",
                  password: passwordHash,
                });
              }
              const savedCredential = await adapter.findCredentialAccount(verified.user.id);
              if (savedCredential?.password !== passwordHash) {
                throw new Error("Credential write did not complete");
              }
              const created = await adapter.createSession(
                verified.user.id, false, undefined, undefined,
                { deferSecondaryStorageWrites: true },
              );
              if (!created) throw new APIError("FORBIDDEN", { message: "Unable to sign in." });
              return { session: created, user: verified.user };
            });
            if ("error" in outcome) throw outcome.error;
            const { session, user } = outcome;

            // External reset callbacks must not report an already committed change as failed.
            try {
              await ctx.context.options.emailAndPassword?.onPasswordReset?.(
                { user }, ctx.request,
              );
            } catch {
              ctx.context.logger.error("OTP password reset callback failed after commit");
            }
            await setSessionCookie(ctx, { session, user });
            return ctx.json({ token: session.token, user });
          } catch (error) {
            ctx.responseHeaders.delete("set-cookie");
            (ctx.context as { responseHeaders?: Headers }).responseHeaders?.delete("set-cookie");
            // Reconstruct API errors so a nested endpoint's provisional cookies never leak.
            if (isAPIError(error)) throw new APIError(error.status, error.body);
            ctx.context.logger.error("OTP password registration did not complete");
            throw new APIError("INTERNAL_SERVER_ERROR", {
              code: "OTP_REGISTRATION_FAILED",
              message: "Unable to complete this request. Request a new code and try again.",
            });
          } finally {
            if (temporaryToken) {
              await adapter.deleteSession(temporaryToken).catch(() => {
                ctx.context.logger.error("Unable to remove provisional OTP session");
              });
            }
          }
        },
      ),
    },
    rateLimit: [
      ...otp.rateLimit,
      { pathMatcher: (path: string) => path === "/sign-up/email-otp", window: 60, max: 3 } as unknown as (typeof otp.rateLimit)[number],
    ],
  };
}
