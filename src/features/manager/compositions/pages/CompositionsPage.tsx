import { Link } from 'react-router-dom'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import type { Composition } from '@/core/types'

export function CompositionsPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''

  const { data: compositions = [], isLoading } = useQuery({
    queryKey: queryKeys.compositions.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compositions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')
      if (error) throw error
      return data as Composition[]
    },
    enabled: !!tenantId,
  })

  const { mutate: togglePublic } = useMutation({
    mutationFn: async ({ id, is_public }: Pick<Composition, 'id' | 'is_public'>) => {
      const { error } = await supabase
        .from('compositions')
        .update({ is_public: !is_public })
        .eq('id', id)
        .eq('tenant_id', tenantId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.compositions.all(tenantId) }),
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Composições</h1>
        <Button asChild>
          <Link to="/app/composicoes/nova">
            <Plus className="size-4" />
            Nova composição
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Tema</th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground lg:table-cell">Preço</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Visível</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {compositions.map((comp) => (
                <tr key={comp.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{comp.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{comp.theme ?? '—'}</td>
                  <td className="hidden px-4 py-3 text-right lg:table-cell">
                    {formatPrice(comp.suggested_price)}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublic(comp)}>
                      {comp.is_public
                        ? <Eye className="size-4 text-green-600" />
                        : <EyeOff className="size-4 text-muted-foreground" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" asChild className="size-8">
                      <Link to={`/app/composicoes/${comp.id}`}>
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
