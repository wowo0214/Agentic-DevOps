import { getAuthErrorCode } from "@better-auth-ui/core"

export function isEmailValidationError(error: unknown) {
  if (getAuthErrorCode(error) === "INVALID_EMAIL") return true
  if (getAuthErrorCode(error) !== "VALIDATION_ERROR") return false
  if (!error || typeof error !== "object" || !("body" in error)) return false

  const body = error.body
  return !!body && typeof body === "object" && "message" in body &&
    typeof body.message === "string" && body.message.includes("[body.email]")
}
