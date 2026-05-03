import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Building2, LogOut, PanelLeft, Users, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/button'

const NAV = [
  { to: '/admin/tenants', icon: Building2, label: 'Lojas' },
  { to: '/admin/gestores', icon: Users, label: 'Gestores' },
]

export function AdminRoot() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  return (
    <div className="flex h-[100dvh] min-h-0 w-full max-w-[100vw] overflow-hidden bg-muted/20">
      <button
        type="button"
        aria-label="Fechar menu"
        className={cn(
          'fixed inset-0 z-40 bg-foreground/35 backdrop-blur-[2px] transition-opacity md:hidden',
          mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(17.5rem,90vw)] flex-col border-r border-border bg-background shadow-lg transition-transform duration-200 ease-out md:relative md:z-0 md:w-52 md:translate-x-0 md:shadow-none',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-4">
          <span className="truncate text-sm font-bold text-primary">Recriar Admin</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-3">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-border p-3">
          <Button
            variant="ghost"
            className="h-11 w-full justify-start gap-2 text-muted-foreground"
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <PanelLeft className="size-5" />
          </Button>
          <span className="truncate text-sm font-semibold text-foreground">Painel admin</span>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2 sm:px-5 sm:pb-4 sm:pt-3 md:px-8 md:pb-6 md:pt-4 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
