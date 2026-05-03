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
    <div className="min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold sm:text-xl">Itens</h1>
        <Button asChild className="w-full shrink-0 sm:w-auto">
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
        <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-background [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Item
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Categoria
                </th>
                <th className="hidden px-3 py-2.5 text-right text-xs font-medium text-muted-foreground sm:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Qtd.
                </th>
                <th className="hidden px-3 py-2.5 text-right text-xs font-medium text-muted-foreground lg:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Preço
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Condição
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Status
                </th>
                <th className="w-16 px-2 py-2.5 sm:w-20 sm:px-4 sm:py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      {item.item_images?.[0] ? (
                        <img
                          src={item.item_images[0].image_url}
                          alt={item.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted" />
                      )}
                      <span className="min-w-0 font-medium leading-snug">{item.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground md:table-cell sm:px-4 sm:py-3">
                    {item.categories?.name ?? '—'}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right sm:table-cell sm:px-4 sm:py-3">
                    {item.total_quantity}
                  </td>
                  <td className="hidden px-3 py-2.5 text-right lg:table-cell sm:px-4 sm:py-3">
                    {formatPrice(item.rental_price)}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
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
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <button
                      type="button"
                      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md hover:bg-muted"
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
                  <td className="px-2 py-2 sm:px-4 sm:py-3">
                    <Button variant="ghost" size="icon" asChild className="size-9 sm:size-8">
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
