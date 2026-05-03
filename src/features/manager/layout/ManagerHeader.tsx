import { ExternalLink, LogOut, PanelLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { useManagerTenant } from '@/core/hooks/use-manager-tenant'
import { Button } from '@/ui/button'
import { Skeleton } from '@/ui/skeleton'

type ManagerHeaderProps = {
  onOpenMobileNav?: () => void
}

export function ManagerHeader({ onOpenMobileNav }: ManagerHeaderProps) {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const { data: store, isLoading } = useManagerTenant()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/app/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4 md:px-6">
      {onOpenMobileNav && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          aria-label="Abrir menu"
          onClick={onOpenMobileNav}
        >
          <PanelLeft className="size-5" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Painel</p>
        {isLoading ? (
          <Skeleton className="mt-0.5 h-5 w-40" />
        ) : (
          <p className="truncate text-sm font-semibold text-foreground">{store?.name ?? 'Minha loja'}</p>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {store?.slug && (
          <>
            <Button variant="ghost" size="icon" className="shrink-0 sm:hidden" asChild title="Ver loja pública">
              <Link to={`/${store.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="hidden shrink-0 sm:inline-flex" asChild>
              <Link to={`/${store.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 size-3.5" />
                Ver loja
              </Link>
            </Button>
          </>
        )}
        <span className="hidden max-w-[140px] truncate text-xs text-muted-foreground md:inline">
          {user?.email}
        </span>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
