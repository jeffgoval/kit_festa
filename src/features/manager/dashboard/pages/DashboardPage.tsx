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
import { Button } from '@/ui/button'

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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className={`text-3xl font-bold tabular-nums ${highlight ? 'text-primary' : 'text-foreground'}`}>
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-primary/[0.06] via-background to-secondary/[0.06] p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Olá, {firstName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Resumo da operação — no estilo de painéis de locadoras: priorize reservas pendentes e mantenha o catálogo
          atualizado para a vitrine pública.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(({ to, label, desc, icon: Icon }) => (
            <Button key={to} variant="secondary" className="h-auto px-0 py-0" asChild>
              <Link
                to={to}
                className="inline-flex items-center gap-3 rounded-md px-4 py-3 text-left font-normal"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="block text-xs text-muted-foreground">{desc}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 opacity-50" />
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Indicadores</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
