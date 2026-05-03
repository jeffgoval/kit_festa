import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Layers,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react'
import { useTenant } from '@/core/contexts/tenant.context'
import { Button } from '@/ui/button'
import { supabase } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { useCompositions } from '@/features/compositions/api/queries'

interface LandingItemRow {
  id: string
  name: string
  slug: string
  rental_price: number | null
  item_images: { image_url: string; is_primary: boolean; sort_order: number }[] | null
}

function useLandingItems(tenantId: string) {
  return useQuery({
    queryKey: ['store-landing-items', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('id, name, slug, rental_price, item_images(image_url, is_primary, sort_order)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .eq('is_public', true)
        .order('name')
        .limit(8)

      if (error) throw error
      return data as LandingItemRow[]
    },
    enabled: !!tenantId,
  })
}

function itemThumb(item: LandingItemRow) {
  const imgs = item.item_images ?? []
  const primary = imgs.find((i) => i.is_primary) ?? imgs[0]
  return primary?.image_url ?? null
}

/* Wavy SVG divider */
function WaveDivider({ flip = false, className = '' }: { flip?: boolean; className?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[50px] w-full md:h-[70px]">
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          fill="rgb(var(--color-background))"
          opacity="0.3"
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          fill="rgb(var(--color-background))"
          opacity="0.5"
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          fill="rgb(var(--color-background))"
        />
      </svg>
    </div>
  )
}

export function StoreLandingPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()
  const { tenant } = useTenant()
  const tenantId = tenant?.id ?? ''

  const { data: compositions = [] } = useCompositions(tenantId)
  const { data: items = [], isLoading: itemsLoading } = useLandingItems(tenantId)

  const featuredCompositions = compositions.slice(0, 4)
  const waHref = tenant?.whatsapp_number
    ? `https://wa.me/${tenant.whatsapp_number.replace(/\D/g, '')}`
    : null

  const headline =
    tenant?.description?.trim() ||
    `Aluguel de peças e kits para montar a festa com a cara da ${tenant?.name ?? 'sua família'}.`

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════ */}
      {/* Hero — gradiente vibrante + pattern     */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative overflow-x-hidden bg-gradient-to-br from-primary/[0.08] via-secondary/[0.06] to-background pb-0 pt-8 sm:pt-12 md:pt-20">
        {/* Decorative dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgb(var(--color-primary) / 0.15) 1.5px, transparent 1.5px)`,
            backgroundSize: '28px 28px',
          }}
        />
        {/* Decorative blurred circle */}
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-secondary/20 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-primary/15 blur-[80px]" />

        <div className="container relative mx-auto pb-16 sm:pb-20 md:pb-24">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1.5 text-[11px] font-medium text-primary shadow-card backdrop-blur sm:mb-6 sm:px-5 sm:py-2 sm:text-xs">
              <Sparkles className="size-3.5 shrink-0 animate-bounce-soft" />
              <span className="min-w-0 text-left leading-snug sm:text-center">
                Locação para festas · Monte do seu jeito
              </span>
            </div>
            <h1 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {tenant?.name ?? 'Sua loja'}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base md:text-lg">
              {headline}
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Button size="lg" className="h-12 px-6 text-base shadow-lg sm:h-13 sm:px-8" asChild>
                <Link to={`/${tenantSlug}/itens`}>
                  Ver catálogo
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-primary/25 bg-background/80 backdrop-blur sm:h-13"
                asChild
              >
                <Link to={`/${tenantSlug}/composicoes`}>Composições prontas</Link>
              </Button>
              {waHref && (
                <Button size="lg" variant="whatsapp" className="h-12 sm:h-13" asChild>
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-1 size-4" />
                    Falar no WhatsApp
                  </a>
                </Button>
              )}
            </div>
            <p className="mt-8 text-xs text-muted-foreground/70">
              Escolha itens avulsos ou kits montados · Carrinho com data do evento · Solicitação enviada à loja
            </p>
          </div>
        </div>

        {/* Wavy transition to next section */}
        <WaveDivider />
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Pilares — como funciona                 */}
      {/* ═══════════════════════════════════════ */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Como funciona
            </span>
            <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Três jeitos de montar sua decoração
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3 animate-stagger">
            {[
              {
                icon: Package,
                title: 'Peças avulsas',
                text: 'Navegue por categorias, veja fotos e disponibilidade na data da festa, e monte o kit ideal.',
                to: `/${tenantSlug}/itens`,
                color: 'from-primary/20 to-primary/5',
              },
              {
                icon: Layers,
                title: 'Composições prontas',
                text: 'Inspire-se em combinações já pensadas pela loja — adicione ao carrinho e ajuste quantidades.',
                to: `/${tenantSlug}/composicoes`,
                color: 'from-secondary/30 to-secondary/10',
              },
              {
                icon: ShoppingBag,
                title: 'Carrinho & solicitação',
                text: 'Revise itens e data do evento antes de enviar. A loja confirma disponibilidade e valores.',
                to: `/${tenantSlug}/minha-festa`,
                color: 'from-accent/20 to-accent/5',
              },
            ].map(({ icon: Icon, title, text, to, color }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-primary transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5">
                  Explorar
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Destaques composições                   */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-muted/40 py-16 md:py-20">
        {/* Wavy top */}
        <WaveDivider flip className="absolute left-0 right-0 top-0" />

        <div className="container relative z-10 mx-auto pt-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Composições em destaque</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Pacotes sugeridos pela loja — combinações temáticas prontas para sua festa.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/${tenantSlug}/composicoes`}>
                Ver todas
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {featuredCompositions.length === 0 ? (
            <div className="mt-12 rounded-3xl border-2 border-dashed border-border bg-background/60 px-6 py-16 text-center backdrop-blur">
              <Layers className="mx-auto size-12 text-muted-foreground/30" />
              <p className="mt-4 text-base font-semibold text-foreground">Em breve composições aqui</p>
              <p className="mt-2 text-sm text-muted-foreground">
                O gestor pode cadastrar composições públicas no painel.
              </p>
              <Button className="mt-8" asChild>
                <Link to={`/${tenantSlug}/itens`}>Explorar itens</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
              {featuredCompositions.map((c) => (
                <Link
                  key={c.id}
                  to={`/${tenantSlug}/composicoes/${c.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border/60 bg-background shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card-hover"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/15 via-secondary/20 to-accent/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">{c.name}</h3>
                    {c.suggested_price != null && (
                      <p className="text-sm font-bold text-primary">{formatPrice(c.suggested_price)}</p>
                    )}
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {c.description ?? 'Ver detalhes e itens inclusos'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Itens do acervo                         */}
      {/* ═══════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Peças do acervo</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Alguns itens disponíveis para locação — preços e estoque na ficha de cada produto.
              </p>
            </div>
            <Button asChild>
              <Link to={`/${tenantSlug}/itens`} className="inline-flex items-center gap-2">
                <Search className="size-4" />
                Ver catálogo completo
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
            {itemsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
                ))
              : items.slice(0, 8).map((item) => {
                  const thumb = itemThumb(item)
                  return (
                    <Link
                      key={item.id}
                      to={`/${tenantSlug}/itens/${item.slug}`}
                      className="group overflow-hidden rounded-2xl border border-border/60 bg-background shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover"
                    >
                      <div className="img-hover-zoom aspect-square bg-muted">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Package className="size-10 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">{item.name}</p>
                        <p className="mt-1.5 text-sm font-bold text-primary">
                          {formatPrice(item.rental_price)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
          </div>

          {!itemsLoading && items.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              Ainda não há itens públicos cadastrados. Volte em breve ou fale com a loja pelo rodapé.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* Prova social / confiança                */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary/[0.08] via-secondary/[0.05] to-background p-6 text-center shadow-card sm:rounded-3xl sm:p-10 md:p-14">
            <div className="mx-auto flex justify-center gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-current drop-shadow-sm" />
              ))}
            </div>
            <blockquote className="mt-6 font-display text-lg font-medium leading-relaxed text-foreground sm:text-xl md:text-2xl">
              &ldquo;A decoração fica na memória afetiva da família — por isso priorizamos clareza no catálogo e no
              pedido.&rdquo;
            </blockquote>
            <p className="mt-5 text-sm text-muted-foreground">
              Transparência nos passos: escolher → conferir data → enviar solicitação à loja.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* CTA final — gradiente multi-color       */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-14 text-primary-foreground md:py-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-60 w-60 rounded-full bg-secondary/20 blur-[80px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rounded-full bg-accent/20 blur-[80px]" />

        <div className="container relative z-10 mx-auto flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Já pensou na sua decoração?</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed opacity-80">
              Confira o acervo online ou peça ajuda direto à loja. Valores e disponibilidade são confirmados no
              atendimento.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="h-12 shadow-lg" asChild>
              <Link to={`/${tenantSlug}/itens`}>Ver peças</Link>
            </Button>
            {waHref ? (
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  Solicitar orçamento
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to={`/${tenantSlug}/minha-festa`}>Minha festa</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
