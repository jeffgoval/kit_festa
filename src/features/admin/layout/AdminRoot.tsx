import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Building2, Users, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'

const NAV = [
  { to: '/admin/tenants', icon: Building2, label: 'Lojas' },
  { to: '/admin/gestores', icon: Users, label: 'Gestores' },
]

export function AdminRoot() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-background">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-sm font-bold text-primary">Recriar Admin</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
