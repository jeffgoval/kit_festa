import { Link, useParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useTenantOrThrow } from '@/core/contexts/tenant.context'
import { useCompositions } from '../api/queries'
import { Skeleton } from '@/ui/skeleton'
import { formatPrice } from '@/lib/utils'

export function CompositionsPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const tenant = useTenantOrThrow()
  const { data: compositions = [], isLoading } = useCompositions(tenant.id)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Composições Prontas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use como ponto de partida e monte do seu jeito.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : compositions.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          Nenhuma composição disponível no momento.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {compositions.map((comp) => {
            const coverImage = comp.composition_items[0]?.items?.item_images?.[0]

            return (
              <Link
                key={comp.id}
                to={`/${tenantSlug}/composicoes/${comp.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md"
              >
                {coverImage ? (
                  <img
                    src={coverImage.image_url}
                    alt={comp.name}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    <Sparkles className="size-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-2 p-4">
                  {comp.theme && (
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {comp.theme}
                    </span>
                  )}
                  <h2 className="font-semibold leading-tight group-hover:text-primary">
                    {comp.name}
                  </h2>
                  {comp.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{comp.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {comp.composition_items.length} itens
                    </span>
                    {comp.suggested_price != null && (
                      <span className="text-sm font-medium">
                        {formatPrice(comp.suggested_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
