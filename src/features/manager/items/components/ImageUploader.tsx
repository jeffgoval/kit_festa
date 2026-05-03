import { useRef } from 'react'
import { Upload, Trash2, Star } from 'lucide-react'
import type { ItemImage } from '@/core/types'

interface ImageUploaderProps {
  images: ItemImage[]
  onUpload: (file: File, isPrimary: boolean) => Promise<void>
  onDelete: (imageId: string) => Promise<void>
}

const ACCEPTED = 'image/png,image/jpeg,image/webp'
const MAX_SIZE_MB = 5

export function ImageUploader({ images, onUpload, onDelete }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  const hasPrimary = images.some((i) => i.is_primary)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`)
      return
    }

    await onUpload(file, !hasPrimary)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {sorted.map((img) => (
          <div key={img.id} className="group relative">
            <img
              src={img.image_url}
              alt={img.alt_text ?? ''}
              className="h-24 w-24 rounded-lg border border-border object-cover"
            />
            {img.is_primary && (
              <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] text-primary-foreground">
                <Star className="size-2.5" /> Principal
              </span>
            )}
            <button
              onClick={() => onDelete(img.id)}
              className="absolute right-1 top-1 hidden rounded bg-black/60 p-1 group-hover:flex"
            >
              <Trash2 className="size-3 text-white" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Upload className="size-5" />
          <span className="text-xs">Adicionar</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        PNG, JPG ou WebP · máx. {MAX_SIZE_MB}MB
      </p>
    </div>
  )
}
