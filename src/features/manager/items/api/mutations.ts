import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryClient, queryKeys } from '@/lib/query/client'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'
import { slugify } from '@/lib/utils'

export function useCreateItem(tenantId: string) {
  return useMutation({
    mutationFn: async (values: Omit<TablesInsert<'items'>, 'tenant_id' | 'slug'> & { name: string }) => {
      const slug = slugify(values.name)
      const { data, error } = await supabase
        .from('items')
        .insert({ ...values, tenant_id: tenantId, slug })
        .select('id')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all(tenantId) })
    },
  })
}

export function useUpdateItem(tenantId: string) {
  return useMutation({
    mutationFn: async ({ id, ...values }: TablesUpdate<'items'> & { id: string }) => {
      const { error } = await supabase
        .from('items')
        .update(values)
        .eq('id', id)
        .eq('tenant_id', tenantId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all(tenantId) })
    },
  })
}

export function useDeleteItem(tenantId: string) {
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('items')
        .update({ is_active: false })
        .eq('id', itemId)
        .eq('tenant_id', tenantId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all(tenantId) })
    },
  })
}

export function useUploadItemImage(tenantId: string) {
  return useMutation({
    mutationFn: async ({
      itemId,
      file,
      isPrimary = false,
    }: {
      itemId: string
      file: File
      isPrimary?: boolean
    }) => {
      const ext = file.name.split('.').pop()
      const path = `${tenantId}/items/${itemId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(path)

      const { error: dbError } = await supabase.from('item_images').insert({
        tenant_id: tenantId,
        item_id: itemId,
        image_url: publicUrl,
        is_primary: isPrimary,
        sort_order: 0,
      })

      if (dbError) throw dbError
      return publicUrl
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager-item', tenantId, variables.itemId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all(tenantId) })
    },
  })
}

export function useDeleteItemImage(tenantId: string) {
  return useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('item_images')
        .delete()
        .eq('id', imageId)
        .eq('tenant_id', tenantId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all(tenantId) })
    },
  })
}
