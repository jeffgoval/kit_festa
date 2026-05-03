import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTenantOrThrow } from '@/core/contexts/tenant.context'
import { useCartStore } from '@/core/stores/cart.store'
import { useSubmitReservation } from '../api/mutations'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { formatPrice, formatDate } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().min(8, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
  acceptedTerms: z.boolean().refine((v) => v, 'Você precisa aceitar as condições'),
})

type FormData = z.infer<typeof schema>

export function CheckoutPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const tenant = useTenantOrThrow()
  const navigate = useNavigate()

  const entries = useCartStore((s) => s.entries)
  const eventDate = useCartStore((s) => s.eventDate)
  const total = useCartStore((s) => s.total())
  const originCompositionIds = useCartStore((s) => s.originCompositionIds)
  const clearCart = useCartStore((s) => s.clearCart)

  const { mutateAsync, isPending } = useSubmitReservation()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '', address: '', notes: '', acceptedTerms: false },
  })

  async function onSubmit(data: FormData) {
    if (!eventDate) return

    await mutateAsync({
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      eventDate,
      address: data.address ?? '',
      publicNotes: data.notes ?? '',
      originCompositionIds,
      items: entries,
      customer: { name: data.name, phone: data.phone, email: data.email || undefined },
    })

    clearCart()
    navigate(`/${tenantSlug}/solicitacao-enviada`)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Solicitar reserva</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome *</label>
              <Input {...form.register('name')} placeholder="Seu nome" />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">WhatsApp / Telefone *</label>
              <Input {...form.register('phone')} placeholder="(11) 99999-9999" />
              {form.formState.errors.phone && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">E-mail</label>
            <Input {...form.register('email')} type="email" placeholder="email@exemplo.com" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Endereço / Bairro</label>
            <Input {...form.register('address')} placeholder="Rua, número ou bairro do evento" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Observações</label>
            <textarea
              {...form.register('notes')}
              rows={3}
              placeholder="Alguma informação adicional para a loja?"
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 resize-none"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...form.register('acceptedTerms')}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary"
            />
            <span className="text-sm text-muted-foreground">
              Estou ciente que esta é uma solicitação sujeita à confirmação da loja.
            </span>
          </label>
          {form.formState.errors.acceptedTerms && (
            <p className="text-xs text-destructive">{form.formState.errors.acceptedTerms.message}</p>
          )}

          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar solicitação'}
          </Button>
        </form>

        {/* Order summary */}
        <div className="h-fit rounded-lg border border-border p-5">
          <h2 className="mb-3 font-semibold">Resumo</h2>

          {eventDate && (
            <p className="mb-3 text-sm">
              <span className="text-muted-foreground">Data: </span>
              <strong>{formatDate(eventDate)}</strong>
            </p>
          )}

          <div className="flex flex-col gap-2 text-sm">
            {entries.map((e) => (
              <div key={e.itemId} className="flex justify-between gap-2">
                <span className="truncate text-muted-foreground">
                  {e.quantity}× {e.name}
                </span>
                {e.unitPrice != null && (
                  <span className="shrink-0 font-medium">{formatPrice(e.unitPrice * e.quantity)}</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between border-t border-border pt-3">
            <span className="text-sm font-medium">Total estimado</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
