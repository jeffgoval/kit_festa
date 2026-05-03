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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-lg font-semibold">Não foi possível carregar esta tela</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <p className="max-w-md text-xs text-muted-foreground">
        Em desenvolvimento, isso costuma acontecer após salvar arquivos com o servidor rodando. Tente
        recarregar.
      </p>
      <Button type="button" onClick={() => window.location.reload()}>
        Recarregar página
      </Button>
    </div>
  )
}
