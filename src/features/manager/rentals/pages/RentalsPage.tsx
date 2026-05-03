import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryKeys } from '@/lib/query/client'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { formatDate, formatPrice } from '@/lib/utils'
import { RENTAL_STATUS_LABEL } from '@/core/types'
import type { RentalWithDetails, Rental } from '@/core/types'

const STATUS_VARIANT: Record<Rental['status'], 'warning' | 'success' | 'destructive' | 'outline'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'destructive',
  completed: 'outline',
}

const FILTERS: { value: Rental['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export function RentalsPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const [statusFilter, setStatusFilter] = useState<Rental['status'] | 'all'>('all')

  const { data: rentals = [], isLoading } = useQuery({
    queryKey: queryKeys.rentals.filtered(tenantId, { status: statusFilter }),
    queryFn: async () => {
      let query = supabase
        .from('rentals')
        .select('*, customers(id, name, phone), rental_items(id)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)

      const { data, error } = await query
      if (error) throw error
      return data as RentalWithDetails[]
    },
    enabled: !!tenantId,
  })

  return (
    <div className="min-w-0">
      <h1 className="mb-4 text-lg font-bold sm:mb-6 sm:text-xl">Reservas</h1>

      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 sm:text-sm ${
              statusFilter === f.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : rentals.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-background [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Cliente
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Data evento
                </th>
                <th className="hidden px-3 py-2.5 text-right text-xs font-medium text-muted-foreground md:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Total
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Status
                </th>
                <th className="w-14 px-2 py-2.5 sm:w-16 sm:px-4 sm:py-3" />
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="max-w-[10rem] px-3 py-2.5 font-medium leading-snug sm:max-w-none sm:px-4 sm:py-3">
                    {rental.customers.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground sm:px-4 sm:py-3">
                    {formatDate(rental.event_date)}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-2.5 text-right md:table-cell sm:px-4 sm:py-3">
                    {formatPrice(rental.total_price)}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <Badge variant={STATUS_VARIANT[rental.status]} className="text-[10px] sm:text-xs">
                      {RENTAL_STATUS_LABEL[rental.status]}
                    </Badge>
                  </td>
                  <td className="px-2 py-2.5 sm:px-4 sm:py-3">
                    <Link
                      to={`/app/reservas/${rental.id}`}
                      className="inline-flex min-h-9 items-center text-xs font-medium text-primary hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
