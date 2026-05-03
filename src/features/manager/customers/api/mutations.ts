import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryClient, queryKeys } from '@/lib/query/client'

export function useUpsertCustomer(tenantId: string) {
  return useMutation({
    mutationFn: async (payload: {
      name: string
      phone: string
      email?: string | null
      address?: string | null
      notes?: string | null
    }) => {
      const { data, error } = await supabase
        .from('customers')
        .upsert(
          {
            tenant_id: tenantId,
            name: payload.name.trim(),
            phone: payload.phone.trim(),
            email: payload.email?.trim() || null,
            address: payload.address?.trim() || null,
            notes: payload.notes?.trim() || null,
          },
          { onConflict: 'tenant_id,phone' },
        )
        .select('id')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all(tenantId) })
    },
  })
}
