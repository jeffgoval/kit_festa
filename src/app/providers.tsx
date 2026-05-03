import { type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/core/contexts/auth.context'
import { Toaster } from '@/ui/toaster'
import { queryClient } from '@/lib/query/client'

interface AppProvidersProps {
  children: ReactNode
}

// Stack order matters: QueryClient → Auth → UI feedback
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
