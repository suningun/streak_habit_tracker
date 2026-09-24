import { Flame, LoaderCircle } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { AuthField } from "@/components/auth/AuthField"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import {
  getAuthErrorMessage,
  isEmailTakenError,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation"

export function SignUp() {
  const { user, loading: authLoading, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [serverEmailError, setServerEmailError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true })
    }
  }, [authLoading, user, navigate])

  const emailError =
    (submitted ? validateEmail(email) : null) ?? serverEmailError
  const passwordError = submitted ? validatePassword(password) : null
  const confirmationError = submitted
    ? validateConfirmPassword(password, confirmation)
    : null

  function clearMessages() {
    setError(null)
    setServerEmailError(null)
    setMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const validationError =
      validateEmail(email) ??
      validatePassword(password) ??
      validateConfirmPassword(password, confirmation)
    if (validationError) return
    setLoading(true)
    clearMessages()
    const result = await signUp(email.trim(), password)
    setLoading(false)
    if (result.error) {
      if (isEmailTakenError(result.error)) {
        setServerEmailError(
          "An account with this email already exists. Try signing in."
        )
      } else {
        setError(getAuthErrorMessage(result.error, "signUp"))
      }
      return
    }

    const identities = (
      result as { data?: { user?: { identities?: unknown[] } } }
    )?.data?.user?.identities
    if (identities && identities.length === 0) {
      setServerEmailError(
        "An account with this email already exists. Try signing in."
      )
      return
    }

    setMessage(
      "Your account is ready. Check your email if confirmation is enabled, then sign in."
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-6 shadow-[0_20px_60px_-36px_rgba(99,46,30,0.4)] sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Flame className="size-6 fill-current" />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
            Start your streak
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A calmer way to keep showing up.
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-primary/30 bg-accent px-3 py-2.5 text-sm text-accent-foreground"
          >
            {message}
          </p>
        )}
        <form noValidate className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <AuthField
            label="Email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              clearMessages()
              setSubmitted(false)
            }}
            type="email"
            autoComplete="email"
            hint="Use a valid email address you can access."
            error={emailError}
            disabled={loading}
          />
          <AuthField
            label="Password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              clearMessages()
              setSubmitted(false)
            }}
            type="password"
            autoComplete="new-password"
            hint="8+ characters, 1 number, and 1 special character."
            error={passwordError}
            disabled={loading}
          />
          <AuthField
            label="Confirm Password"
            value={confirmation}
            onChange={(value) => {
              setConfirmation(value)
              clearMessages()
              setSubmitted(false)
            }}
            type="password"
            autoComplete="new-password"
            hint="Re-enter your password exactly."
            error={confirmationError}
            disabled={loading}
          />
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading && <LoaderCircle className="animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
