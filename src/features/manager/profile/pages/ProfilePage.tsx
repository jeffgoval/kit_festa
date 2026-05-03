import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, ShieldCheck, User } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuthContext } from '@/core/contexts/auth.context'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { toast } from '@/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

const profileSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
})

const passwordSchema = z.object({
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const { user, profile } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (user && profile) {
      profileForm.reset({
        fullName: profile.full_name ?? '',
        email: user.email ?? '',
      })
    }
  }, [user, profile, profileForm])

  async function onUpdateProfile(data: ProfileFormData) {
    if (!user) return
    setLoading(true)
    try {
      // 1. Update Profile in DB
      const { data: updatedData, error: profileError, count } = await supabase
        .from('profiles')
        .update({ full_name: data.fullName })
        .eq('id', user.id)
        .select()

      if (profileError) throw profileError
      if (count === 0) throw new Error('Permissão negada ou usuário não encontrado no banco.')

      // 2. Update Email in Auth (requires confirmation)
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email: data.email })
        if (authError) throw authError
        toast({
          title: 'E-mail em processo de alteração',
          description: 'Verifique seu NOVO e-mail para confirmar a mudança.',
        })
      } else {
        toast({ title: 'Perfil atualizado com sucesso' })
      }
      
      // Manual refresh of the form with returned data if available
      if (updatedData && updatedData[0]) {
        profileForm.reset({
          fullName: updatedData[0].full_name ?? '',
          email: data.email,
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Verifique suas permissões.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function onUpdatePassword(data: PasswordFormData) {
    setPassLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      toast({ title: 'Senha atualizada com sucesso' })
      passwordForm.reset()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setPassLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="mt-2 text-muted-foreground">Gerencie suas informações pessoais e segurança da conta.</p>
      </div>

      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Atualize seu nome e endereço de e-mail principal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome Completo</label>
                <Input {...profileForm.register('fullName')} placeholder="Seu nome" />
                {profileForm.formState.errors.fullName && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.fullName.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">E-mail</label>
                <Input {...profileForm.register('email')} type="email" placeholder="seu@email.com" />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-fit">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>Mude sua senha de acesso ao painel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nova Senha</label>
                <Input {...passwordForm.register('password')} type="password" placeholder="••••••••" />
                {passwordForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Confirmar Nova Senha</label>
                <Input {...passwordForm.register('confirmPassword')} type="password" placeholder="••••••••" />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={passLoading} className="w-fit">
                {passLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sessão */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Sair da Conta</CardTitle>
            <CardDescription>Encerre sua sessão atual em todos os dispositivos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="size-4" />
              Sair do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
