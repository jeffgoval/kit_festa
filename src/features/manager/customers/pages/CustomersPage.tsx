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
    <div className="min-w-0">
      <h1 className="mb-4 text-lg font-bold sm:mb-6 sm:text-xl">Clientes</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-background [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Nome
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Telefone
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  E-mail
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground lg:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Desde
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium leading-snug sm:px-4 sm:py-3">{c.name}</td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell sm:px-4 sm:py-3">
                    {c.phone}
                  </td>
                  <td className="hidden max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground md:table-cell sm:max-w-none sm:px-4 sm:py-3">
                    {c.email ?? '—'}
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground lg:table-cell sm:px-4 sm:py-3">
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
