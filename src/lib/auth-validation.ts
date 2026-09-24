import type { AuthError } from "@supabase/supabase-js"

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string) {
  const trimmed = email.trim()
  if (!trimmed) return "Email is required."
  return EMAIL_PATTERN.test(trimmed) ? null : "Please enter a valid email address."
}

export function validatePassword(password: string) {
  const trimmed = password.trim()
  if (trimmed.length < 8) return "Password must be at least 8 characters long."
  if (!/\d/.test(trimmed) || !/[^A-Za-z0-9]/.test(trimmed)) {
    return "Must contain at least 1 number and 1 special character."
  }
  return null
}

export function validateConfirmPassword(password: string, confirmation: string) {
  const trimmedPassword = password.trim()
  const trimmedConfirmation = confirmation.trim()
  if (!trimmedConfirmation || trimmedPassword !== trimmedConfirmation) {
    return "Passwords do not match."
  }
  return null
}

export function isEmailTakenError(error: AuthError | null | undefined): boolean {
  if (!error) return false
  const code = (error as { code?: string }).code?.toLowerCase() ?? ""
  const message = error.message?.toLowerCase() ?? ""
  return (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already exists")
  )
}

export function getAuthErrorMessage(
  error: AuthError | null | undefined,
  mode: "signIn" | "signUp"
): string {
  if (!error) return ""
  if (mode === "signIn") {
    return "Invalid email or password. Please check your credentials and try again."
  }
  if (isEmailTakenError(error)) {
    return "An account with this email already exists. Try signing in."
  }
  const code = (error as { code?: string }).code?.toLowerCase() ?? ""
  const message = error.message?.toLowerCase() ?? ""
  if (
    code.includes("rate_limit") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return "Too many attempts. Please wait a moment and try again."
  }
  return "We could not create your account. Please try again."
}
