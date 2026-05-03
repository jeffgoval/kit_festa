import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Sparkles, Share2 } from 'lucide-react'
import { useTenantOrThrow } from '@/core/contexts/tenant.context'
import { useCartStore } from '@/core/stores/cart.store'
import { useComposition } from '../api/queries'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import type { CartEntry } from '@/core/types'

export function CompositionDetailPage() {
  const { tenantSlug, compositionSlug } = useParams<{ tenantSlug: string; compositionSlug: string }>()
  const tenant = useTenantOrThrow()
  const navigate = useNavigate()
  const { data: composition, isLoading } = useComposition(tenant.id, compositionSlug!)
  const addCompositionBase = useCartStore((s) => s.addCompositionBase)

  function handleUseAsBase() {
    if (!composition) return

    const entries: CartEntry[] = composition.composition_items.map((ci) => ({
      itemId: ci.item_id,
      name: ci.items.name,
      slug: ci.items.slug,
      imageUrl: ci.items.item_images?.[0]?.image_url ?? null,
      unitPrice: ci.items.rental_price,
      quantity: ci.quantity,
      totalAvailable: ci.items.total_quantity,
      compositionId: composition.id,
    }))

    addCompositionBase(composition.id, entries)
    navigate(`/${tenantSlug}/minha-festa`)
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: composition?.name ?? '', url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-5 w-32" />
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (!composition) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to={`/${tenantSlug}/composicoes`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Composições
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {composition.theme && (
            <span className="text-sm font-medium uppercase tracking-wide text-primary">
              {composition.theme}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-bold">{composition.name}</h1>
          {composition.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {composition.description}
            </p>
          )}

          <div className="mt-8">
            <h2 className="mb-4 text-base font-semibold">Itens sugeridos</h2>
            <div className="flex flex-col gap-3">
              {composition.composition_items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((ci) => {
                  const img = ci.items.item_images?.[0]
                  return (
                    <div key={ci.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      {img ? (
                        <img
                          src={img.image_url}
                          alt={ci.items.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                          <Sparkles className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ci.items.name}</p>
                        {ci.items.rental_price != null && (
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(ci.items.rental_price)} / un.
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm text-muted-foreground">× {ci.quantity}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Sticky sidebar */}
        <div className="lg:sticky lg:top-24 flex flex-col gap-4 h-fit rounded-lg border border-border p-6">
          {composition.suggested_price != null && (
            <div>
              <p className="text-xs text-muted-foreground">Preço sugerido</p>
              <p className="text-2xl font-bold">{formatPrice(composition.suggested_price)}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Você pode remover, alterar ou adicionar itens depois de usar como base.
          </p>

          <Button onClick={handleUseAsBase} size="lg">
            <Sparkles className="size-4" />
            Usar como base
          </Button>

          <Button variant="outline" onClick={handleShare}>
            <Share2 className="size-4" />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  )
}
