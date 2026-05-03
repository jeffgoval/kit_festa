import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, X } from 'lucide-react'
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

type SidebarProps = {
  /** Fecha o drawer no mobile após navegar ou ao tocar em fechar */
  onCloseMobileNav?: () => void
}

export function Sidebar({ onCloseMobileNav }: SidebarProps) {
  const { data: store } = useManagerTenant()

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-muted/30">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
        <span className="truncate text-sm font-bold tracking-tight text-primary">Recriar</span>
        {onCloseMobileNav && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="Fechar menu"
            onClick={onCloseMobileNav}
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => onCloseMobileNav?.()}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
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
        <div className="shrink-0 border-t border-border p-3">
          <Button variant="secondary" size="sm" className="w-full justify-center gap-2" asChild>
            <Link
              to={`/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onCloseMobileNav?.()}
            >
              <ExternalLink className="size-3.5" />
              Loja pública
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
