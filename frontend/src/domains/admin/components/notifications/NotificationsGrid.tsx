import { useState } from 'react'

import type { NotificationItem } from '@/api/notification.types'
import {
  formatNotificationTypeLabel,
  getNotificationStatusBadgeClass,
  getNotificationTypeBadgeClass,
} from '@/domains/admin/helpers/notification.helpers'
import { formatWeekdayTime } from '@/domains/customer/helpers/formatters'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { PaginationBar } from './PaginationBar'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { NotificationActionsMenu } from './NotificationActionsMenu'
import { NotificationsEmptyState } from './NotificationsEmptyState'
import { NotificationsGridSkeleton } from './NotificationsGridSkeleton'

interface NotificationsGridProps {
  notifications: NotificationItem[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onMarkRead: (notificationId: string) => void
  onDelete: (notificationId: string) => void
}

export function NotificationsGrid({
  notifications,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onMarkRead,
  onDelete,
}: NotificationsGridProps) {
  const [deleteCandidate, setDeleteCandidate] = useState<NotificationItem | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (isLoading) {
    return <NotificationsGridSkeleton />
  }

  if (notifications.length === 0) {
    return <NotificationsEmptyState />
  }

  const requestDelete = (item: NotificationItem) => {
    setDeleteCandidate(item)
    setIsDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteCandidate) return
    onDelete(deleteCandidate.id)
    setIsDeleteOpen(false)
    setDeleteCandidate(null)
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {notifications.map((item) => (
          <div
            key={item.id}
            className='rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <Badge
                variant='outline'
              className={cn(
                'text-xs',
                getNotificationTypeBadgeClass(item.type)
              )}
              >
              {formatNotificationTypeLabel(item.type)}
              </Badge>
              <NotificationActionsMenu
                item={item}
                onMarkRead={onMarkRead}
                onRequestDelete={requestDelete}
              />
            </div>
            <div className='mt-4 space-y-2'>
              <h3 className='text-base font-semibold'>{item.title}</h3>
              <p className='text-sm text-muted-foreground line-clamp-2'>
                {item.message}
              </p>
            </div>
            <div className='mt-4 flex items-center justify-between'>
              <p className='text-xs text-muted-foreground'>
                {formatWeekdayTime(item.created_at)}
              </p>
              <Badge
                variant='outline'
                className={cn(
                  'text-xs',
                  getNotificationStatusBadgeClass(item.is_read)
                )}
              >
                {item.is_read ? 'Read' : 'Unread'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  )
}
