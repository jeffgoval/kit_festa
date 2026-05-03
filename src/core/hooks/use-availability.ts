import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/client'

interface AvailabilityResult {
  available: number
  loading: boolean
  isAvailable: boolean
}

export function useItemAvailability(
  itemId: string,
  eventDate: string | null,
  totalQuantity: number,
): AvailabilityResult {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.items.availability(itemId, eventDate ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_item_availability', {
        p_item_id: itemId,
        p_event_date: eventDate!,
      })
      if (error) throw error
      return data as number
    },
    enabled: !!eventDate,
    staleTime: 1000 * 30,   // availability is time-sensitive — refresh often
  })

  const available = eventDate ? (data ?? totalQuantity) : totalQuantity

  return {
    available,
    loading: isLoading,
    isAvailable: available > 0,
  }
}

// Batch availability check for the cart (all items at once)
export function useCartAvailability(
  items: { itemId: string; quantity: number; totalQuantity: number }[],
  eventDate: string | null,
) {
  const { data, isLoading } = useQuery({
    queryKey: ['cart-availability', items.map((i) => i.itemId).join(','), eventDate],
    queryFn: async () => {
      const results = await Promise.all(
        items.map(async (item) => {
          const { data, error } = await supabase.rpc('get_item_availability', {
            p_item_id: item.itemId,
            p_event_date: eventDate!,
          })
          if (error) throw error
          return { itemId: item.itemId, available: data as number }
        }),
      )
      return Object.fromEntries(results.map((r) => [r.itemId, r.available]))
    },
    enabled: !!eventDate && items.length > 0,
    staleTime: 1000 * 30,
  })

  const unavailableItems = items.filter((item) => {
    const avail = data?.[item.itemId] ?? item.totalQuantity
    return avail < item.quantity
  })

  return {
    availabilityMap: data ?? {},
    unavailableItems,
    hasConflicts: unavailableItems.length > 0,
    loading: isLoading,
  }
}
