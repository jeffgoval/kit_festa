import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Minus, Plus, Share2 } from 'lucide-react'
import { useTenantOrThrow } from '@/core/contexts/tenant.context'
import { useCartStore } from '@/core/stores/cart.store'
import { useItemAvailability } from '@/core/hooks/use-availability'
import { useItem } from '../api/queries'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import { AvailabilityBadge } from '../components/AvailabilityBadge'

export function ItemDetailPage() {
  const { tenantSlug, itemSlug } = useParams<{ tenantSlug: string; itemSlug: string }>()
  const tenant = useTenantOrThrow()
  const { data: item, isLoading } = useItem(tenant.id, itemSlug!)

  const addItem = useCartStore((s) => s.addItem)
  const eventDate = useCartStore((s) => s.eventDate)

  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)

  const { available } = useItemAvailability(
    item?.id ?? '',
    eventDate,
    item?.total_quantity ?? 0,
  )

  if (isLoading) {
    return (
      <div className="container mx-auto grid gap-10 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-5 w-1/2 rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!item) return null

  const sortedImages = [...item.item_images].sort((a, b) => a.sort_order - b.sort_order)
  const displayImages = sortedImages.length > 0 ? sortedImages : []

  function handleAdd() {
    if (!item) return
    const primaryImage = displayImages[0]
    addItem({
      itemId: item.id,
      name: item.name,
      slug: item.slug,
      imageUrl: primaryImage?.image_url ?? null,
      unitPrice: item.rental_price,
      quantity: qty,
      totalAvailable: available,
    })
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: item!.name, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Link
        to={`/${tenantSlug}/itens`}
        className="mb-8 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Voltar ao acervo
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-card">
            {displayImages.length > 0 ? (
              <img
                src={displayImages[activeImg].image_url}
                alt={displayImages[activeImg].alt_text ?? item.name}
                className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-muted text-sm text-muted-foreground">
                Sem foto
              </div>
            )}
          </div>

          {displayImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {displayImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                    i === activeImg
                      ? 'border-primary shadow-glow'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text ?? `Foto ${i + 1}`}
                    className="h-18 w-18 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {item.categories && (
            <Badge variant="secondary" className="w-fit">
              {item.categories.name}
            </Badge>
          )}

          <h1 className="font-display text-3xl font-bold tracking-tight">{item.name}</h1>

          {item.rental_price != null && (
            <p className="text-2xl font-bold text-primary">
              {formatPrice(item.rental_price)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">/ unidade</span>
            </p>
          )}

          {item.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          )}

          {eventDate && (
            <AvailabilityBadge
              itemId={item.id}
              eventDate={eventDate}
              totalQuantity={item.total_quantity}
            />
          )}

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">Quantidade</span>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-background active:scale-95"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-[2.5ch] text-center text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(available, q + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-background active:scale-95"
                disabled={qty >= available}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleAdd} disabled={available <= 0} className="flex-1 h-12 text-base shadow-lg">
              <Plus className="size-4" />
              Adicionar à minha festa
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} className="h-12 w-12">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
