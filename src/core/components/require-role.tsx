import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useRole } from '@/core/hooks/use-auth'
import type { UserRole } from '@/core/types'

interface RequireRoleProps {
  children: ReactNode
  allow: UserRole[]
  fallback?: string
}

export function RequireRole({ children, allow, fallback = '/' }: RequireRoleProps) {
  const role = useRole()

  if (!role || !allow.includes(role)) {
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
