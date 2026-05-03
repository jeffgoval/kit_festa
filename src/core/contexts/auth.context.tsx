import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/core/types'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    role: null,
    loading: true,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    setState((prev) => ({ ...prev, loading: true }))
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()

    setState((prev) => {
      if (prev.user?.id !== userId) return prev
      return {
        ...prev,
        profile: data ?? null,
        role: (data?.role as UserRole | undefined) ?? null,
        loading: false,
      }
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) void fetchProfile(session.user.id)
      else setState((prev) => ({ ...prev, loading: false }))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        setState((prev) => ({
          ...prev,
          session: null,
          user: null,
          profile: null,
          role: null,
          loading: false,
        }))
        return
      }

      setState((prev) => ({ ...prev, session, user: session.user }))

      if (event === 'TOKEN_REFRESHED') return

      void fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}
