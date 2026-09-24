import { Flame, LoaderCircle } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { AuthField } from "@/components/auth/AuthField"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import {
  getAuthErrorMessage,
  validateEmail,
} from "@/lib/auth-validation"

export function Login() {
  const { user, loading: authLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const emailError = submitted ? validateEmail(email) : null
  const passwordError = submitted
    ? !password
      ? "Password is required."
      : null
    : null

  useEffect(() => {
    if (!authLoading && user) {
      const from = (location.state as { from?: { pathname?: string } } | null)
        ?.from?.pathname
      navigate(from ?? "/", { replace: true })
    }
  }, [authLoading, user, navigate, location.state])

  function updateEmail(value: string) {
    setEmail(value)
    setError(null)
    setSubmitted(false)
  }

  function updatePassword(value: string) {
    setPassword(value)
    setError(null)
    setSubmitted(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const validationError =
      validateEmail(email) ?? (!password ? "Password is required." : null)
    if (validationError) return
    setLoading(true)
    setError(null)
    const result = await signIn(email.trim(), password)
    setLoading(false)
    if (result.error) {
      setError(getAuthErrorMessage(result.error, "signIn"))
      return
    }
    const from = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname
    navigate(from ?? "/", { replace: true })
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-6 shadow-[0_20px_60px_-36px_rgba(99,46,30,0.4)] sm:p-8">
        <AuthHeading
          title="Welcome back"
          subtitle="Pick up your rhythm where you left off."
        />
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <form noValidate className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <AuthField
            label="Email"
            value={email}
            onChange={updateEmail}
            type="email"
            autoComplete="email"
            hint="Use the email connected to your Streaks account."
            error={emailError}
            disabled={loading}
          />
          <AuthField
            label="Password"
            value={password}
            onChange={updatePassword}
            type="password"
            autoComplete="current-password"
            hint="At least 8 characters, including a number and special character."
            error={passwordError}
            disabled={loading}
          />
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading && <LoaderCircle className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Streaks?{" "}
          <Link
            className="font-semibold text-primary hover:underline"
            to="/signup"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}

function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Flame className="size-6 fill-current" />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}
