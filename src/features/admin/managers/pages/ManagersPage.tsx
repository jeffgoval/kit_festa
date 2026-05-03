import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Skeleton } from '@/ui/skeleton'
import type { Profile, Tenant } from '@/core/types'

interface ManagerWithTenant extends Profile {
  tenants: Pick<Tenant, 'id' | 'name'> | null
}

export function ManagersPage() {
  const { data: managers = [], isLoading } = useQuery({
    queryKey: ['admin-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, tenants(id, name)')
        .eq('role', 'gestor')
        .order('full_name')
      if (error) throw error
      return data as ManagerWithTenant[]
    },
  })

  const { data: tenants = [] } = useQuery({
    queryKey: queryKeys.tenants.all(),
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('id, name').eq('is_active', true).order('name')
      if (error) throw error
      return data as Pick<Tenant, 'id' | 'name'>[]
    },
  })

  const { mutate: assignTenant } = useMutation({
    mutationFn: async ({ profileId, tenantId }: { profileId: string; tenantId: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', profileId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-managers'] }),
  })

  return (
    <div className="min-w-0">
      <h1 className="mb-4 text-lg font-bold sm:mb-6 sm:text-xl">Gestores</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-background [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Nome
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Loja vinculada
                </th>
                <th className="min-w-[11rem] px-2 py-2.5 sm:w-48 sm:px-4 sm:py-3" />
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 font-medium leading-snug sm:px-4 sm:py-3">
                    {m.full_name ?? m.id.slice(0, 8)}
                  </td>
                  <td className="max-w-[8rem] truncate px-3 py-2.5 text-muted-foreground sm:max-w-none sm:px-4 sm:py-3">
                    {m.tenants?.name ?? '—'}
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3">
                    <select
                      value={m.tenant_id ?? ''}
                      onChange={(e) => assignTenant({ profileId: m.id, tenantId: e.target.value })}
                      className="h-9 w-full min-w-[10rem] max-w-[14rem] rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-none"
                    >
                      <option value="">Sem loja</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
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
