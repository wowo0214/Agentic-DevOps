"use client";

import {
  authMutationKeys,
  authQueryKeys,
  createFormFieldError,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  getAuthCallbackURL,
  getAuthLinkURL,
  isPasswordCompromisedError,
  validateEmailAddress,
  validateMatchingValue,
  validateStringLength,
} from "@better-auth-ui/core";
import {
  AuthPrompts,
  useAuth,
  useFetchOptions,
  useSignUpEmail,
} from "@better-auth-ui/react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/input-group";
import { cn } from "cn";
import { isEmailValidationError } from "./lib/is-email-validation-error";
import { authFetch } from "./lib/auth-fetch";
import {
  getAuthAdditionalFieldValidators,
  isAuthFormFieldInvalid,
  useAuthForm,
} from "./auth-form";
import { PasswordStrengthMeter } from "./password-strength-meter";

const RESEND_COOLDOWN_MS = 60_000;

export type SignUpProps = {
  className?: string;

  /**
   * Runs instead of the post-sign-up redirect, but only when the sign-up
   * created an immediately usable session. Email verification still takes
   * priority.
   */
  onSignUpSuccess?: () => void;
};

/**
 * Renders email registration, optionally verifying an OTP before password setup.
 *
 * Submits credentials to the configured auth client and handles the response:
 * - If email verification is required, shows a notification and navigates to sign-in
 * - On success, refreshes the session and navigates to the configured redirect path
 * - On failure, displays error toasts
 * - Manages a pending state while the request is in-flight
 *
 * @param className - Additional CSS classes applied to the outer container

 * @param onSignUpSuccess - Replaces the post-sign-up redirect when the new account is immediately usable
 * @returns The sign-up form React element.
 */
