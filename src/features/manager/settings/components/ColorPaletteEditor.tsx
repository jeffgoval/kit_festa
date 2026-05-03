import type { UseFormReturn } from 'react-hook-form'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ColorPaletteEditor({ form }: { form: UseFormReturn<any> }) {
  const values = form.watch()

  function handleChange(field: string, hex: string) {
    form.setValue(field, hex)
    // Live preview via CSS vars
    const cssVar = field.replace(/_color$/, '').replace(/_/g, '-')
    document.documentElement.style.setProperty(
      `--color-${cssVar}`,
      hexToRgbString(hex),
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {COLOR_FIELDS.map(({ field, label, description }) => (
        <div key={field} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={values[field] ?? '#000000'}
              onChange={(e) => handleChange(field, e.target.value)}
              className="sr-only"
            />
            <span
              className="block h-10 w-10 rounded-md border border-border shadow-sm"
              style={{ backgroundColor: values[field] ?? '#000000' }}
            />
          </label>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
