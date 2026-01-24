import { Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface OrderNotFoundStateProps {
  title?: string
  description?: string
  actionLabel: string
  onAction: () => void
}

export function OrderNotFoundState({
  title = 'Order Not Found',
  description = "The order you're looking for doesn't exist.",
  actionLabel,
  onAction,
}: OrderNotFoundStateProps) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <Package className='w-16 h-16 mx-auto text-muted-foreground mb-4' />
        <h2 className='text-2xl font-bold mb-2'>{title}</h2>
        <p className='text-muted-foreground mb-6'>{description}</p>
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  )
}
