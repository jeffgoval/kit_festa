import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarCheck,
  Clock,
  Package,
  AlertTriangle,
  Plus,
  Store,
  ArrowRight,
} from 'lucide-react'
import { useAuthContext } from '@/core/contexts/auth.context'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'

function useManagerDashboard(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard', tenantId],
    queryFn: async () => {
      const [pending, confirmed, items, unavailable] = await Promise.all([
        supabase
          .from('rentals')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'pending'),
        supabase
          .from('rentals')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('status', 'confirmed'),
        supabase
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('is_active', true),
        supabase
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .in('condition', ['maintenance', 'unavailable']),
      ])

      return {
        pending: pending.count ?? 0,
        confirmed: confirmed.count ?? 0,
        items: items.count ?? 0,
        unavailable: unavailable.count ?? 0,
      }
    },
    enabled: !!tenantId,
  })
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number | undefined
  loading: boolean
  highlight?: boolean
}

function StatCard({ icon: Icon, label, value, loading, highlight }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardHeader className="gap-1 p-4 pb-2 sm:p-6 sm:pb-2">
        <CardTitle className="flex items-start gap-2 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
          <Icon className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0">{label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p
            className={`text-2xl font-bold tabular-nums sm:text-3xl ${highlight ? 'text-primary' : 'text-foreground'}`}
          >
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

const QUICK_ACTIONS = [
  {
    to: '/app/reservas',
    label: 'Ver reservas',
    desc: 'Pendentes e confirmadas',
    icon: CalendarCheck,
  },
  { to: '/app/itens/novo', label: 'Novo item', desc: 'Cadastrar no acervo', icon: Plus },
  { to: '/app/minha-loja', label: 'Aparência da loja', desc: 'Logo, cores e textos', icon: Store },
] as const

export function DashboardPage() {
  const { profile, user } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const { data, isLoading } = useManagerDashboard(tenantId)
  const firstName = profile?.full_name?.split(/\s+/)[0] ?? user?.email?.split('@')[0] ?? 'Gestor'

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0">
      <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.06] p-4 shadow-sm sm:mb-8 sm:p-6 md:p-8">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Olá, {firstName}</h1>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {QUICK_ACTIONS.map(({ to, label, desc, icon: Icon }) => (
            <Link key={to} to={to} className="group block min-w-0">
              <Card className="h-full min-h-[5.25rem] border-border/80 bg-background/90 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:min-h-0">
                <CardContent className="flex h-full items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{desc}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-50 transition-all group-hover:translate-x-0.5 group-hover:opacity-90" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:mb-4 sm:text-sm">
        Indicadores
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Reservas pendentes"
          value={data?.pending}
          loading={isLoading}
          highlight
        />
        <StatCard
          icon={CalendarCheck}
          label="Reservas confirmadas"
          value={data?.confirmed}
          loading={isLoading}
        />
        <StatCard icon={Package} label="Itens no acervo" value={data?.items} loading={isLoading} />
        <StatCard
          icon={AlertTriangle}
          label="Itens indisponíveis / manutenção"
          value={data?.unavailable}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
