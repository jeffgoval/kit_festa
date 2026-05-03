import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { queryClient, queryKeys } from '@/lib/query/client'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { ColorPaletteEditor } from '../components/ColorPaletteEditor'
import { toast } from '@/ui/use-toast'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  whatsapp_number: z.string().optional(),
  instagram_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  background_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

type FormData = z.infer<typeof schema>

export function StoreSettingsPage() {
  const { profile } = useAuthContext()
  const tenantId = profile?.tenant_id ?? ''
  const logoInputRef = useRef<HTMLInputElement>(null)

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

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        phone: tenant.phone ?? '',
        email: tenant.email ?? '',
        whatsapp_number: tenant.whatsapp_number ?? '',
        instagram_url: tenant.instagram_url ?? '',
        facebook_url: tenant.facebook_url ?? '',
        description: tenant.description ?? '',
        primary_color: tenant.primary_color ?? '#8B5CF6',
        secondary_color: tenant.secondary_color ?? '#F9A8D4',
        accent_color: tenant.accent_color ?? '#F59E0B',
        background_color: tenant.background_color ?? '#FFFFFF',
        text_color: tenant.text_color ?? '#111827',
      })
    }
  }, [tenant, form])

  const { mutateAsync: saveSettings, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase
        .from('tenants')
        .update(data)
        .eq('id', tenantId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) })
      toast({ title: 'Configurações salvas' })
    },
  })

  const { mutateAsync: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop()
      const path = `${tenantId}/logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(path)

      const { error } = await supabase
        .from('tenants')
        .update({ logo_url: publicUrl })
        .eq('id', tenantId)

      if (error) throw error
      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant(tenantId) })
      toast({ title: 'Logo atualizada' })
    },
  })

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">Minha Loja</h1>

      <form
        onSubmit={form.handleSubmit((d) => saveSettings(d))}
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
                disabled={uploadingLogo}
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
