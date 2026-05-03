import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTenantOrThrow } from '@/core/contexts/tenant.context'
import { useCartStore } from '@/core/stores/cart.store'
import { useItems, useCategories } from '../api/queries'
import { ItemCard } from '../components/ItemCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { Skeleton } from '@/ui/skeleton'
import { Input } from '@/ui/input'

export function CatalogPage() {
  const tenant = useTenantOrThrow()
  const eventDate = useCartStore((s) => s.eventDate)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: categories = [] } = useCategories(tenant.id)
  const { data: items = [], isLoading } = useItems({
    tenantId: tenant.id,
    categoryId: selectedCategory,
    search: search || undefined,
    eventDate,
  })

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 flex flex-col gap-5">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Acervo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Explore todas as peças disponíveis para locação.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Buscar itens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Search className="size-12 text-muted-foreground/30" />
          <p className="mt-4 text-base font-medium text-foreground">Nenhum item encontrado.</p>
          <p className="mt-1 text-sm text-muted-foreground">Tente ajustar a busca ou filtro de categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 animate-stagger">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} eventDate={eventDate} />
          ))}
        </div>
      )}
    </div>
  )
}
