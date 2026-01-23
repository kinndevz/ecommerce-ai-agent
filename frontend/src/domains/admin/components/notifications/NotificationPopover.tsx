import { useEffect, useMemo, useState } from 'react'
import {
  IconBell,
  IconCheck,
  IconCreditCard,
  IconPackage,
  IconShieldCheck,
  IconSparkles,
  IconStar,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

import type { NotificationItem, NotificationType } from '@/api/notification.types'
import {
  ORDER_NOTIFICATION_TYPES,
  UPDATE_NOTIFICATION_TYPES,
} from '@/api/notification.types'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { formatWeekdayTime } from '@/domains/customer/helpers/formatters'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Separator } from '@/shared/components/ui/separator'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs'

type NotificationTab = 'all' | 'orders' | 'updates'

const getTabFilters = (tab: NotificationTab) => {
  if (tab === 'orders') return new Set(ORDER_NOTIFICATION_TYPES)
  if (tab === 'updates') return new Set(UPDATE_NOTIFICATION_TYPES)
  return null
}

const formatNotificationTime = (value: string) => formatWeekdayTime(value)

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'ORDER_CREATED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED':
      return { icon: IconPackage, className: 'text-primary' }
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return { icon: IconCreditCard, className: 'text-emerald-500' }
    case 'REVIEW_RECEIVED':
      return { icon: IconStar, className: 'text-amber-500' }
    case 'PROMOTION':
      return { icon: IconSparkles, className: 'text-purple-500' }
    case 'SYSTEM':
    default:
      return { icon: IconShieldCheck, className: 'text-slate-500' }
  }
}

const NotificationRow = ({
  item,
  onClick,
}: {
  item: NotificationItem
  onClick: (notification: NotificationItem) => void
}) => {
  const iconMeta = getNotificationIcon(item.type)
  const Icon = iconMeta.icon

  return (
    <button
      type='button'
      onClick={() => onClick(item)}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/60',
        !item.is_read && 'bg-muted/40'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl bg-muted',
          !item.is_read && 'bg-primary/10'
        )}
      >
        <Icon className={cn('h-5 w-5', iconMeta.className)} />
      </div>
      <div className='flex-1 space-y-1'>
        <div className='flex items-center justify-between gap-3'>
          <p className='text-sm font-semibold text-foreground'>{item.title}</p>
          {!item.is_read && (
            <span className='h-2 w-2 shrink-0 rounded-full bg-primary' />
          )}
        </div>
        <p className='text-xs text-muted-foreground'>{item.message}</p>
        <p className='text-xs text-muted-foreground'>
          {formatNotificationTime(item.created_at)}
        </p>
      </div>
    </button>
  )
}

const NotificationEmptyState = () => (
  <div className='flex flex-col items-center justify-center gap-2 px-6 py-12 text-center'>
    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
      <IconBell className='h-6 w-6 text-muted-foreground' />
    </div>
    <p className='text-sm font-semibold text-foreground'>No notifications</p>
    <p className='text-xs text-muted-foreground'>
      You are all caught up right now.
    </p>
  </div>
)

const NotificationLoadingState = () => (
  <div className='space-y-3 px-4 py-3'>
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className='flex items-center gap-3'>
        <Skeleton className='h-10 w-10 rounded-xl' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-3 w-3/4' />
          <Skeleton className='h-3 w-5/6' />
          <Skeleton className='h-3 w-1/3' />
        </div>
      </div>
    ))}
  </div>
)

export function NotificationPopover() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<NotificationTab>('all')

  const {
    notifications,
    stats,
    isLoading,
    fetchNotifications,
    refreshStats,
    markRead,
    markAllRead,
  } = useNotificationStore()

  useEffect(() => {
    if (!open) return
    void fetchNotifications({ page: 1, limit: 5 })
    void refreshStats()
  }, [open, fetchNotifications, refreshStats])

  const filteredNotifications = useMemo(() => {
    const filterSet = getTabFilters(tab)
    if (!filterSet) return notifications
    return notifications.filter((item) => filterSet.has(item.type))
  }, [notifications, tab])

  const unreadCount = stats?.unread_notifications ?? 0
  const isInitialLoading = isLoading && notifications.length === 0

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markRead([item.id])
    }
    if (item.action_url) {
      if (/^https?:\/\//i.test(item.action_url)) {
        window.location.href = item.action_url
      } else {
        navigate(item.action_url)
      }
    }
  }

  const handleMarkAllRead = async () => {
    if (!unreadCount) return
    await markAllRead()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative'
          aria-label='Notifications'
        >
          <IconBell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px]'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[360px] p-0 shadow-xl'
        sideOffset={12}
      >
        <div className='flex items-center justify-between px-4 py-3'>
          <div className='space-y-0.5'>
            <p className='text-sm font-semibold'>Notifications</p>
            <p className='text-xs text-muted-foreground'>
              {unreadCount} unread
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={() => {
                setOpen(false)
                navigate('/admin/notifications')
              }}
            >
              View all
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={handleMarkAllRead}
              disabled={!unreadCount}
            >
              <IconCheck className='h-3.5 w-3.5' />
              Mark all
            </Button>
          </div>
        </div>
        <div className='px-4 pb-3'>
          <Tabs value={tab} onValueChange={(value) => setTab(value as NotificationTab)}>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='all'>View All</TabsTrigger>
              <TabsTrigger value='orders'>New Order</TabsTrigger>
              <TabsTrigger value='updates'>Weekly Update</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Separator />
        <ScrollArea className='h-[360px]'>
          {isInitialLoading ? (
            <NotificationLoadingState />
          ) : filteredNotifications.length === 0 ? (
            <NotificationEmptyState />
          ) : (
            <div className='flex flex-col'>
              {filteredNotifications.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
