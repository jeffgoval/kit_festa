import { useAuthContext } from '@/core/contexts/auth.context'
import type { UserRole } from '@/core/types'

export function useAuth() {
  return useAuthContext()
}

export function useRole(): UserRole | null {
  return useAuthContext().role
}

export function useHasRole(allowed: UserRole[]): boolean {
  const role = useRole()
  return role !== null && allowed.includes(role)
}
