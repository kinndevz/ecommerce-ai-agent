import type { ReactNode } from 'react'
import { Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface BrandNotFoundStateProps {
  title?: string
  description?: string
  actionLabel: string
  onAction: () => void
  icon?: ReactNode
}

export function BrandNotFoundState({
  title = 'Brand Not Found',
  description = "The brand you're looking for doesn't exist or has been deleted.",
  actionLabel,
  onAction,
  icon,
}: BrandNotFoundStateProps) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='mb-4 text-muted-foreground'>
          {icon || <Package className='w-16 h-16 mx-auto' />}
        </div>
        <h2 className='text-2xl font-bold mb-2'>{title}</h2>
        <p className='text-muted-foreground mb-6'>{description}</p>
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  )
}
