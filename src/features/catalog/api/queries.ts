import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/client'
import type { ItemWithImages } from '@/core/types'

interface UseItemsOptions {
  tenantId: string
  categoryId?: string | null
  search?: string
  eventDate?: string | null
}

export function useItems({ tenantId, categoryId, search }: UseItemsOptions) {
  return useQuery({
    queryKey: queryKeys.items.filtered(tenantId, { categoryId, search }),
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*, item_images(*), categories(id, name)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .eq('is_public', true)
        .order('name')

      if (categoryId) query = query.eq('category_id', categoryId)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data as ItemWithImages[]
    },
    enabled: !!tenantId,
  })
}

export function useItem(tenantId: string, slug: string) {
  return useQuery({
    queryKey: queryKeys.items.detail(tenantId, slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, item_images(*), categories(id, name)')
        .eq('tenant_id', tenantId)
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('is_public', true)
        .single()

      if (error) throw error
      return data as ItemWithImages
    },
    enabled: !!tenantId && !!slug,
  })
}

export function useCategories(tenantId: string) {
  return useQuery({
    queryKey: queryKeys.categories.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('sort_order')

      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })
}
