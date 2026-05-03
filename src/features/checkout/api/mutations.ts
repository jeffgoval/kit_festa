import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryClient, queryKeys } from '@/lib/query/client'
import type { TablesInsert } from '@/lib/supabase/database.types'
import type { CartEntry } from '@/core/types'

interface SubmitReservationPayload {
  tenantId: string
  tenantSlug: string
  eventDate: string
  address: string
  publicNotes: string
  originCompositionIds: string[]
  items: CartEntry[]
  customer: {
    name: string
    phone: string
    email?: string
  }
}

export function useSubmitReservation() {
  return useMutation({
    mutationFn: async (payload: SubmitReservationPayload) => {
      // 1. Upsert customer by phone (RB-009: customers belong to tenant)
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert(
          {
            tenant_id: payload.tenantId,
            name: payload.customer.name,
            phone: payload.customer.phone,
            email: payload.customer.email ?? null,
          },
          { onConflict: 'tenant_id,phone', ignoreDuplicates: false },
        )
        .select('id')
        .single()

      if (customerError) throw customerError

      // 2. Create rental
      const rentalInsert: TablesInsert<'rentals'> = {
        tenant_id: payload.tenantId,
        customer_id: customer.id,
        event_date: payload.eventDate,
        status: 'pending',
        source: 'web',
        subtotal: payload.items.reduce((s, e) => s + (e.unitPrice ?? 0) * e.quantity, 0),
        discount: 0,
        total_price: payload.items.reduce((s, e) => s + (e.unitPrice ?? 0) * e.quantity, 0),
        address: payload.address || null,
        public_notes: payload.publicNotes || null,
      }

      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .insert(rentalInsert)
        .select('id')
        .single()

      if (rentalError) throw rentalError

      // 3. Insert rental_items (item by item — RB-003)
      const rentalItems = payload.items.map((entry) => ({
        tenant_id: payload.tenantId,
        rental_id: rental.id,
        item_id: entry.itemId,
        composition_id: entry.compositionId ?? null,
        quantity: entry.quantity,
        unit_price: entry.unitPrice,
        item_name_snapshot: entry.name,
      }))

      const { error: itemsError } = await supabase.from('rental_items').insert(rentalItems)
      if (itemsError) throw itemsError

      // 4. Log composition origins if any
      if (payload.originCompositionIds.length > 0) {
        const compositionLogs = payload.originCompositionIds.map((id) => ({
          tenant_id: payload.tenantId,
          rental_id: rental.id,
          composition_id: id,
          composition_name_snapshot: id, // will be resolved on server if needed
          suggested_price_snapshot: null,
        }))
        await supabase.from('rental_compositions').insert(compositionLogs)
      }

      return rental.id
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all(variables.tenantId) })
    },
  })
}
