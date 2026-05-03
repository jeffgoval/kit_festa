import { Link, useParams } from 'react-router-dom'
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { useTenant } from '@/core/contexts/tenant.context'

export function StoreFooter() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const { tenant } = useTenant()
  if (!tenant) return null

  const base = `/${tenantSlug}`
  const waHref = tenant.whatsapp_number
    ? `https://wa.me/${tenant.whatsapp_number.replace(/\D/g, '')}`
    : null

  return (
    <footer className="relative overflow-hidden border-t border-foreground/10 bg-foreground text-background/90">
      {/* Decorative top curve */}
      <div className="absolute -top-px left-0 right-0 h-16 bg-background" style={{ clipPath: 'ellipse(55% 100% at 50% 0%)' }} />

      <div className="container mx-auto px-4 pb-10 pt-20 md:pb-12 md:pt-24">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <p className="font-display text-2xl font-semibold text-background">{tenant.name}</p>
            {tenant.description && (
              <p className="mt-3 max-w-md text-sm leading-relaxed text-background/60">{tenant.description}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {tenant.instagram_url && (
                <a
                  href={tenant.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-background/15 text-background/60 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow"
                  aria-label="Instagram"
                >
                  <Instagram className="size-4" />
                </a>
              )}
              {tenant.facebook_url && (
                <a
                  href={tenant.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-background/15 text-background/60 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-glow"
                  aria-label="Facebook"
                >
                  <Facebook className="size-4" />
                </a>
              )}
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-background/15 px-5 text-xs font-medium text-background/60 transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white hover:shadow-glow"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-background/40">Navegação</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <Link to={`${base}/itens`} className="text-background/70 transition-colors hover:text-primary">
                  Catálogo de itens
                </Link>
              </li>
              <li>
                <Link to={`${base}/composicoes`} className="text-background/70 transition-colors hover:text-primary">
                  Composições
                </Link>
              </li>
              <li>
                <Link to={`${base}/minha-festa`} className="text-background/70 transition-colors hover:text-primary">
                  Minha festa
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-background/40">Contato</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-background/60">
              {tenant.phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a href={`tel:${tenant.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-background">
                    {tenant.phone}
                  </a>
                </li>
              )}
              {tenant.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a href={`mailto:${tenant.email}`} className="break-all transition-colors hover:text-background">
                    {tenant.email}
                  </a>
                </li>
              )}
              {tenant.whatsapp_number && (
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#25D366]" />
                  <a href={waHref!} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-background">
                    WhatsApp {tenant.whatsapp_number}
                  </a>
                </li>
              )}
              {!tenant.phone && !tenant.email && !tenant.whatsapp_number && (
                <li className="text-xs text-background/40">Dados de contato podem ser configurados pela loja no painel.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-background/10 pt-8 text-center text-xs text-background/40 md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} {tenant.name}. Locação para festas.</p>
          <p className="flex items-center gap-1.5 md:justify-end">
            <MapPin className="size-3 shrink-0 opacity-70" />
            Atendimento conforme disponibilidade da loja
          </p>
        </div>
      </div>
    </footer>
  )
}
