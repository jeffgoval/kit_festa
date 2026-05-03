import { Loader2 } from 'lucide-react'

export function PageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}
