"use client"

import { useAuth, useFetchOptions, useSendVerificationEmail } from "@better-auth-ui/react"
import { authQueryKeys } from "@better-auth-ui/core"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"

import { Button } from "@repo/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card"
import { FieldDescription } from "@repo/ui/field"
import { Spinner } from "@repo/ui/spinner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/input-otp"
import { cn } from "cn"
import { OpenEmailButton } from "./open-email-button"
import { useIsHydrated } from "./use-is-hydrated"
import { authFetch } from "./lib/auth-fetch"

export type VerifyEmailProps = {
  className?: string
}

/** Seconds the resend button stays disabled to prevent spamming the endpoint. */
const RESEND_COOLDOWN_SECONDS = 60

/**
 * Render a card prompting the user to verify their email, with a resend button
 * that is rate-limited by a cooldown timer.
 *
 * The target email is read from `sessionStorage` (set when sign-up or sign-in
 * redirects here); the OpenEmail/Resend controls are only shown when an email
 * is stored. The resend button is disabled while a cooldown is active and shows
 * the remaining seconds.
 *
 * @param className - Additional CSS classes applied to the card
 * @returns The verify-email card React element
 */
export function VerifyEmail({ className }: VerifyEmailProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    redirectTo,
    viewPaths,
    navigate,
    plugins,
    Link
  } = useAuth()

  const isHydrated = useIsHydrated()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState(
    (isHydrated && sessionStorage.getItem("better-auth-ui.verify-email")) || ""
  )
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const verifying = useRef(false)
  const { fetchOptions, resetFetchOptions } = useFetchOptions()
  const Captcha = plugins.find((plugin) => plugin.captchaComponent)?.captchaComponent

  async function verify() {
    if (verifying.current || !/^\d{6}$/.test(otp)) return
    verifying.current = true
    setIsVerifying(true)
    try {
      const { error } = await authFetch(authClient)("/email-otp/verify-email", {
        ...fetchOptions,
        method: "POST",
        body: { email, otp },
      })
      if (error) {
        toast.error(error.message || "Unable to verify this code.")
        return
      }
      sessionStorage.removeItem("better-auth-ui.verify-email")
      await authClient.getSession({ fetchOptions: { cache: "no-store" } })
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all })
      navigate({ to: redirectTo, replace: true })
    } catch {
      toast.error("Unable to verify this code. Please try again.")
    } finally {
      resetFetchOptions()
      verifying.current = false
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    setEmail(sessionStorage.getItem("better-auth-ui.verify-email") ?? "")
  }, [])

  useEffect(() => {
    if (cooldown <= 0 || !email) return

    const interval = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldown, email])

  const { mutate: sendVerificationEmail, isPending } = useSendVerificationEmail(
    authClient,
    {
      onSettled: () => resetFetchOptions(),
      onSuccess: () => {
        toast.success(localization.auth.verificationEmailSent)
        setOtp("")
        setCooldown(RESEND_COOLDOWN_SECONDS)
      }
    }
  )

  const isCoolingDown = cooldown > 0

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {localization.auth.verifyEmail}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <FieldDescription>
            {localization.auth.checkYourEmail}
          </FieldDescription>

          {email && (
            <div className="flex flex-col gap-3">
              <form
                className="flex flex-col gap-3"
                onSubmit={(event) => { event.preventDefault(); void verify() }}
              >
                <label htmlFor="email-verification-otp">Verification code</label>
                <InputOTP
                  id="email-verification-otp"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying || isPending}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {Captcha}
                <Button type="submit" disabled={isVerifying || isPending || otp.length !== 6}>
                  {isVerifying && <Spinner />}
                  {localization.auth.verifyEmail}
                </Button>
              </form>
              <OpenEmailButton email={email} />

              <Button
                type="button"
                variant="outline"
                disabled={!email || isCoolingDown || isPending || isVerifying}
                onClick={() =>
                  sendVerificationEmail({
                    email,
                    fetchOptions,
                    callbackURL: `${baseURL}${redirectTo}`
                  })
                }
              >
                {isPending && <Spinner />}

                {isCoolingDown
                  ? localization.auth.resendIn.replace(
                      "{{seconds}}",
                      String(cooldown)
                    )
                  : localization.auth.resend}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 items-center w-full mt-4">
          <FieldDescription className="text-center">
            {localization.auth.alreadyVerifiedYourEmail}{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="underline underline-offset-4"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  )
}
