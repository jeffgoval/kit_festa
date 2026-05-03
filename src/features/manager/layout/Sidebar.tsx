import { Link, NavLink } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Package,
  Tag,
  Layers,
  Store,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useManagerTenant } from '@/core/hooks/use-manager-tenant'
import { Button } from '@/ui/button'

interface SidebarProps {
  mobileOpen?: boolean
  onNavigate?: () => void
}

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/reservas', icon: CalendarCheck, label: 'Reservas' },
  { to: '/app/clientes', icon: Users, label: 'Clientes' },
  { to: '/app/itens', icon: Package, label: 'Itens' },
  { to: '/app/categorias', icon: Tag, label: 'Categorias' },
  { to: '/app/composicoes', icon: Layers, label: 'Composições' },
  { to: '/app/minha-loja', icon: Store, label: 'Minha Loja' },
  { to: '/app/perfil', icon: User, label: 'Meu Perfil' },
]

export function Sidebar({ mobileOpen = false, onNavigate }: SidebarProps) {
  const { data: store } = useManagerTenant()

  return (
    <aside
      className={cn(
        'flex w-56 shrink-0 flex-col border-r border-border bg-muted/30 transition-transform duration-200 ease-out',
        'fixed inset-y-0 left-0 z-50 md:static md:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-bold tracking-tight text-primary">Recriar</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background hover:text-foreground',
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {store?.slug && (
        <div className="border-t border-border p-3">
          <Button variant="secondary" size="sm" className="w-full justify-center gap-2" asChild>
            <Link
              to={`/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onNavigate?.()}
            >
              <ExternalLink className="size-3.5" />
              Loja pública
            </Link>
          </Button>
        </div>
      )}
    </aside>
  )
}
