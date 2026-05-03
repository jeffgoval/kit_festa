import { Link, useParams, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react'
import { useCartStore } from '@/core/stores/cart.store'
import { useCartAvailability } from '@/core/hooks/use-availability'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { formatPrice } from '@/lib/utils'

export function MyPartyPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const navigate = useNavigate()

  const entries = useCartStore((s) => s.entries)
  const eventDate = useCartStore((s) => s.eventDate)
  const total = useCartStore((s) => s.total())
  const setEventDate = useCartStore((s) => s.setEventDate)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const { unavailableItems, hasConflicts, loading: checkingAvailability } = useCartAvailability(
    entries.map((e) => ({ itemId: e.itemId, quantity: e.quantity, totalQuantity: e.totalAvailable })),
    eventDate,
  )

  const unavailableIds = new Set(unavailableItems.map((i) => i.itemId))

  if (entries.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center gap-4 py-16 text-center sm:py-24">
        <p className="text-lg font-medium">Sua festa está vazia</p>
        <p className="text-sm text-muted-foreground">
          Adicione itens do acervo para começar.
        </p>
        <Button asChild>
          <Link to={`/${tenantSlug}/itens`}>Ver acervo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 sm:py-8">
      <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Minha Festa</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* Item list */}
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const isUnavailable = unavailableIds.has(entry.itemId)

            return (
              <div
                key={entry.itemId}
                className={`flex flex-col gap-3 rounded-lg border p-3 sm:gap-4 sm:p-4 ${
                  isUnavailable ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                }`}
              >
                <div className="flex gap-3">
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.name}
                      className="h-16 w-16 shrink-0 rounded-md object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                    />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-md bg-muted sm:h-[4.5rem] sm:w-[4.5rem]" />
                  )}

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-sm font-medium leading-snug">{entry.name}</p>
                    {entry.unitPrice != null && (
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(entry.unitPrice)} / un.
                      </p>
                    )}
                    {isUnavailable && (
                      <p className="flex items-start gap-1.5 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        <span>Indisponível na data selecionada</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <div className="flex items-center gap-1 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(entry.itemId, entry.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center hover:bg-muted"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-[2ch] px-1 text-center text-sm font-medium tabular-nums">
                      {entry.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(entry.itemId, entry.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center hover:bg-muted"
                      disabled={entry.quantity >= entry.totalAvailable}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.unitPrice != null && (
                      <p className="text-sm font-semibold tabular-nums">
                        {formatPrice(entry.unitPrice * entry.quantity)}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(entry.itemId)}
                      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remover item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          <Button variant="outline" asChild className="mt-1 w-full sm:mt-2 sm:w-fit">
            <Link to={`/${tenantSlug}/itens`}>+ Adicionar mais itens</Link>
          </Button>
        </div>

        {/* Summary sidebar */}
        <div className="flex h-fit flex-col gap-4 rounded-lg border border-border p-4 sm:p-6">
          <h2 className="font-semibold">Resumo</h2>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
              <Calendar className="size-4" />
              Data do evento
            </label>
            <Input
              type="date"
              value={eventDate ?? ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setEventDate(e.target.value || null)}
            />
          </div>

          {hasConflicts && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>Alguns itens estão indisponíveis na data selecionada. Ajuste as quantidades ou escolha outra data.</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total estimado</span>
            <span className="text-lg font-bold">{formatPrice(total)}</span>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!eventDate || hasConflicts || checkingAvailability}
            onClick={() => navigate(`/${tenantSlug}/minha-festa/checkout`)}
          >
            Solicitar reserva
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Após o envio, a loja entrará em contato para confirmar.
          </p>
        </div>
      </div>
    </div>
  )
}
