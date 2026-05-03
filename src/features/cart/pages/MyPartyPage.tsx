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
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-24 text-center">
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Minha Festa</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Item list */}
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const isUnavailable = unavailableIds.has(entry.itemId)

            return (
              <div
                key={entry.itemId}
                className={`flex gap-4 rounded-lg border p-4 ${
                  isUnavailable ? 'border-destructive bg-destructive/5' : 'border-border bg-background'
                }`}
              >
                {entry.imageUrl ? (
                  <img
                    src={entry.imageUrl}
                    alt={entry.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-muted" />
                )}

                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.name}</p>
                  {entry.unitPrice != null && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(entry.unitPrice)} / un.
                    </p>
                  )}
                  {isUnavailable && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3" />
                      Indisponível na data selecionada
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => removeItem(entry.itemId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <div className="flex items-center gap-1 rounded border border-border">
                    <button
                      onClick={() => updateQuantity(entry.itemId, entry.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="min-w-[2ch] text-center text-sm">{entry.quantity}</span>
                    <button
                      onClick={() => updateQuantity(entry.itemId, entry.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center hover:bg-muted"
                      disabled={entry.quantity >= entry.totalAvailable}
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  {entry.unitPrice != null && (
                    <p className="text-sm font-medium">
                      {formatPrice(entry.unitPrice * entry.quantity)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          <Button variant="outline" asChild className="mt-2 w-fit">
            <Link to={`/${tenantSlug}/itens`}>+ Adicionar mais itens</Link>
          </Button>
        </div>

        {/* Summary sidebar */}
        <div className="flex flex-col gap-4 h-fit rounded-lg border border-border p-6">
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
