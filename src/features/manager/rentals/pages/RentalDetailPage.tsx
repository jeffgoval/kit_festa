import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { formatDate, formatPrice } from '@/lib/utils'
import { RENTAL_STATUS_LABEL } from '@/core/types'
import { toast } from '@/ui/use-toast'
import type { RentalWithDetails, Rental } from '@/core/types'

function useRental(tenantId: string, rentalId: string) {
  return useQuery({
    queryKey: queryKeys.rentals.detail(tenantId, rentalId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customers(*),
          rental_items(*, items(id, name, slug))
        `)
        .eq('tenant_id', tenantId)
        .eq('id', rentalId)
        .single()

      if (error) throw error
      return data as RentalWithDetails
    },
    enabled: !!tenantId && !!rentalId,
  })
}

function useUpdateRentalStatus(tenantId: string, rentalId: string) {
  return useMutation({
    mutationFn: async (status: Rental['status']) => {
      // RB-007: revalidate availability before confirming
      if (status === 'confirmed') {
        const avail = await supabase.rpc('validate_rental_availability', { p_rental_id: rentalId })
        if (avail.error) throw avail.error
        if (!avail.data) throw new Error('Um ou mais itens não estão disponíveis para esta data.')
      }

      const { error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', rentalId)
        .eq('tenant_id', tenantId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.detail(tenantId, rentalId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.all(tenantId) })
      queryClient.invalidateQueries({ queryKey: ['dashboard', tenantId] })
    },
  })
}

export function RentalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const { data: rental, isLoading } = useRental(tenantId, id!)
  const { mutateAsync: updateStatus, isPending } = useUpdateRentalStatus(tenantId, id!)

  async function changeStatus(status: Rental['status']) {
    try {
      await updateStatus(status)
      toast({ title: `Reserva ${RENTAL_STATUS_LABEL[status].toLowerCase()}` })
    } catch (err) {
      toast({
        title: 'Erro ao atualizar status',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (!rental) return null

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/app/reservas')}
        className="mb-4 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Voltar às reservas
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Reserva #{rental.id.slice(0, 8)}</h1>
        <Badge
          variant={
            rental.status === 'confirmed' ? 'success'
            : rental.status === 'cancelled' ? 'destructive'
            : rental.status === 'completed' ? 'outline'
            : 'warning'
          }
        >
          {RENTAL_STATUS_LABEL[rental.status]}
        </Badge>
      </div>

      <div className="flex flex-col gap-6">
        {/* Customer */}
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cliente</h2>
          <p className="font-medium">{rental.customers.name}</p>
          <p className="text-sm text-muted-foreground">{rental.customers.phone}</p>
          {rental.customers.email && (
            <p className="text-sm text-muted-foreground">{rental.customers.email}</p>
          )}
        </div>

        {/* Event info */}
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Evento</h2>
          <p className="text-sm"><span className="text-muted-foreground">Data: </span>{formatDate(rental.event_date)}</p>
          {rental.address && (
            <p className="text-sm"><span className="text-muted-foreground">Endereço: </span>{rental.address}</p>
          )}
          {rental.public_notes && (
            <p className="mt-2 text-sm text-muted-foreground">{rental.public_notes}</p>
          )}
        </div>

        {/* Items */}
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Itens</h2>
          <div className="flex flex-col gap-2">
            {rental.rental_items.map((ri) => (
              <div key={ri.id} className="flex items-center justify-between text-sm">
                <span>{ri.quantity}× {ri.item_name_snapshot}</span>
                {ri.unit_price != null && (
                  <span className="text-muted-foreground">{formatPrice(ri.unit_price * ri.quantity)}</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-medium">
            <span>Total</span>
            <span>{formatPrice(rental.total_price)}</span>
          </div>
        </div>

        {/* Actions */}
        {rental.status === 'pending' && (
          <div className="flex gap-3">
            <Button onClick={() => changeStatus('confirmed')} disabled={isPending}>
              Confirmar reserva
            </Button>
            <Button variant="outline" onClick={() => changeStatus('cancelled')} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        )}

        {rental.status === 'confirmed' && (
          <div className="flex gap-3">
            <Button onClick={() => changeStatus('completed')} disabled={isPending}>
              Finalizar reserva
            </Button>
            <Button variant="outline" onClick={() => changeStatus('cancelled')} disabled={isPending}>
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
