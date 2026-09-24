/* eslint-disable react-refresh/only-export-components */
import type { AuthError, Session, User } from "@supabase/supabase-js"
import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { supabase } from "@/lib/supabase"

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) {
          return
        }
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) {
          return
        }
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return
      }
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signIn: async (email, password) => {
        try {
          return await supabase.auth.signInWithPassword({ email, password })
        } catch {
          return { error: new Error("Unable to sign in") as AuthError }
        }
      },
      signUp: async (email, password) => {
        try {
          return await supabase.auth.signUp({ email, password })
        } catch {
          return { error: new Error("Unable to sign up") as AuthError }
        }
      },
      signOut: async () => {
        try {
          return await supabase.auth.signOut()
        } catch {
          return { error: new Error("Unable to sign out") as AuthError }
        }
      },
    }),
    [loading, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
