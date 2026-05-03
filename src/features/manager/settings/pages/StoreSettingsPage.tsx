import { useEffect, useMemo, useRef } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { ColorPaletteEditor } from '../components/ColorPaletteEditor'
import { toast } from '@/ui/use-toast'
import {
  emptyTenantSettingsForm,
  formatSupabaseUserMessage,
  safeHex6,
  tenantFormToUpdateRow,
  tenantSettingsSchema,
  type TenantSettingsForm,
} from '../lib/tenant-settings-schema'

export function StoreSettingsPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const logoInputRef = useRef<HTMLInputElement>(null)
  const lastTenantHydrateKey = useRef('')

  useEffect(() => {
    lastTenantHydrateKey.current = ''
  }, [tenantId])

  const { data: tenant } = useQuery({
    queryKey: queryKeys.tenant(tenantId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!tenantId,
  })

  const form = useForm<TenantSettingsForm>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues: emptyTenantSettingsForm(),
  })

  const tenantHydrateKey = useMemo(
    () =>
      tenant
        ? [
            tenant.id,
            tenant.name,
            tenant.phone ?? '',
            tenant.email ?? '',
            tenant.whatsapp_number ?? '',
            tenant.instagram_url ?? '',
            tenant.facebook_url ?? '',
            tenant.description ?? '',
            tenant.primary_color ?? '',
            tenant.secondary_color ?? '',
            tenant.accent_color ?? '',
            tenant.background_color ?? '',
            tenant.text_color ?? '',
          ].join('|')
        : '',
    [tenant],
  )

  useEffect(() => {
    if (!tenantHydrateKey || !tenant) return
    if (tenantHydrateKey === lastTenantHydrateKey.current) return
    lastTenantHydrateKey.current = tenantHydrateKey
    form.reset({
      name: tenant.name,
      phone: tenant.phone ?? '',
      email: tenant.email ?? '',
      whatsapp_number: tenant.whatsapp_number ?? '',
      instagram_url: tenant.instagram_url ?? '',
      facebook_url: tenant.facebook_url ?? '',
      description: tenant.description ?? '',
      primary_color: safeHex6(tenant.primary_color, '#8B5CF6'),
      secondary_color: safeHex6(tenant.secondary_color, '#F9A8D4'),
      accent_color: safeHex6(tenant.accent_color, '#F59E0B'),
      background_color: safeHex6(tenant.background_color, '#FFFFFF'),
      text_color: safeHex6(tenant.text_color, '#111827'),
    })
  }, [tenantHydrateKey, tenant, form])

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: async (data: TenantSettingsForm) => {
      if (!tenantId) {
        throw new Error('Nenhuma loja vinculada ao seu usuário.')
      }
      const payload = tenantFormToUpdateRow(data)
      const { data: row, error } = await supabase
        .from('tenants')
        .update(payload)
        .eq('id', tenantId)
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!row) {
        throw new Error(
          'A atualização não foi aplicada (0 linhas). Confira se sua conta está vinculada à loja e se você tem permissão de gestor.',
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) })
      toast({ title: 'Configurações salvas' })
    },
    onError: (err) => {
      toast({
        title: 'Erro ao salvar',
        description: formatSupabaseUserMessage(err),
        variant: 'destructive',
      })
    },
  })

  const { mutate: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: async (file: File) => {
      if (!tenantId) {
        throw new Error(
          'Nenhuma loja vinculada ao seu usuário. Peça ao administrador para associar sua conta a uma loja.',
        )
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Imagem acima de 2MB. Escolha um arquivo menor.')
      }

      const fromName = file.name.split('.').pop()?.toLowerCase()
      const ext =
        fromName && ['png', 'jpg', 'jpeg', 'webp'].includes(fromName)
          ? fromName === 'jpeg'
            ? 'jpg'
            : fromName
          : file.type === 'image/png'
            ? 'png'
            : file.type === 'image/webp'
              ? 'webp'
              : 'jpg'

      const path = `${tenantId}/logo-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(path, file, { upsert: false, contentType: file.type || undefined })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('tenant-assets').getPublicUrl(path)

      const { data: row, error } = await supabase
        .from('tenants')
        .update({ logo_url: publicUrl })
        .eq('id', tenantId)
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!row) {
        throw new Error(
          'Não foi possível gravar a URL da logo. Verifique permissões ou vínculo da conta com a loja.',
        )
      }
      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) })
      toast({ title: 'Logo atualizada' })
    },
    onError: (err) => {
      toast({
        title: 'Não foi possível salvar a logo',
        description: formatSupabaseUserMessage(err),
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">Minha Loja</h1>

      <form
        onSubmit={form.handleSubmit(
          (d) => {
            saveSettings(d)
          },
          (errors: FieldErrors<TenantSettingsForm>) => {
            const first = Object.values(errors)[0] as { message?: string } | undefined
            toast({
              title: 'Revise o formulário',
              description: first?.message ?? 'Alguns campos estão inválidos.',
              variant: 'destructive',
            })
          },
        )}
        className="flex flex-col gap-8"
      >
        {/* Logo */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Logo</h2>
          <div className="flex items-center gap-4">
            {tenant?.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-16 w-auto max-w-[160px] rounded-lg border border-border object-contain"
              />
            ) : (
              <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                Sem logo
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo || !tenantId}
              >
                {uploadingLogo ? 'Enviando...' : 'Alterar logo'}
              </Button>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadLogo(file)
              e.target.value = ''
            }}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG ou WebP · máx. 2MB</p>
        </div>

        {/* General info */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Informações gerais</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm">Nome da loja *</label>
              <Input {...form.register('name')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm">Telefone</label>
              <Input {...form.register('phone')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm">WhatsApp</label>
              <Input {...form.register('whatsapp_number')} placeholder="5511999999999" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm">E-mail</label>
              <Input {...form.register('email')} type="email" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm">Instagram</label>
              <Input {...form.register('instagram_url')} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm">Facebook</label>
              <Input {...form.register('facebook_url')} placeholder="https://facebook.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm">Apresentação da loja</label>
              <textarea
                {...form.register('description')}
                rows={3}
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        </div>

        {/* Color palette */}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Paleta de cores</h2>
          <ColorPaletteEditor form={form} />
        </div>

        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </div>
  )
}
