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
    <div>
      <h1 className="mb-6 text-xl font-bold">Reservas</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
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
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data evento</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{rental.customers.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(rental.event_date)}</td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    {formatPrice(rental.total_price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[rental.status]}>
                      {RENTAL_STATUS_LABEL[rental.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/app/reservas/${rental.id}`}
                      className="text-xs text-primary hover:underline"
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
