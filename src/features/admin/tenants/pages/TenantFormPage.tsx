import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { toast } from '@/ui/use-toast'
import { slugify } from '@/lib/utils'
import type { TablesInsert } from '@/lib/supabase/database.types'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function TenantFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()

  const { data: tenant } = useQuery({
    queryKey: queryKeys.tenants.detail(id!),
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
    enabled: isEditing,
  })

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (tenant) form.reset({ name: tenant.name, email: tenant.email ?? '', phone: tenant.phone ?? '' })
  }, [tenant, form])

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        const { error } = await supabase.from('tenants').update(data).eq('id', id!)
        if (error) throw error
      } else {
        const insert: TablesInsert<'tenants'> = { ...data, slug: slugify(data.name) }
        const { error } = await supabase.from('tenants').insert(insert)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all() })
      toast({ title: isEditing ? 'Loja atualizada' : 'Loja criada' })
      navigate('/admin/tenants')
    },
  })

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-xl font-bold">{isEditing ? 'Editar loja' : 'Nova loja'}</h1>

      <form onSubmit={form.handleSubmit((d) => save(d))} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm">Nome *</label>
          <Input {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm">E-mail</label>
          <Input {...form.register('email')} type="email" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm">Telefone</label>
          <Input {...form.register('phone')} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/tenants')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
