/**
 * Origem pública do site (protocolo + host, sem barra final).
 * Em produção atrás de CDN/proxy, defina VITE_PUBLIC_SITE_URL para bater com o que está no Supabase (convites, magic link, recovery).
 */
export function getPublicSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL?.trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** URL de retorno e-mail (convite / recuperação) — precisa estar em Redirect URLs no Supabase. */
export function getAuthEmailRedirectUrl(): string {
  return `${getPublicSiteOrigin()}/app/login`
}
