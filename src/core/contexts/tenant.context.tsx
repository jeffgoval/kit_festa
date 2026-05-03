import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/client'
import { hexToRgbString } from '@/lib/utils'
import type { Tenant } from '@/core/types'

interface TenantContextValue {
  tenant: Tenant | null
  loading: boolean
  notFound: boolean
}

const TenantContext = createContext<TenantContextValue | null>(null)

// Applied in order — first defined in tenant row wins, fallback to default
const DEFAULT_PALETTE = {
  primary_color: '#8B5CF6',
  secondary_color: '#F9A8D4',
  accent_color: '#F59E0B',
  background_color: '#FFFFFF',
  text_color: '#111827',
}

function applyTheme(tenant: Tenant) {
  const root = document.documentElement
  const p = {
    primary_color: tenant.primary_color ?? DEFAULT_PALETTE.primary_color,
    secondary_color: tenant.secondary_color ?? DEFAULT_PALETTE.secondary_color,
    accent_color: tenant.accent_color ?? DEFAULT_PALETTE.accent_color,
    background_color: tenant.background_color ?? DEFAULT_PALETTE.background_color,
    text_color: tenant.text_color ?? DEFAULT_PALETTE.text_color,
  }

  root.style.setProperty('--color-primary', hexToRgbString(p.primary_color))
  root.style.setProperty('--color-secondary', hexToRgbString(p.secondary_color))
  root.style.setProperty('--color-accent', hexToRgbString(p.accent_color))
  root.style.setProperty('--color-background', hexToRgbString(p.background_color))
  root.style.setProperty('--color-foreground', hexToRgbString(p.text_color))
  root.style.setProperty('--color-ring', hexToRgbString(p.primary_color))
}

function resetTheme() {
  const root = document.documentElement
  root.style.removeProperty('--color-primary')
  root.style.removeProperty('--color-secondary')
  root.style.removeProperty('--color-accent')
  root.style.removeProperty('--color-background')
  root.style.removeProperty('--color-foreground')
  root.style.removeProperty('--color-ring')
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()

  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: queryKeys.tenant(tenantSlug ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug!)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!tenantSlug,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (tenant) applyTheme(tenant)
    return () => resetTheme()
  }, [tenant])

  return (
    <TenantContext.Provider
      value={{ tenant: tenant ?? null, loading: isLoading, notFound: isError }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside <TenantProvider>')
  return ctx
}

export function useTenantOrThrow(): Tenant {
  const { tenant } = useTenant()
  if (!tenant) throw new Error('Tenant not loaded')
  return tenant
}
