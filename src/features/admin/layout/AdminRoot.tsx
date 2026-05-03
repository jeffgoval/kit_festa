import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Building2, Users, LogOut, Menu } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'

const NAV = [
  { to: '/admin/tenants', icon: Building2, label: 'Lojas' },
  { to: '/admin/gestores', icon: Users, label: 'Gestores' },
]

export function AdminRoot() {
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] min-h-0 overflow-hidden bg-muted/20">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={cn(
          'flex w-52 shrink-0 flex-col border-r border-border bg-background transition-transform duration-200 ease-out',
          'fixed inset-y-0 left-0 z-50 md:static md:z-auto',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-sm font-bold text-primary">Recriar Admin</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={async () => {
              await supabase.auth.signOut()
              navigate('/app/login')
            }}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <span className="truncate text-sm font-semibold text-foreground">Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
