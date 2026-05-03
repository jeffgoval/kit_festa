import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/client'
import type { ItemWithImages } from '@/core/types'

export function useManagerItems(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.items.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, item_images(*), categories(id, name)')
        .eq('tenant_id', tenantId)
        .order('name')

      if (error) throw error
      return data as ItemWithImages[]
    },
    enabled: !!tenantId,
  })
}

export function useManagerItem(tenantId: string, itemId: string) {
  return useQuery({
    queryKey: ['manager-item', tenantId, itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, item_images(*), categories(id, name)')
        .eq('tenant_id', tenantId)
        .eq('id', itemId)
        .single()

      if (error) throw error
      return data as ItemWithImages
    },
    enabled: !!tenantId && !!itemId,
  })
}
