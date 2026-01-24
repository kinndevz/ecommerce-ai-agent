import { Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface ProductNotFoundStateProps {
  title?: string
  description?: string
  actionLabel: string
  onAction: () => void
}

export function ProductNotFoundState({
  title = 'Product Not Found',
  description = "The product you're looking for doesn't exist.",
  actionLabel,
  onAction,
}: ProductNotFoundStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <div className='inline-flex p-5 rounded-2xl bg-primary/10 mb-6'>
        <Package className='w-16 h-16 text-primary' />
      </div>
      <h2 className='text-2xl font-bold mb-3'>{title}</h2>
      <p className='text-muted-foreground mb-6'>{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  )
}
