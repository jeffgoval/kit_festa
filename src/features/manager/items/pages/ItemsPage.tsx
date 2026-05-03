import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '@/core/contexts/auth.context'
import { useManagerItems } from '../api/queries'
import { useUpdateItem } from '../api/mutations'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import { ITEM_CONDITION_LABEL } from '@/core/types'

export function ItemsPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const { data: items = [], isLoading } = useManagerItems(tenantId)
  const { mutate: updateItem } = useUpdateItem(tenantId)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Itens</h1>
        <Button asChild>
          <Link to="/app/itens/novo">
            <Plus className="size-4" />
            Novo item
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Categoria</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground sm:table-cell">Qtd.</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Preço</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Condição</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.item_images?.[0] ? (
                        <img
                          src={item.item_images[0].image_url}
                          alt={item.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {item.categories?.name ?? '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-right sm:table-cell">{item.total_quantity}</td>
                  <td className="hidden px-4 py-3 text-right lg:table-cell">
                    {formatPrice(item.rental_price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        item.condition === 'maintenance' || item.condition === 'unavailable'
                          ? 'destructive'
                          : item.condition === 'worn'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {ITEM_CONDITION_LABEL[item.condition]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        updateItem({ id: item.id, is_public: !item.is_public })
                      }
                      title={item.is_public ? 'Visível ao público' : 'Oculto do público'}
                    >
                      {item.is_public ? (
                        <Eye className="size-4 text-green-600" />
                      ) : (
                        <EyeOff className="size-4 text-muted-foreground" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" asChild className="size-8">
                      <Link to={`/app/itens/${item.id}`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
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
