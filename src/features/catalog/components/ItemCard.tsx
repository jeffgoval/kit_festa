import { Link, useParams } from 'react-router-dom'
import { Plus, Share2 } from 'lucide-react'
import type { ItemWithImages } from '@/core/types'
import { useCartStore } from '@/core/stores/cart.store'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { formatPrice } from '@/lib/utils'
import { AvailabilityBadge } from './AvailabilityBadge'

interface ItemCardProps {
  item: ItemWithImages
  eventDate?: string | null
}

export function ItemCard({ item, eventDate }: ItemCardProps) {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const addItem = useCartStore((s) => s.addItem)

  const primaryImage = item.item_images.find((img) => img.is_primary) ?? item.item_images[0]

  function handleAdd() {
    addItem({
      itemId: item.id,
      name: item.name,
      slug: item.slug,
      imageUrl: primaryImage?.image_url ?? null,
      unitPrice: item.rental_price,
      quantity: 1,
      totalAvailable: item.total_quantity,
    })
  }

  function handleShare() {
    const url = `${window.location.origin}/${tenantSlug}/itens/${item.slug}`
    if (navigator.share) {
      navigator.share({ title: item.name, url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover">
      <Link to={`/${tenantSlug}/itens/${item.slug}`} className="img-hover-zoom block">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text ?? item.name}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground/50 text-sm">
            Sem foto
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {item.categories && (
          <Badge variant="secondary" className="w-fit text-[10px]">
            {item.categories.name}
          </Badge>
        )}

        <Link
          to={`/${tenantSlug}/itens/${item.slug}`}
          className="text-sm font-semibold leading-tight tracking-tight transition-colors hover:text-primary"
        >
          {item.name}
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex flex-col gap-1">
            {item.rental_price != null && (
              <span className="text-sm font-bold text-primary">
                {formatPrice(item.rental_price)}
              </span>
            )}
            {eventDate && (
              <AvailabilityBadge
                itemId={item.id}
                eventDate={eventDate}
                totalQuantity={item.total_quantity}
              />
            )}
          </div>

          <div className="flex gap-1.5">
            <Button variant="ghost" size="icon" onClick={handleShare} className="size-9 rounded-xl">
              <Share2 className="size-3.5" />
            </Button>
            <Button size="icon" onClick={handleAdd} className="size-9 rounded-xl shadow-sm">
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
