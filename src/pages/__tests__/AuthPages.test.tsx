import { AuthError } from "@supabase/supabase-js"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AuthProvider } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Login } from "@/pages/Login"
import { SignUp } from "@/pages/SignUp"

type MockAuthError = Parameters<typeof supabase.auth.signInWithPassword> extends unknown
  ? Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["error"]
  : never

// Mock supabase client
vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(),
    },
  }
})

describe("Auth Pages Integration", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe("Login", () => {
    it("renders login form with all elements", async () => {
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )

      expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument()
    })

    it("shows validation errors for empty fields without calling Supabase", async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )

      await user.click(await screen.findByRole("button", { name: "Sign in" }))

      expect(screen.getByText("Email is required.")).toBeInTheDocument()
      expect(screen.getByText("Password is required.")).toBeInTheDocument()
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
    })

    it("shows generic error message on failed sign in", async () => {
      const user = userEvent.setup()
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null, weakPassword: null },
        error: { name: "AuthApiError", message: "Invalid login credentials", status: 400 } as unknown as AuthError,
      })

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      )

      await user.type(await screen.findByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "wrongpassword")
      await user.click(screen.getByRole("button", { name: "Sign in" }))

      expect(
        await screen.findByText(
          "Invalid email or password. Please check your credentials and try again."
        )
      ).toBeInTheDocument()
    })
  })

  describe("SignUp", () => {
    it("validates empty email, invalid email, short password, and requirements inline", async () => {
      const user = userEvent.setup()
      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <AuthProvider>
            <SignUp />
          </AuthProvider>
        </MemoryRouter>
      )

      expect(await screen.findByRole("heading", { name: "Start your streak" })).toBeInTheDocument()

      // 1. Submit empty form
      await user.click(screen.getByRole("button", { name: "Create account" }))
      expect(screen.getByText("Email is required.")).toBeInTheDocument()
      expect(screen.getByText("Password must be at least 8 characters long.")).toBeInTheDocument()
      expect(supabase.auth.signUp).not.toHaveBeenCalled()

      // 2. Invalid email format
      await user.type(screen.getByLabelText("Email"), "notanemail")
      await user.click(screen.getByRole("button", { name: "Create account" }))
      expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument()

      // 3. Short password (< 8 chars)
      await user.clear(screen.getByLabelText("Email"))
      await user.type(screen.getByLabelText("Email"), "user@example.com")
      await user.type(screen.getByLabelText("Password"), "short1!")
      await user.click(screen.getByRole("button", { name: "Create account" }))
      expect(screen.getByText("Password must be at least 8 characters long.")).toBeInTheDocument()

      // 4. Missing number and special character
      await user.clear(screen.getByLabelText("Password"))
      await user.type(screen.getByLabelText("Password"), "longpasswordonly")
      await user.click(screen.getByRole("button", { name: "Create account" }))
      expect(
        screen.getByText("Must contain at least 1 number and 1 special character.")
      ).toBeInTheDocument()

      // 5. Password mismatch
      await user.clear(screen.getByLabelText("Password"))
      await user.type(screen.getByLabelText("Password"), "Valid123#")
      await user.type(screen.getByLabelText("Confirm Password"), "Different456$")
      await user.click(screen.getByRole("button", { name: "Create account" }))
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
    })

    it("displays 'An account with this email already exists. Try signing in.' inline under email when email is taken", async () => {
      const user = userEvent.setup()
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: {
          name: "AuthApiError",
          code: "user_already_exists",
          message: "User already registered",
          status: 422,
        } as unknown as MockAuthError,
      })

      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <AuthProvider>
            <SignUp />
          </AuthProvider>
        </MemoryRouter>
      )

      await user.type(await screen.findByLabelText("Email"), "existing@example.com")
      await user.type(screen.getByLabelText("Password"), "Valid123#")
      await user.type(screen.getByLabelText("Confirm Password"), "Valid123#")
      await user.click(screen.getByRole("button", { name: "Create account" }))

      // Verify the error appears inline under the email field
      const inlineError = await screen.findByText(
        "An account with this email already exists. Try signing in."
      )
      expect(inlineError).toBeInTheDocument()

      // The email input should have aria-invalid set to true
      const emailInput = screen.getByLabelText("Email")
      expect(emailInput).toHaveAttribute("aria-invalid", "true")

      // No general banner alert was rendered (only the inline error span)
      expect(inlineError.tagName.toLowerCase()).toBe("span")
      expect(screen.queryByText("We could not create your account. Please try again.")).toBeNull()
    })
  })
})
