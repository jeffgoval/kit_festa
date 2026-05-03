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
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lojas</h1>
        <Button asChild>
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
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Loja</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="w-32 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{t.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={t.is_active ? 'success' : 'outline'}>
                      {t.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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
