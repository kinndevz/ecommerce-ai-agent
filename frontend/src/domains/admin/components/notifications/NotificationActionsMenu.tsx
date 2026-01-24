import { useNavigate } from 'react-router-dom'
import { CheckCircle, Eye, MoreHorizontal, Trash2 } from 'lucide-react'

import type { NotificationItem } from '@/api/types/notification.types'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface NotificationActionsMenuProps {
  item: NotificationItem
  onMarkRead: (notificationId: string) => void
  onRequestDelete: (item: NotificationItem) => void
}

export function NotificationActionsMenu({
  item,
  onMarkRead,
  onRequestDelete,
}: NotificationActionsMenuProps) {
  const navigate = useNavigate()

  const handleView = () => {
    if (!item.action_url) return
    if (/^https?:\/\//i.test(item.action_url)) {
      window.location.href = item.action_url
    } else {
      navigate(item.action_url)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:text-foreground'
        >
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem
          onClick={handleView}
          disabled={!item.action_url}
          className='gap-2 cursor-pointer py-2.5 text-sm'
        >
          <Eye className='h-4 w-4 text-muted-foreground' />
          <span>View details</span>
        </DropdownMenuItem>
        {!item.is_read && (
          <DropdownMenuItem
            onClick={() => onMarkRead(item.id)}
            className='gap-2 cursor-pointer py-2.5 text-sm'
          >
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
            <span>Mark as read</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onRequestDelete(item)}
          className='gap-2 cursor-pointer py-2.5 text-sm text-destructive focus:text-destructive'
        >
          <Trash2 className='h-4 w-4' />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
