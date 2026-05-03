/**
 * Sincroniza Site URL e Redirect URLs do Auth no projeto Supabase (Management API).
 * Requer no .env: SUPABASE_ACCESS_TOKEN (PAT com auth_config_write) e VITE_SUPABASE_URL.
 *
 * Uso: node scripts/supabase-sync-auth-url.mjs
 * Opcional: SITE_URL=https://... URI_ALLOW=https://.../**,http://localhost:5173/**
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const envPath = path.join(root, '.env')

function parseEnv(text) {
  const out = {}
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i === -1) continue
    const k = line.slice(0, i).trim()
    out[k] = line.slice(i + 1).trim()
  }
  return out
}

function projectRefFromSupabaseUrl(url) {
  try {
    const u = new URL(url)
    const host = u.hostname
    const m = host.match(/^([^.]+)\.supabase\.co$/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

const env = parseEnv(fs.readFileSync(envPath, 'utf8'))
const token = env.SUPABASE_ACCESS_TOKEN
const supabaseUrl = env.VITE_SUPABASE_URL
const siteUrl = (process.env.SITE_URL || env.VITE_PUBLIC_SITE_URL || 'https://festa.sistemasdigitais.com').replace(
  /\/$/,
  '',
)
const uriAllow =
  process.env.URI_ALLOW ||
  `${siteUrl}/**,http://127.0.0.1:5173/**,http://localhost:5173/**`

if (!token) {
  console.error('Defina SUPABASE_ACCESS_TOKEN no .env (Personal Access Token do Supabase).')
  process.exit(1)
}
if (!supabaseUrl) {
  console.error('Defina VITE_SUPABASE_URL no .env.')
  process.exit(1)
}

const ref = projectRefFromSupabaseUrl(supabaseUrl)
if (!ref) {
  console.error('Não foi possível extrair o project ref de VITE_SUPABASE_URL.')
  process.exit(1)
}

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    site_url: siteUrl,
    uri_allow_list: uriAllow,
  }),
})

if (!res.ok) {
  const t = await res.text()
  console.error(res.status, t)
  process.exit(1)
}

console.log('Auth atualizado:', { site_url: siteUrl, uri_allow_list: uriAllow })
