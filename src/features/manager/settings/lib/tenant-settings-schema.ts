import { z } from 'zod'

/** Links sociais: aceita vazio ou texto (evita bloquear salvar por URL “solta” no banco). */
const socialLink = z.string().max(2048)

function isPlausibleEmail(s: string): boolean {
  return z.string().email().safeParse(s).success
}

export const tenantSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  phone: z.string().max(80),
  /** Vazio, texto livre (ex. identificador) ou e-mail completo se contiver @ */
  email: z
    .string()
    .max(200)
    .trim()
    .refine((s) => !s || !s.includes('@') || isPlausibleEmail(s), {
      message: 'Se o campo tiver @, use um e-mail completo (ex.: nome@provedor.com).',
    }),
  whatsapp_number: z.string().max(40),
  instagram_url: socialLink,
  facebook_url: socialLink,
  description: z.string().max(20000),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, 'Cor primária inválida'),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, 'Cor secundária inválida'),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, 'Cor de destaque inválida'),
  background_color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, 'Cor de fundo inválida'),
  text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, 'Cor do texto inválida'),
})

export type TenantSettingsForm = z.infer<typeof tenantSettingsSchema>

const HEX6 = /^#[0-9a-fA-F]{6}$/i

export function safeHex6(value: string | null | undefined, fallback: string): string {
  if (value && HEX6.test(value.trim())) return value.trim()
  return fallback
}

export function emptyTenantSettingsForm(): TenantSettingsForm {
  return {
    name: '',
    phone: '',
    email: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    description: '',
    primary_color: '#8B5CF6',
    secondary_color: '#F9A8D4',
    accent_color: '#F59E0B',
    background_color: '#FFFFFF',
    text_color: '#111827',
  }
}

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === '' ? null : t
}

/** Payload alinhado ao que o Postgres aceita (strings vazias → null nas colunas opcionais). */
export function tenantFormToUpdateRow(data: TenantSettingsForm) {
  return {
    name: data.name.trim(),
    phone: emptyToNull(data.phone),
    email: emptyToNull(data.email),
    whatsapp_number: emptyToNull(data.whatsapp_number),
    instagram_url: emptyToNull(data.instagram_url),
    facebook_url: emptyToNull(data.facebook_url),
    description: emptyToNull(data.description),
    primary_color: data.primary_color,
    secondary_color: data.secondary_color,
    accent_color: data.accent_color,
    background_color: data.background_color,
    text_color: data.text_color,
  }
}

export function formatSupabaseUserMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object') {
    const o = err as Record<string, unknown>
    if (typeof o.message === 'string' && o.message) return o.message
    if (typeof o.error_description === 'string') return o.error_description
    if (typeof o.details === 'string') return o.details
    if (typeof o.hint === 'string') return o.hint
  }
  return String(err)
}
