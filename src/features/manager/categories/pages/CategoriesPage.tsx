import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import type { Category } from '@/core/types'

export function CategoriesPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order')
      if (error) throw error
      return data as Category[]
    },
    enabled: !!tenantId,
  })

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all(tenantId) })

  const { mutate: create } = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('categories').insert({
        tenant_id: tenantId,
        name,
        sort_order: categories.length,
      })
      if (error) throw error
    },
    onSuccess: () => { invalidate(); setNewName('') },
  })

  const { mutate: update } = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .eq('tenant_id', tenantId)
      if (error) throw error
    },
    onSuccess: () => { invalidate(); setEditingId(null) },
  })

  const { mutate: toggle } = useMutation({
    mutationFn: async ({ id, is_active }: Pick<Category, 'id' | 'is_active'>) => {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !is_active })
        .eq('id', id)
        .eq('tenant_id', tenantId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    create(newName.trim())
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-bold">Categorias</h1>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova categoria"
        />
        <Button type="submit">
          <Plus className="size-4" />
          Criar
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              cat.is_active ? 'border-border bg-background' : 'border-border/50 bg-muted/30 opacity-60'
            }`}
          >
            <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />

            {editingId === cat.id ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-7 flex-1 py-0 text-sm"
                autoFocus
                onBlur={() => {
                  if (editName.trim() && editName !== cat.name) {
                    update({ id: cat.id, name: editName.trim() })
                  } else {
                    setEditingId(null)
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                  if (e.key === 'Escape') setEditingId(null)
                }}
              />
            ) : (
              <span className="flex-1 text-sm font-medium">{cat.name}</span>
            )}

            <div className="flex gap-1">
              <button onClick={() => startEdit(cat)} className="text-muted-foreground hover:text-foreground">
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => toggle(cat)}
                className="text-muted-foreground hover:text-foreground"
                title={cat.is_active ? 'Desativar' : 'Ativar'}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
