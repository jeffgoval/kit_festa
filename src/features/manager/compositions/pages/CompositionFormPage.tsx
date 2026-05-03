/**
 * Composition create/edit page.
 * Handles: metadata form + adding/removing items with quantities.
 *
 * Implementation follows the same pattern as ItemFormPage.
 * Extend with drag-to-reorder composition_items using a sortable library
 * (e.g. @dnd-kit/sortable) when needed.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryClient, queryKeys } from '@/lib/query/client'
import { useManagerItems } from '@/features/manager/items/api/queries'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { toast } from '@/ui/use-toast'
import { slugify } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1),
  theme: z.string().optional(),
  description: z.string().optional(),
  suggested_price: z.coerce.number().min(0).nullable().optional(),
  is_active: z.boolean(),
  is_public: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface CompositionItemEntry {
  item_id: string
  name: string
  quantity: number
  sort_order: number
}

export function CompositionFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''

  const [compItems, setCompItems] = useState<CompositionItemEntry[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')

  const { data: allItems = [] } = useManagerItems(tenantId)

  const { data: composition } = useQuery({
    queryKey: ['manager-composition', tenantId, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compositions')
        .select('*, composition_items(*, items(name))')
        .eq('tenant_id', tenantId)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    },
    enabled: isEditing,
  })

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', theme: '', description: '', suggested_price: null, is_active: true, is_public: true },
  })

  useEffect(() => {
    if (composition) {
      form.reset({
        name: composition.name,
        theme: composition.theme ?? '',
        description: composition.description ?? '',
        suggested_price: composition.suggested_price,
        is_active: composition.is_active,
        is_public: composition.is_public,
      })
      setCompItems(
        composition.composition_items.map((ci: { item_id: string; quantity: number; sort_order: number; items: { name: string } }) => ({
          item_id: ci.item_id,
          name: ci.items.name,
          quantity: ci.quantity,
          sort_order: ci.sort_order,
        })),
      )
    }
  }, [composition, form])

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const slug = slugify(data.name)

      let compositionId = id
      if (isEditing) {
        const { error } = await supabase
          .from('compositions')
          .update({ ...data, slug })
          .eq('id', id!)
          .eq('tenant_id', tenantId)
        if (error) throw error
      } else {
        const { data: created, error } = await supabase
          .from('compositions')
          .insert({ ...data, slug, tenant_id: tenantId })
          .select('id')
          .single()
        if (error) throw error
        compositionId = created.id
      }

      // Sync items: delete all then re-insert
      await supabase
        .from('composition_items')
        .delete()
        .eq('composition_id', compositionId!)
        .eq('tenant_id', tenantId)

      if (compItems.length > 0) {
        const { error } = await supabase.from('composition_items').insert(
          compItems.map((ci, i) => ({
            tenant_id: tenantId,
            composition_id: compositionId!,
            item_id: ci.item_id,
            quantity: ci.quantity,
            sort_order: i,
          })),
        )
        if (error) throw error
      }

      return compositionId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compositions.all(tenantId) })
      toast({ title: isEditing ? 'Composição atualizada' : 'Composição criada' })
      navigate('/app/composicoes')
    },
  })

  function addItem() {
    const item = allItems.find((i) => i.id === selectedItemId)
    if (!item) return
    if (compItems.some((ci) => ci.item_id === item.id)) return
    setCompItems((prev) => [
      ...prev,
      { item_id: item.id, name: item.name, quantity: 1, sort_order: prev.length },
    ])
    setSelectedItemId('')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">
        {isEditing ? 'Editar composição' : 'Nova composição'}
      </h1>

      <form onSubmit={form.handleSubmit((d) => save(d))} className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm">Nome *</label>
            <Input {...form.register('name')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm">Tema</label>
            <Input {...form.register('theme')} placeholder="Ex: Jardim, Tropical, Minimalista" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm">Preço sugerido (R$)</label>
            <Input type="number" step="0.01" min={0} {...form.register('suggested_price')} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm">Descrição</label>
            <textarea
              {...form.register('description')}
              rows={3}
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...form.register('is_active')} className="rounded" />
            Ativa
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...form.register('is_public')} className="rounded" />
            Visível na loja
          </label>
        </div>

        {/* Composition items */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Itens da composição</h2>

          <div className="mb-3 flex gap-2">
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="flex h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Selecionar item...</option>
              {allItems
                .filter((i) => !compItems.some((ci) => ci.item_id === i.id))
                .map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
            </select>
            <Button type="button" variant="outline" onClick={addItem} disabled={!selectedItemId}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </div>

          {compItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum item adicionado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {compItems.map((ci, i) => (
                <div key={ci.item_id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="flex-1 text-sm font-medium">{ci.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCompItems((prev) =>
                          prev.map((x, j) => j === i ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x)
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded border text-sm"
                    >−</button>
                    <span className="min-w-[2ch] text-center text-sm">{ci.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setCompItems((prev) =>
                          prev.map((x, j) => j === i ? { ...x, quantity: x.quantity + 1 } : x)
                        )
                      }
                      className="flex h-6 w-6 items-center justify-center rounded border text-sm"
                    >+</button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompItems((prev) => prev.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/app/composicoes')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
