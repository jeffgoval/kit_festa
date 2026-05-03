import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) fetchProfile(session.user.id)
      else setState((prev) => ({ ...prev, loading: false }))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session, user: session?.user ?? null }))
      if (session?.user) fetchProfile(session.user.id)
      else setState((prev) => ({ ...prev, profile: null, role: null, loading: false }))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setState((prev) => ({
      ...prev,
      profile: data,
      role: data?.role ?? null,
      loading: false,
    }))
  }

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}
