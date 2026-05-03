import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'

export function useManagerTenant() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''

  return useQuery({
    queryKey: ['manager-tenant', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('id', tenantId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}
