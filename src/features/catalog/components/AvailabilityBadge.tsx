import { useItemAvailability } from '@/core/hooks/use-availability'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'

interface AvailabilityBadgeProps {
  itemId: string
  eventDate: string
  totalQuantity: number
}

export function AvailabilityBadge({ itemId, eventDate, totalQuantity }: AvailabilityBadgeProps) {
  const { available, loading } = useItemAvailability(itemId, eventDate, totalQuantity)

  if (loading) return <Skeleton className="h-4 w-16" />

  if (available <= 0) {
    return <Badge variant="destructive">Indisponível</Badge>
  }

  if (available <= 2) {
    return <Badge variant="warning">Últimas {available}</Badge>
  }

  return <Badge variant="success">{available} disponíveis</Badge>
}
