import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Button } from '@/ui/button'

export function RouteErrorFallback() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText || ''}`.trim()
    : error instanceof Error
      ? error.message
      : 'Erro inesperado ao carregar a página.'

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-center sm:px-8">
      <h1 className="text-base font-semibold sm:text-lg">Não foi possível carregar esta tela</h1>
      <p className="max-w-md break-words text-sm text-muted-foreground">{message}</p>
      <p className="max-w-md text-xs text-muted-foreground">
        Em desenvolvimento, isso costuma acontecer após salvar arquivos com o servidor rodando. Tente recarregar.
      </p>
      <Button type="button" className="w-full max-w-xs sm:w-auto" onClick={() => window.location.reload()}>
        Recarregar página
      </Button>
    </div>
  )
}
