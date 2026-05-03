import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/core/hooks/use-auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useAuth()
  
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/app/dashboard'

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true })
    }
  }, [user, loading, navigate, from])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md animate-fade-in rounded-2xl border border-border/80 bg-background p-8 shadow-card md:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Acesso ao Painel
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com suas credenciais para gerenciar sua loja
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--color-primary))',
                  brandAccent: 'rgb(var(--color-primary) / 0.9)',
                  brandButtonText: 'white',
                  defaultButtonBackground: 'white',
                  defaultButtonBackgroundHover: '#f9fafb',
                  inputBackground: 'white',
                  inputBorder: 'rgb(var(--color-border))',
                  inputBorderHover: 'rgb(var(--color-primary) / 0.5)',
                  inputBorderFocus: 'rgb(var(--color-primary))',
                },
                radii: {
                  borderRadiusButton: '12px',
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                },
              },
            },
            className: {
              container: 'flex flex-col gap-4',
              button: 'font-semibold transition-all duration-200 active:scale-[0.98]',
              input: 'transition-all duration-200',
              label: 'text-sm font-medium mb-1',
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Criar conta',
                loading_button_label: 'Criando conta...',
                social_provider_text: 'Criar conta com {{provider}}',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
              forgotten_password: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Recuperar senha',
                loading_button_label: 'Recuperando...',
                link_text: 'Esqueceu sua senha?',
              },
              update_password: {
                password_label: 'Nova senha',
                button_label: 'Atualizar senha',
                loading_button_label: 'Atualizando...',
              },
            },
          }}
          providers={[]} // Desabilitado por enquanto, mas pronto para adicionar Google, etc.
          redirectTo={window.location.origin + from}
        />

        <div className="mt-8 border-t border-border/50 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Kit Festa — Gestão Simplificada de Acervos
          </p>
        </div>
      </div>
    </div>
  )
}
