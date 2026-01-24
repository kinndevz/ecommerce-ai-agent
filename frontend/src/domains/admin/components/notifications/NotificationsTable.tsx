import { useState } from 'react'
import { Columns } from 'lucide-react'

import type { NotificationItem } from '@/api/types/notification.types'
import {
  formatNotificationTypeLabel,
  getNotificationStatusBadgeClass,
  getNotificationTypeBadgeClass,
} from '@/domains/admin/helpers/notification.helpers'
import { formatWeekdayTime } from '@/domains/customer/helpers/formatters'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { PaginationBar } from './PaginationBar'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { NotificationActionsMenu } from './NotificationActionsMenu'
import { NotificationsEmptyState } from './NotificationsEmptyState'
import { NotificationsTableSkeleton } from './NotificationsTableSkeleton'

interface NotificationsTableProps {
  notifications: NotificationItem[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onMarkRead: (notificationId: string) => void
  onDelete: (notificationId: string) => void
}

const COLUMNS = [
  { key: 'type', label: 'Type', visible: true },
  { key: 'title', label: 'Title', visible: true },
  { key: 'message', label: 'Message', visible: true },
  { key: 'time', label: 'Time', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'action', label: 'Action', visible: true },
] as const

export function NotificationsTable({
  notifications,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onMarkRead,
  onDelete,
}: NotificationsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState(() =>
    COLUMNS.reduce(
      (acc, col) => ({ ...acc, [col.key]: col.visible }),
      {} as Record<(typeof COLUMNS)[number]['key'], boolean>
    )
  )
  const [deleteCandidate, setDeleteCandidate] = useState<NotificationItem | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <NotificationsTableSkeleton />
      </div>
    )
  }

  if (notifications.length === 0) {
    return <NotificationsEmptyState />
  }

  const allSelected = selectedRows.size > 0 && selectedRows.size === notifications.length
  const someSelected =
    selectedRows.size > 0 && selectedRows.size < notifications.length

  const toggleColumn = (key: (typeof COLUMNS)[number]['key']) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(notifications.map((item) => item.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
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
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          Showing {notifications.length} notification(s)
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm' className='h-8 gap-2'>
              <Columns className='h-4 w-4' />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            {COLUMNS.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns[column.key]}
                onCheckedChange={() => toggleColumn(column.key)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='rounded-xl border border-border overflow-hidden bg-card shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50'>
              <TableHead className='w-12'>
                <Checkbox
                  checked={allSelected || (someSelected && 'indeterminate')}
                  onCheckedChange={handleSelectAll}
                  aria-label='Select all'
                />
              </TableHead>
              {visibleColumns.type && (
                <TableHead className='w-[160px]'>Type</TableHead>
              )}
              {visibleColumns.title && <TableHead>Title</TableHead>}
              {visibleColumns.message && <TableHead>Message</TableHead>}
              {visibleColumns.time && (
                <TableHead className='w-[160px]'>Time</TableHead>
              )}
              {visibleColumns.status && (
                <TableHead className='w-[120px] text-center'>Status</TableHead>
              )}
              {visibleColumns.action && (
                <TableHead className='w-[80px] text-right'>Action</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((item) => (
              <TableRow key={item.id} className='hover:bg-muted/50'>
                <TableCell className='w-12'>
                  <Checkbox
                    checked={selectedRows.has(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(item.id, checked as boolean)
                    }
                    aria-label='Select row'
                  />
                </TableCell>
                {visibleColumns.type && (
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-xs',
                        getNotificationTypeBadgeClass(item.type)
                      )}
                    >
                      {formatNotificationTypeLabel(item.type)}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.title && (
                  <TableCell className='font-medium'>{item.title}</TableCell>
                )}
                {visibleColumns.message && (
                  <TableCell className='text-muted-foreground max-w-[280px] truncate'>
                    {item.message}
                  </TableCell>
                )}
                {visibleColumns.time && (
                  <TableCell className='text-muted-foreground'>
                    {formatWeekdayTime(item.created_at)}
                  </TableCell>
                )}
                {visibleColumns.status && (
                  <TableCell className='text-center'>
                    <Badge
                      variant='outline'
                      className={cn(
                        'text-xs',
                        getNotificationStatusBadgeClass(item.is_read)
                      )}
                    >
                      {item.is_read ? 'Read' : 'Unread'}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.action && (
                  <TableCell className='text-right'>
                    <NotificationActionsMenu
                      item={item}
                      onMarkRead={onMarkRead}
                      onRequestDelete={requestDelete}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />

      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
