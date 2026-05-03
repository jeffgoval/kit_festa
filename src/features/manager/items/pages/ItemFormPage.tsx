import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthContext } from '@/core/contexts/auth.context'
import { useManagerItem } from '../api/queries'
import { useCreateItem, useUpdateItem, useUploadItemImage, useDeleteItemImage } from '../api/mutations'
import { useCategories } from '@/features/catalog/api/queries'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Skeleton } from '@/ui/skeleton'
import { ImageUploader } from '../components/ImageUploader'
import { toast } from '@/ui/use-toast'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  category_id: z.string().nullable().optional(),
  description: z.string().optional(),
  total_quantity: z.coerce.number().int().min(0),
  rental_price: z.coerce.number().min(0).nullable().optional(),
  replacement_cost: z.coerce.number().min(0).nullable().optional(),
  condition: z.enum(['new', 'good', 'worn', 'maintenance', 'unavailable']),
  is_active: z.boolean(),
  is_public: z.boolean(),
  internal_notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const itemConditions = ['new', 'good', 'worn', 'maintenance', 'unavailable'] as const

function parseItemCondition(value: string): FormData['condition'] {
  if ((itemConditions as readonly string[]).includes(value)) {
    return value as FormData['condition']
  }
  return 'good'
}

export function ItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''

  const { data: item, isLoading } = useManagerItem(tenantId, id ?? '')
  const { data: categories = [] } = useCategories(tenantId)
  const { mutateAsync: createItem, isPending: creating } = useCreateItem(tenantId)
  const { mutateAsync: updateItem, isPending: updating } = useUpdateItem(tenantId)
  const { mutateAsync: uploadImage } = useUploadItemImage(tenantId)
  const { mutateAsync: deleteImage } = useDeleteItemImage(tenantId)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category_id: null,
      description: '',
      total_quantity: 1,
      rental_price: null,
      replacement_cost: null,
      condition: 'good',
      is_active: true,
      is_public: true,
      internal_notes: '',
    },
  })

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        category_id: item.category_id,
        description: item.description ?? '',
        total_quantity: item.total_quantity,
        rental_price: item.rental_price,
        replacement_cost: item.replacement_cost,
        condition: parseItemCondition(item.condition),
        is_active: item.is_active,
        is_public: item.is_public,
        internal_notes: item.internal_notes ?? '',
      })
    }
  }, [item, form])

  async function onSubmit(data: FormData) {
    try {
      if (isEditing) {
        await updateItem({ id: id!, ...data })
        toast({ title: 'Item atualizado' })
      } else {
        await createItem(data as Parameters<typeof createItem>[0])
        toast({ title: 'Item criado' })
        navigate('/app/itens')
      }
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">{isEditing ? 'Editar item' : 'Novo item'}</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Nome *</label>
            <Input {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Categoria</label>
            <select
              {...form.register('category_id')}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Condição</label>
            <select
              {...form.register('condition')}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="new">Novo</option>
              <option value="good">Bom estado</option>
              <option value="worn">Desgastado</option>
              <option value="maintenance">Em manutenção</option>
              <option value="unavailable">Indisponível</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Quantidade total</label>
            <Input type="number" min={0} {...form.register('total_quantity')} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Preço de aluguel (R$)</label>
            <Input type="number" step="0.01" min={0} {...form.register('rental_price')} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Descrição</label>
          <textarea
            {...form.register('description')}
            rows={3}
            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...form.register('is_active')} className="rounded" />
            Ativo
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...form.register('is_public')} className="rounded" />
            Visível na loja pública
          </label>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Notas internas</label>
          <textarea
            {...form.register('internal_notes')}
            rows={2}
            placeholder="Visível apenas para gestores"
            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>

        {isEditing && item && (
          <div>
            <label className="mb-3 block text-sm font-medium">Fotos</label>
            <ImageUploader
              images={item.item_images}
              onUpload={async (file, isPrimary) => {
                await uploadImage({ itemId: id!, file, isPrimary })
              }}
              onDelete={async (imageId) => {
                await deleteImage(imageId)
              }}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/app/itens')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
