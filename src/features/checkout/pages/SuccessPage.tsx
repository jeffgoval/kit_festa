import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/ui/button'

export function SuccessPage() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>()

  return (
    <div className="container mx-auto flex flex-col items-center gap-6 py-24 text-center">
      <CheckCircle2 className="size-16 text-green-500" />
      <div>
        <h1 className="text-2xl font-bold">Solicitação enviada!</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          A loja irá analisar a disponibilidade e entrar em contato para confirmar sua reserva.
        </p>
      </div>
      <Button variant="outline" asChild>
        <Link to={`/${tenantSlug}`}>Voltar à loja</Link>
      </Button>
    </div>
  )
}
