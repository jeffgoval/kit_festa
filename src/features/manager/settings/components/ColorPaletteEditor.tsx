import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { hexToRgbString } from '@/lib/utils'

interface ColorField {
  field: string
  label: string
  description: string
}

const COLOR_FIELDS: ColorField[] = [
  { field: 'primary_color', label: 'Cor primária', description: 'Botões, links e destaques principais' },
  { field: 'secondary_color', label: 'Cor secundária', description: 'Elementos de apoio e badges' },
  { field: 'accent_color', label: 'Cor de destaque', description: 'Alertas e acentos pontuais' },
  { field: 'background_color', label: 'Cor de fundo', description: 'Fundo geral da loja' },
  { field: 'text_color', label: 'Cor do texto', description: 'Texto principal' },
]

/** Garante #RRGGBB em minúsculas (input type=color costuma devolver hex válido; normalizamos #RGB). */
function normalizeHexColor(hex: string): string {
  const h = hex.trim()
  const m3 = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(h)
  if (m3) {
    const [r, g, b] = [m3[1], m3[2], m3[3]]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  const m6 = /^#([0-9a-fA-F]{6})$/.exec(h)
  if (m6) return `#${m6[1].toLowerCase()}`
  const m8 = /^#([0-9a-fA-F]{8})$/.exec(h)
  if (m8) return `#${m8[1].slice(0, 6).toLowerCase()}`
  return h.startsWith('#') ? h : `#${h}`
}

function applyPreviewCssVar(field: string, hex: string) {
  const cssVar = field.replace(/_color$/, '').replace(/_/g, '-')
  document.documentElement.style.setProperty(`--color-${cssVar}`, hexToRgbString(hex))
}

export function ColorPaletteEditor<T extends FieldValues>({ form }: { form: UseFormReturn<T> }) {
  const { control, watch } = form
  const values = watch()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {COLOR_FIELDS.map(({ field, label, description }) => (
        <div key={field} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Controller
            name={field as Path<T>}
            control={control}
            render={({ field: { value, onChange } }) => {
              const hex = typeof value === 'string' && value ? normalizeHexColor(value) : '#000000'
              return (
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => {
                      const next = normalizeHexColor(e.target.value)
                      onChange(next)
                      applyPreviewCssVar(field, next)
                    }}
                    className="sr-only"
                  />
                  <span
                    className="block h-10 w-10 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                </label>
              )
            }}
          />
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {(values as Record<string, string>)[field] ?? '—'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
