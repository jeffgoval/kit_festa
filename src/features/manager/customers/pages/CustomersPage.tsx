import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryKeys } from '@/lib/query/client'
import { Skeleton } from '@/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { Customer } from '@/core/types'

export function CustomersPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''

  const { data: customers = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')
      if (error) throw error
      return data as Customer[]
    },
    enabled: !!tenantId,
  })

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold">Clientes</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Telefone</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">E-mail</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Desde</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{c.phone}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{c.email ?? '—'}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatDate(c.created_at.split('T')[0])}
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
