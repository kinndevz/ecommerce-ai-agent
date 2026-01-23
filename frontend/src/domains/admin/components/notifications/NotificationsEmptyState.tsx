import { MailCheck } from 'lucide-react'

interface NotificationsEmptyStateProps {
  title?: string
  description?: string
}

export function NotificationsEmptyState({
  title = 'No Notifications',
  description = 'There are no notifications matching your current filters.',
}: NotificationsEmptyStateProps) {
  return (
    <div className='rounded-2xl border border-dashed bg-card/50'>
      <div className='text-center py-20 px-6'>
        <div className='inline-flex p-4 rounded-full bg-primary/10 mb-6'>
          <MailCheck className='w-12 h-12 text-primary' />
        </div>
        <h3 className='text-xl font-semibold mb-2'>{title}</h3>
        <p className='text-muted-foreground text-sm max-w-sm mx-auto'>{description}</p>
      </div>
    </div>
  )
}