export function SignUp({
  className,

  onSignUpSuccess,
}: SignUpProps) {
  const {
    additionalFields,
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,

    viewPaths,
    navigate,
    Link,
  } = useAuth();

  const registration = emailAndPassword?.requireEmailVerification === true;
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"account" | "verification">("account");
  const [otp, setOtp] = useState("");
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );
  const [registrationPending, setRegistrationPending] = useState(false);
  const registrationInFlight = useRef(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const resendAfter = Math.max(0, Math.ceil((resendAt - now) / 1000));

  useEffect(() => {
    if (!resendAt) return;
    const timer = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= resendAt) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendAt]);

  const { fetchOptions, resetFetchOptions } = useFetchOptions();

  async function finishRegistration() {
    await authClient.getSession({ fetchOptions: { cache: "no-store" } });
    await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    if (onSignUpSuccess) onSignUpSuccess();
    else navigate({ to: redirectTo, replace: true });
  }

  async function runRegistrationAction(action: () => Promise<void>) {
    if (registrationInFlight.current) return;
    registrationInFlight.current = true;
    setRegistrationPending(true);
    setRegistrationError(null);
    try {
      await action();
    } catch {
      setRegistrationError("Unable to complete this step. Please try again.");
    } finally {
      resetFetchOptions();
      registrationInFlight.current = false;
      setRegistrationPending(false);
    }
  }

  async function requestCode(email: string) {
    const remaining = Math.ceil((resendAt - Date.now()) / 1000);
    if (remaining > 0) {
      setRegistrationError(`Please wait ${remaining}s before requesting another code.`);
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const invalid = validateEmailAddress(normalizedEmail, {
      invalidMessage: localization.auth.invalidEmail,
      requiredMessage: localization.auth.fieldRequired,
    });
    if (invalid) {
      setRegistrationError(localization.auth.invalidEmail);
      return;
    }
    const { error } = await authFetch(authClient)("/email-otp/send-verification-otp", {
      ...fetchOptions,
      method: "POST",
      body: { email: normalizedEmail, type: "sign-in" },
    });
    if (error) {
      setRegistrationError(error.message || "Unable to send code. Please try again.");
      return;
    }
    const requestedAt = Date.now();
    setNow(requestedAt);
    setResendAt(requestedAt + RESEND_COOLDOWN_MS);
    setOtp("");
    setStep("verification");
  }

  const { mutateAsync: signUpEmail } = useSignUpEmail(authClient, {
    onError: (error) => {
      if (isEmailValidationError(error)) {
        form.setErrorMap({
          onServer: {
            fields: {
              email: createFormFieldError(localization.auth.invalidEmail),
            },
          },
        });
        resetFetchOptions();
        return;
      }

      // The haveIBeenPwned plugin rejects on the password itself,
      // so it belongs against the field rather than in a toast.
      if (isPasswordCompromisedError(error)) {
        setIsCompromised(true);
      }

      form.setFieldValue("password", "");
      form.setFieldValue("confirmPassword", "");
      resetFetchOptions();
    },
    onSuccess: (_data, { email }) => {
      if (emailAndPassword?.requireEmailVerification) {
        sessionStorage.setItem("better-auth-ui.verify-email", email);
        navigate({
          to: getAuthLinkURL(
            `${basePaths.auth}/${viewPaths.auth.verifyEmail}`,
            redirectTo,
          ),
        });
      } else if (onSignUpSuccess) {
        onSignUpSuccess();
      } else {
        navigate({ to: redirectTo });
      }
    },
  });

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all,
  });
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all,
  });
  const isPending = registrationPending || signInMutating + signUpMutating > 0;

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent,
  )?.captchaComponent;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [isCompromised, setIsCompromised] = useState(false);
  const signUpFields = additionalFields?.filter((field) => field.signUp) ?? [];
  const form = useAuthForm({
    defaultValues: {
      additionalFields: getAdditionalFieldDefaultValues(signUpFields),
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (registration) {
        await runRegistrationAction(async () => {
          if (step === "account") {
            await requestCode(value.email);
            return;
          }
          if (!/^\d{6}$/.test(otp)) {
            setRegistrationError("Enter the 6-digit verification code.");
            return;
          }
          const { error } = await authFetch(authClient)("/sign-up/email-otp", {
            ...fetchOptions,
            method: "POST",
            body: {
              ...getAdditionalFieldSubmitValues(signUpFields, value.additionalFields),
              name: emailAndPassword?.name === false ? "" : value.name.trim(),
              email: value.email.trim().toLowerCase(),
              otp,
              password: value.password,
            },
          });
          if (error) {
            setRegistrationError(error.message || "Request a new code and try again.");
            return;
          }
          await finishRegistration();
        });
        return;
      }
      try {
        await signUpEmail({
          name: emailAndPassword?.name === false ? "" : value.name,
          email: value.email.trim(),
          password: value.password,
          ...getAdditionalFieldSubmitValues(
            signUpFields,
            value.additionalFields,
          ),
          callbackURL: getAuthCallbackURL(baseURL, redirectTo),
          fetchOptions,
        });
      } catch {
        // The mutation reports the error through its configured handler.
      }
    },
  });

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <AuthPrompts view="signUp" />
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {step === "verification" ? localization.auth.verifyEmail : localization.auth.signUp}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {emailAndPassword?.enabled && (
            <form.AppForm>
              <form.AuthFormRoot>
                <FieldGroup>
                  <div className={step === "verification" ? "hidden" : "contents"}>
                      {emailAndPassword.name !== false && (
                        <form.AppField
                          name="name"
                          validators={{
                            onChange: ({ value }) =>
                              validateStringLength(value, {
                                requiredMessage:
                                  localization.auth.fieldRequired,
                                trim: true,
                              }),
                          }}
                        >
                          {(field) => {
                            const isInvalid = isAuthFormFieldInvalid(
                              field.state.meta,
                            );

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="name">
                                  {localization.auth.name}
                                </FieldLabel>

                                <Input
                                  id="name"
                                  name={field.name}
                                  type="text"
                                  autoComplete="name"
                                  placeholder={
                                    localization.auth.namePlaceholder
                                  }
                                  required
                                  disabled={isPending}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  aria-invalid={isInvalid}
                                />

                                <field.AuthFormFieldError />
                              </Field>
                            );
                          }}
                        </form.AppField>
                      )}

                      <form.AppField
                        name="email"
                        validators={{
                          onChange: ({ value }) =>
                            validateEmailAddress(value, {
                              invalidMessage: localization.auth.invalidEmail,
                              requiredMessage: localization.auth.fieldRequired,
                            }),
                        }}
                      >
                        {(field) => {
                          const isInvalid = isAuthFormFieldInvalid(
                            field.state.meta,
                          );

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="email">
                                {localization.auth.email}
                              </FieldLabel>

                              <Input
                                id="email"
                                name={field.name}
                                type="email"
                                autoComplete="email"
                                placeholder={localization.auth.emailPlaceholder}
                                required
                                disabled={isPending}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                  field.handleChange(event.target.value);
                                  setOtp("");
                                  setRegistrationError(null);
                                }}
                                aria-invalid={isInvalid}
                              />

                              <field.AuthFormFieldError />
                            </Field>
                          );
                        }}
                      </form.AppField>
                  </div>

                  {registration && step === "verification" && (
                    <Field>
                      <FieldLabel htmlFor="registration-otp">
                        Verification code
                      </FieldLabel>
                      <FieldDescription>
                        Enter the code sent to {form.getFieldValue("email").trim()} to create an account or replace your existing
                        password. The code expires in 5 minutes.
                      </FieldDescription>
                      <InputOTP
                        id="registration-otp"
                        containerClassName="w-full justify-center"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otp}
                        onChange={setOtp}
                        disabled={isPending}
                        autoFocus
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }, (_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isPending || resendAfter > 0}
                        onClick={() =>
                          runRegistrationAction(() =>
                            requestCode(form.getFieldValue("email")),
                          )
                        }
                      >
                        {resendAfter > 0
                          ? `Resend in ${resendAfter}s`
                          : "Resend code"}
                      </Button>
                    </Field>
                  )}

                  <div className={step === "verification" ? "hidden" : "contents"}>
                      {signUpFields.map(
                        (configuredField) =>
                          configuredField.signUp === "above" && (
                            <form.AppField
                              key={configuredField.name}
                              name={`additionalFields.${configuredField.name}`}
                              validators={getAuthAdditionalFieldValidators(
                                configuredField,
                                localization.auth.fieldRequired,
                              )}
                            >
                              {(field) => (
                                <field.AuthFormAdditionalField
                                  field={configuredField}
                                  isPending={isPending}
                                  optionalLabel={localization.auth.optional}
                                />
                              )}
                            </form.AppField>
                          ),
                      )}

                      <form.AppField
                        name="password"
                        validators={{
                          onChange: ({ value }) =>
                            validateStringLength(value, {
                              maxLength: emailAndPassword?.maxPasswordLength,
                              maxLengthMessage:
                                localization.auth.tooLong.replace(
                                  "{{max}}",
                                  String(emailAndPassword?.maxPasswordLength),
                                ),
                              minLength: emailAndPassword?.minPasswordLength,
                              minLengthMessage:
                                localization.auth.tooShort.replace(
                                  "{{min}}",
                                  String(emailAndPassword?.minPasswordLength),
                                ),
                              requiredMessage: localization.auth.fieldRequired,
                            }),
                        }}
                      >
                        {(field) => {
                          const isInvalid =
                            isAuthFormFieldInvalid(field.state.meta) ||
                            isCompromised;

                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="password">
                                {localization.auth.password}
                              </FieldLabel>

                              <InputGroup>
                                <InputGroupInput
                                  id="password"
                                  name={field.name}
                                  type={isPasswordVisible ? "text" : "password"}
                                  autoComplete="new-password"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => {
                                    field.handleChange(e.target.value);
                                    setIsCompromised(false);
                                  }}
                                  placeholder={
                                    localization.auth.passwordPlaceholder
                                  }
                                  required
                                  minLength={
                                    emailAndPassword?.minPasswordLength
                                  }
                                  maxLength={
                                    emailAndPassword?.maxPasswordLength
                                  }
                                  disabled={isPending}
                                  aria-invalid={isInvalid}
                                />

                                <InputGroupAddon align="inline-end">
                                  <InputGroupButton
                                    size="icon-xs"
                                    aria-label={
                                      isPasswordVisible
                                        ? localization.auth.hidePassword
                                        : localization.auth.showPassword
                                    }
                                    title={
                                      isPasswordVisible
                                        ? localization.auth.hidePassword
                                        : localization.auth.showPassword
                                    }
                                    onClick={() => {
                                      setIsPasswordVisible(
                                        (visible) => !visible,
                                      );
                                    }}
                                  >
                                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                                  </InputGroupButton>
                                </InputGroupAddon>
                              </InputGroup>

                              {isCompromised ? (
                                <FieldError>
                                  {localization.auth.passwordCompromised}
                                </FieldError>
                              ) : (
                                <field.AuthFormFieldError />
                              )}

                              <PasswordStrengthMeter
                                password={field.state.value}
                              />
                            </Field>
                          );
                        }}
                      </form.AppField>

                      {(registration || emailAndPassword?.confirmPassword) && (
                        <form.AppField
                          name="confirmPassword"
                          validators={{
                            onChangeListenTo: ["password"],
                            onChange: ({ fieldApi, value }) =>
                              validateStringLength(value, {
                                maxLength: emailAndPassword?.maxPasswordLength,
                                maxLengthMessage:
                                  localization.auth.tooLong.replace(
                                    "{{max}}",
                                    String(emailAndPassword?.maxPasswordLength),
                                  ),
                                minLength: emailAndPassword?.minPasswordLength,
                                minLengthMessage:
                                  localization.auth.tooShort.replace(
                                    "{{min}}",
                                    String(emailAndPassword?.minPasswordLength),
                                  ),
                                requiredMessage:
                                  localization.auth.fieldRequired,
                              }) ??
                              validateMatchingValue(
                                value,
                                fieldApi.form.getFieldValue("password"),
                                localization.auth.passwordsDoNotMatch,
                              ),
                          }}
                        >
                          {(field) => {
                            const isInvalid = isAuthFormFieldInvalid(
                              field.state.meta,
                            );

                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="confirmPassword">
                                  {localization.auth.confirmPassword}
                                </FieldLabel>

                                <InputGroup>
                                  <InputGroupInput
                                    id="confirmPassword"
                                    name={field.name}
                                    type={
                                      isConfirmPasswordVisible
                                        ? "text"
                                        : "password"
                                    }
                                    autoComplete="new-password"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    placeholder={
                                      localization.auth
                                        .confirmPasswordPlaceholder
                                    }
                                    required
                                    minLength={
                                      emailAndPassword?.minPasswordLength
                                    }
                                    maxLength={
                                      emailAndPassword?.maxPasswordLength
                                    }
                                    disabled={isPending}
                                    aria-invalid={isInvalid}
                                  />

                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                      size="icon-xs"
                                      aria-label={
                                        isConfirmPasswordVisible
                                          ? localization.auth.hidePassword
                                          : localization.auth.showPassword
                                      }
                                      title={
                                        isConfirmPasswordVisible
                                          ? localization.auth.hidePassword
                                          : localization.auth.showPassword
                                      }
                                      onClick={() =>
                                        setIsConfirmPasswordVisible(
                                          (visible) => !visible,
                                        )
                                      }
                                    >
                                      {isConfirmPasswordVisible ? (
                                        <EyeOff />
                                      ) : (
                                        <Eye />
                                      )}
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                </InputGroup>

                                <field.AuthFormFieldError />
                              </Field>
                            );
                          }}
                        </form.AppField>
                      )}

                      {signUpFields.map(
                        (configuredField) =>
                          configuredField.signUp !== "above" && (
                            <form.AppField
                              key={configuredField.name}
                              name={`additionalFields.${configuredField.name}`}
                              validators={getAuthAdditionalFieldValidators(
                                configuredField,
                                localization.auth.fieldRequired,
                              )}
                            >
                              {(field) => (
                                <field.AuthFormAdditionalField
                                  field={configuredField}
                                  isPending={isPending}
                                  optionalLabel={localization.auth.optional}
                                />
                              )}
                            </form.AppField>
                          ),
                      )}
                  </div>

                  {registrationError && (
                    <p role="alert" className="text-sm text-destructive">
                      {registrationError}
                    </p>
                  )}

                  {Captcha}

                  <div className="flex flex-col gap-3">
                    <form.AuthFormSubmitButton disabled={isPending}>
                      {registration
                        ? step === "account" ? "Send verification code" : "Verify and continue"
                        : localization.auth.signUp}
                    </form.AuthFormSubmitButton>
                    {registration && step === "verification" && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => {
                          setOtp("");
                          setRegistrationError(null);
                          setStep("account");
                        }}
                      >
                        Back
                      </Button>
                    )}
                  </div>
                </FieldGroup>
              </form.AuthFormRoot>
            </form.AppForm>
          )}
        </div>

        {emailAndPassword?.enabled && (
          <div className="flex flex-col gap-3 items-center w-full mt-4">
            <FieldDescription className="text-center">
              {localization.auth.alreadyHaveAnAccount}{" "}
              <Link
                href={getAuthLinkURL(
                  `${basePaths.auth}/${viewPaths.auth.signIn}`,
                  redirectTo,
                )}
                className="underline underline-offset-4"
              >
                {localization.auth.signIn}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
