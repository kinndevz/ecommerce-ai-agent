import { MessageSquare } from 'lucide-react'

export function ReviewEmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <MessageSquare className='h-12 w-12 text-muted-foreground/40 mb-4' />
      <p className='text-sm text-muted-foreground'>
        No reviews yet for this product
      </p>
    </div>
  )
}
