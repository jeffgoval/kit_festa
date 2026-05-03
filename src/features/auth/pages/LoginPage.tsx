import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { getAuthEmailRedirectUrl } from '@/lib/site-url'
import { useAuth } from '@/core/hooks/use-auth'
import type { UserRole } from '@/core/types'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { toast } from '@/ui/use-toast'

function postLoginPath(role: UserRole | null, intended: string): string {
  if (!role) return '/'

  if (role === 'cliente') return '/'

  if (role === 'gestor') {
    if (intended.startsWith('/admin')) return '/app/dashboard'
    if (intended.startsWith('/app')) return intended
    return '/app/dashboard'
  }

  if (role === 'admin') {
    if (intended.startsWith('/admin') || intended.startsWith('/app')) return intended
    return '/admin/tenants'
  }

  return '/app/dashboard'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, role } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)

  const intended = useMemo(() => {
    const p = (location.state as { from?: { pathname?: string } })?.from?.pathname
    if (!p || p === '/app/login') return '/app/dashboard'
    return p
  }, [location.state])

  useEffect(() => {
    if (!user || loading) return
    navigate(postLoginPath(role, intended), { replace: true })
  }, [user, loading, role, navigate, intended])

  async function onLogin(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    if (error) {
      toast({ title: 'Não foi possível entrar', description: error.message, variant: 'destructive' })
      return
    }
  }

  async function onSignup(e: FormEvent) {
    e.preventDefault()
    if (fullName.trim().length < 2) {
      toast({ title: 'Nome inválido', description: 'Informe seu nome (mín. 2 caracteres).', variant: 'destructive' })
      return
    }
    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: getAuthEmailRedirectUrl(),
        data: { full_name: fullName.trim() },
      },
    })
    setBusy(false)
    if (error) {
      toast({ title: 'Cadastro não concluído', description: error.message, variant: 'destructive' })
      return
    }
    if (data.user && !data.session) {
      toast({
        title: 'Confirme o e-mail',
        description: 'Enviamos um link. Depois de confirmar, um administrador pode liberar o acesso ao painel (papel e loja).',
      })
      return
    }
    toast({ title: 'Conta criada', description: 'Você já pode entrar. Peça ao administrador para vincular sua loja e ajustar o papel, se necessário.' })
  }

  async function onRecovery() {
    if (!email.trim()) {
      toast({ title: 'E-mail', description: 'Informe o e-mail da conta.', variant: 'destructive' })
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getAuthEmailRedirectUrl(),
    })
    setBusy(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      return
    }
    toast({
      title: 'E-mail enviado',
      description: 'Se existir uma conta com esse endereço, você receberá o link para redefinir a senha.',
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md animate-fade-in rounded-2xl border border-border/80 bg-background p-8 shadow-card md:p-10">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Painel Kit Festa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login simples — o administrador ajusta papel e loja depois do cadastro.
          </p>
        </div>

        <div className="mb-6 flex gap-2 rounded-xl bg-muted/50 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setMode('signup')}
          >
            Criar conta
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar'}
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={onRecovery}
              disabled={busy}
            >
              Esqueci minha senha
            </button>
          </form>
        ) : (
          <form onSubmit={onSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Senha (mín. 6)</label>
              <Input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Criando…' : 'Criar conta'}
            </Button>
          </form>
        )}

        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          <Link to="/demo" className="text-primary hover:underline">
            Voltar à loja
          </Link>
          <p className="mt-3">Kit Festa — locação de itens para festas</p>
        </div>
      </div>
    </div>
  )
}
