import { describe, expect, it } from "vitest"

import {
  getAuthErrorMessage,
  isEmailTakenError,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
} from "@/lib/auth-validation"

describe("auth-validation", () => {
  describe("validateEmail", () => {
    it("rejects empty emails with 'Email is required.'", () => {
      expect(validateEmail("")).toBe("Email is required.")
      expect(validateEmail("   ")).toBe("Email is required.")
    })

    it("rejects invalid formats with 'Please enter a valid email address.'", () => {
      expect(validateEmail("invalid-email")).toBe("Please enter a valid email address.")
      expect(validateEmail("test@domain")).toBe("Please enter a valid email address.")
      expect(validateEmail("@domain.com")).toBe("Please enter a valid email address.")
    })

    it("accepts valid emails", () => {
      expect(validateEmail("user@example.com")).toBeNull()
      expect(validateEmail("john.doe+test@sub.domain.org")).toBeNull()
    })
  })

  describe("validatePassword", () => {
    it("rejects passwords with length < 8 with 'Password must be at least 8 characters long.'", () => {
      expect(validatePassword("")).toBe("Password must be at least 8 characters long.")
      expect(validatePassword("short")).toBe("Password must be at least 8 characters long.")
      expect(validatePassword("1234567")).toBe("Password must be at least 8 characters long.")
    })

    it("requires at least 1 number and 1 special character when length is >= 8", () => {
      expect(validatePassword("onlyletters")).toBe(
        "Must contain at least 1 number and 1 special character."
      )
      expect(validatePassword("lettersonly123")).toBe(
        "Must contain at least 1 number and 1 special character."
      )
      expect(validatePassword("lettersonly!@#")).toBe(
        "Must contain at least 1 number and 1 special character."
      )
    })

    it("accepts strong password meeting all criteria", () => {
      expect(validatePassword("Str0ng!Pass")).toBeNull()
      expect(validatePassword("Valid123#Secure")).toBeNull()
    })
  })

  describe("validateConfirmPassword", () => {
    it("rejects mismatching or empty confirmation with 'Passwords do not match.'", () => {
      expect(validateConfirmPassword("P@ssword1", "")).toBe("Passwords do not match.")
      expect(validateConfirmPassword("P@ssword1", "P@ssword2")).toBe("Passwords do not match.")
    })

    it("accepts matching passwords", () => {
      expect(validateConfirmPassword("P@ssword1", "P@ssword1")).toBeNull()
    })
  })

  describe("isEmailTakenError", () => {
    it("identifies email taken by error code", () => {
      expect(
        isEmailTakenError({
          name: "AuthError",
          code: "user_already_exists",
          message: "A user with this email address has already been registered",
        } as unknown as Parameters<typeof isEmailTakenError>[0])
      ).toBe(true)

      expect(
        isEmailTakenError({
          name: "AuthError",
          code: "email_exists",
          message: "Email already taken",
        } as unknown as Parameters<typeof isEmailTakenError>[0])
      ).toBe(true)
    })

    it("identifies email taken by message", () => {
      expect(
        isEmailTakenError({
          name: "AuthError",
          message: "User already registered",
        } as unknown as Parameters<typeof isEmailTakenError>[0])
      ).toBe(true)

      expect(
        isEmailTakenError({
          name: "AuthError",
          message: "An account with this email already exists",
        } as unknown as Parameters<typeof isEmailTakenError>[0])
      ).toBe(true)
    })

    it("returns false for other errors", () => {
      expect(
        isEmailTakenError({
          name: "AuthError",
          code: "invalid_credentials",
          message: "Invalid login credentials",
        } as unknown as Parameters<typeof isEmailTakenError>[0])
      ).toBe(false)
    })
  })

  describe("getAuthErrorMessage", () => {
    it("returns generic sign in error on failed auth regardless of error type", () => {
      expect(
        getAuthErrorMessage(
          { name: "AuthError", code: "invalid_credentials", message: "Invalid login credentials" } as unknown as Parameters<typeof getAuthErrorMessage>[0],
          "signIn"
        )
      ).toBe("Invalid email or password. Please check your credentials and try again.")

      expect(
        getAuthErrorMessage(
          { name: "AuthError", message: "Any other failure" } as unknown as Parameters<typeof getAuthErrorMessage>[0],
          "signIn"
        )
      ).toBe("Invalid email or password. Please check your credentials and try again.")
    })

    it("formats signUp email taken error cleanly", () => {
      expect(
        getAuthErrorMessage(
          { name: "AuthError", code: "user_already_exists", message: "User already registered" } as unknown as Parameters<typeof getAuthErrorMessage>[0],
          "signUp"
        )
      ).toBe("An account with this email already exists. Try signing in.")
    })
  })
})
