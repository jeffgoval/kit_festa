import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/core/hooks/use-auth'
import { PageSpinner } from '@/ui/page-spinner'

interface RequireAuthProps {
  children: ReactNode
  redirectTo: string
}

export function RequireAuth({ children, redirectTo }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <>{children}</>
}
