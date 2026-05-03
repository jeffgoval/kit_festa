import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LogIn, Menu, ShoppingBag, X } from 'lucide-react'
import { useTenant } from '@/core/contexts/tenant.context'
import { useCartStore } from '@/core/stores/cart.store'
import { Button } from '@/ui/button'
import { cn } from '@/lib/utils'

export function StoreHeader() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const { tenant } = useTenant()
  const itemCount = useCartStore((s) => s.itemCount())
  const [mobileOpen, setMobileOpen] = useState(false)

  const base = `/${tenantSlug}`
  const waHref = tenant?.whatsapp_number
    ? `https://wa.me/${tenant.whatsapp_number.replace(/\D/g, '')}`
    : null

  const navLinks = [
    { to: `${base}/itens`, label: 'Catálogo' },
    { to: `${base}/composicoes`, label: 'Composições' },
    { to: `${base}/minha-festa`, label: 'Minha festa' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-[72px] items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link
          to={base}
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
          onClick={() => setMobileOpen(false)}
        >
          {tenant?.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="h-10 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <span className="truncate text-xl font-bold tracking-tight text-primary">
              {tenant?.name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
              <span className="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-1/2" />
            </Link>
          ))}
          <Link
            to="/app/login"
            className="group relative ml-1 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <LogIn className="size-3.5" />
            Entrar
            <span className="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-1/2" />
          </Link>
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-2.5 text-sm font-medium text-[#25D366] transition-all hover:bg-[#25D366]/20 hover:shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5 px-3 md:hidden" asChild>
            <Link to="/app/login">
              <LogIn className="size-4" />
              Entrar
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative shrink-0">
            <Link to={`${base}/minha-festa`} aria-label="Carrinho">
              <ShoppingBag className="size-5" />
              {itemCount > 0 && (
                <span
                  className={cn(
                    'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center px-1',
                    'rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm',
                  )}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-border/60 bg-background md:hidden">
          <nav className="container flex flex-col gap-1 px-4 py-4">
            <Link
              to="/app/login"
              className="flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-medium text-primary transition-colors hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              <LogIn className="size-4 shrink-0" />
              Entrar (painel da loja)
            </Link>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-[#22c55e]"
                onClick={() => setMobileOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Falar no WhatsApp
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
