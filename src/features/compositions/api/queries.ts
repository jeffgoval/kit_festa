import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/client'
import type { CompositionWithItems } from '@/core/types'

export function useCompositions(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.compositions.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compositions')
        .select(`
          *,
          composition_items (
            *,
            items (*, item_images(*), categories(id, name))
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .eq('is_public', true)
        .order('name')

      if (error) throw error
      return data as CompositionWithItems[]
    },
    enabled: !!tenantId,
  })
}

export function useComposition(tenantId: string, slug: string) {
  return useQuery({
    queryKey: queryKeys.compositions.detail(tenantId, slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compositions')
        .select(`
          *,
          composition_items (
            *,
            items (*, item_images(*), categories(id, name))
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('is_public', true)
        .single()

      if (error) throw error
      return data as CompositionWithItems
    },
    enabled: !!tenantId && !!slug,
  })
}
