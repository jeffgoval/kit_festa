import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryKeys } from '@/lib/query/client'
import { useUpsertCustomer } from '../api/mutations'
import { Skeleton } from '@/ui/skeleton'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { toast } from '@/ui/use-toast'
import { formatDate } from '@/lib/utils'
import type { Customer } from '@/core/types'

const customerFormSchema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  phone: z.string().min(8, 'Telefone com pelo menos 8 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

export function CustomersPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { name: '', phone: '', email: '', address: '', notes: '' },
  })

  const { data: customers = [], isLoading } = useQuery({
    queryKey: queryKeys.customers.all(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name')
      if (error) throw error
      return data as Customer[]
    },
    enabled: !!tenantId,
  })

  const { mutateAsync: upsertCustomer, isPending } = useUpsertCustomer(tenantId)

  async function onSubmit(data: CustomerFormData) {
    try {
      await upsertCustomer({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      })
      toast({
        title: 'Cliente salvo',
        description: 'Mesmo telefone da vitrine atualiza nome e dados.',
      })
      form.reset({ name: '', phone: '', email: '', address: '', notes: '' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Tente de novo.'
      toast({ title: 'Não foi possível salvar', description: msg, variant: 'destructive' })
    }
  }

  return (
    <div className="min-w-0">
      <h1 className="mb-2 text-lg font-bold sm:text-xl">Clientes</h1>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground sm:mb-6">
        Quem pede reserva pelo site entra aqui automaticamente. Use o formulário abaixo para cadastrar quem ligou,
        passou na loja ou combinou por WhatsApp — o telefone é a chave: se já existir, os dados são atualizados.
      </p>

      <Card className="mb-8 border-border/80 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Cadastrar ou atualizar</CardTitle>
          <CardDescription>Telefone + loja identificam o cliente (igual ao checkout público).</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nome *</label>
                <Input {...form.register('name')} placeholder="Nome completo" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Telefone / WhatsApp *</label>
                <Input {...form.register('phone')} placeholder="(11) 99999-9999" />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-mail</label>
              <Input {...form.register('email')} type="email" placeholder="opcional" />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Endereço / bairro</label>
                <Input {...form.register('address')} placeholder="opcional" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Observações internas</label>
                <Input {...form.register('notes')} placeholder="opcional" />
              </div>
            </div>
            <Button type="submit" disabled={isPending || !tenantId} className="w-full sm:w-auto">
              {isPending ? 'Salvando…' : 'Salvar cliente'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
        Lista ({customers.length})
      </h2>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
          Nenhum cliente ainda. Cadastre um acima ou aguarde o primeiro pedido pelo site.
        </p>
      ) : (
        <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-background [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                  Nome
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Telefone
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  E-mail
                </th>
                <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground lg:table-cell sm:px-4 sm:py-3 sm:text-sm">
                  Desde
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 font-medium leading-snug sm:px-4 sm:py-3">{c.name}</td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground sm:table-cell sm:px-4 sm:py-3">
                    {c.phone}
                  </td>
                  <td className="hidden max-w-[12rem] truncate px-3 py-2.5 text-muted-foreground md:table-cell sm:max-w-none sm:px-4 sm:py-3">
                    {c.email ?? '—'}
                  </td>
                  <td className="hidden px-3 py-2.5 text-muted-foreground lg:table-cell sm:px-4 sm:py-3">
                    {formatDate(c.created_at.split('T')[0])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
