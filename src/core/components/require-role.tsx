import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useRole } from '@/core/hooks/use-auth'
import type { UserRole } from '@/core/types'

interface RequireRoleProps {
  children: ReactNode
  allow: UserRole[]
  /** Destino quando o papel não tem acesso (default: rota adequada ao papel atual) */
  fallback?: string
}

function defaultFallbackForRole(role: UserRole | null): string {
  if (role === 'gestor' || role === 'admin') return '/app/dashboard'
  if (role === 'cliente') return '/'
  return '/app/login'
}

export function RequireRole({ children, allow, fallback }: RequireRoleProps) {
  const role = useRole()

  if (!role || !allow.includes(role)) {
    const to = fallback ?? defaultFallbackForRole(role)
    return <Navigate to={to} replace />
  }

  return <>{children}</>
}
