import { AlertCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface UserNotFoundStateProps {
  title?: string
  description?: string
  actionLabel: string
  onAction: () => void
}

export function UserNotFoundState({
  title = 'User Not Found',
  description = "The user you're looking for doesn't exist or has been removed.",
  actionLabel,
  onAction,
}: UserNotFoundStateProps) {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center space-y-4'>
        <AlertCircle className='w-16 h-16 text-muted-foreground mx-auto' />
        <h2 className='text-2xl font-semibold'>{title}</h2>
        <p className='text-muted-foreground'>{description}</p>
        <Button onClick={onAction} variant='outline'>
          {actionLabel}
        </Button>
      </div>
    </div>
  )
}
