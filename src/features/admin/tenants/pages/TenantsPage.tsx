import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import type { Tenant } from '@/core/types'

export function TenantsPage() {
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: queryKeys.tenants.all(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Tenant[]
    },
  })

  const { mutate: toggleActive } = useMutation({
    mutationFn: async ({ id, is_active }: Pick<Tenant, 'id' | 'is_active'>) => {
      const { error } = await supabase
        .from('tenants')
        .update({ is_active: !is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all() }),
  })

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold sm:text-xl">Lojas</h1>
        <Button asChild className="w-full shrink-0 sm:w-auto">
          <Link to="/admin/tenants/novo">
            <Plus className="size-4" />
            Nova loja
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-background [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Loja
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Slug
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Status
                </th>
                <th className="min-w-[8.5rem] px-2 py-2.5 sm:px-4 sm:py-3" />
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium leading-snug sm:px-4 sm:py-3">{t.name}</td>
                  <td className="max-w-[7rem] truncate px-3 py-2.5 font-mono text-xs text-muted-foreground sm:max-w-none sm:px-4 sm:py-3 sm:text-sm">
                    {t.slug}
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <Badge variant={t.is_active ? 'success' : 'outline'}>
                      {t.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/tenants/${t.id}`}>Editar</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(t)}
                      >
                        {t.is_active ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
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
