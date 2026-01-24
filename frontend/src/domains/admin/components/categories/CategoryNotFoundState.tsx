import type { ReactNode } from 'react'
import { FolderTree } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface CategoryNotFoundStateProps {
  title?: string
  description?: string
  actionLabel: string
  onAction: () => void
  icon?: ReactNode
}

export function CategoryNotFoundState({
  title = 'Category Not Found',
  description = "The category you're looking for doesn't exist or has been deleted.",
  actionLabel,
  onAction,
  icon,
}: CategoryNotFoundStateProps) {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='mb-4 text-muted-foreground'>
          {icon || <FolderTree className='w-16 h-16 mx-auto' />}
        </div>
        <h2 className='text-2xl font-bold mb-2'>{title}</h2>
        <p className='text-muted-foreground mb-6'>{description}</p>
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  )
}
