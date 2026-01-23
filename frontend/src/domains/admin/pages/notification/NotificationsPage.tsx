import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Grid, Table } from 'lucide-react'

import AdminLayout from '@/domains/admin/components/layout/AdminLayout'
import { NotificationsTable } from '../../components/notifications/NotificationsTable'
import { NotificationsStats } from '../../components/notifications/NotificationsStats'
import { NotificationsGrid } from '../../components/notifications/NotificationsGrid'
import { useNotificationStore } from '@/stores/useNotificationStore'
import {
  ORDER_NOTIFICATION_TYPES,
  UPDATE_NOTIFICATION_TYPES,
  type NotificationType,
} from '@/api/notification.types'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group'

type NotificationTab = 'all' | 'orders' | 'updates'
type StatusFilter = 'all' | 'unread' | 'read'
type ViewMode = 'grid' | 'table'

const getTabFilters = (tab: NotificationTab) => {
  if (tab === 'orders') return new Set(ORDER_NOTIFICATION_TYPES)
  if (tab === 'updates') return new Set(UPDATE_NOTIFICATION_TYPES)
  return null
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<NotificationTab>('all')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const limit = 12

  const {
    notifications,
    stats,
    isLoading,
    totalPages,
    fetchNotifications,
    refreshStats,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotificationStore()

  const unreadOnly = statusFilter === 'unread'

  useEffect(() => {
    void fetchNotifications({ page, limit, unreadOnly })
  }, [page, unreadOnly, fetchNotifications])

  const [isStatsLoading, setIsStatsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadStats = async () => {
      setIsStatsLoading(true)
      await refreshStats()
      if (isMounted) {
        setIsStatsLoading(false)
      }
    }
    void loadStats()
    return () => {
      isMounted = false
    }
  }, [refreshStats])

  const filteredNotifications = useMemo(() => {
    const filterSet = getTabFilters(tab)
    return notifications.filter((item) => {
      if (filterSet && !filterSet.has(item.type as NotificationType)) {
        return false
      }
      if (statusFilter === 'read' && !item.is_read) return false
      return true
    })
  }, [notifications, tab, statusFilter])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchNotifications({ page, limit, unreadOnly })
    await refreshStats()
    setTimeout(() => setIsRefreshing(false), 400)
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
  }

  const handlePageChange = (nextPage: number) => {
    setPage(Math.max(1, nextPage))
  }

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Notifications</h1>
            <p className='text-muted-foreground mt-1'>
              Review and manage all notification activity
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            <Button onClick={handleMarkAllRead}>Mark all read</Button>
          </div>
        </div>

        <NotificationsStats stats={stats} isLoading={isStatsLoading} />

        <div className='space-y-4 rounded-xl border bg-card px-4 py-3'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as NotificationTab)}
            >
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='orders'>Orders</TabsTrigger>
                <TabsTrigger value='updates'>Updates</TabsTrigger>
              </TabsList>
            </Tabs>
            <ToggleGroup
              type='single'
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              variant='outline'
              size='sm'
            >
              <ToggleGroupItem value='grid'>
                <Grid className='h-4 w-4' />
                Grid
              </ToggleGroupItem>
              <ToggleGroupItem value='table'>
                <Table className='h-4 w-4' />
                Table
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='unread'>Unread</SelectItem>
                <SelectItem value='read'>Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <NotificationsGrid
            notifications={filteredNotifications}
            isLoading={isLoading}
            page={page}
            totalPages={Math.max(totalPages, 1)}
            onPageChange={handlePageChange}
            onMarkRead={(id: string) => markRead([id])}
            onDelete={deleteNotification}
          />
        ) : (
          <NotificationsTable
            notifications={filteredNotifications}
            isLoading={isLoading}
            page={page}
            totalPages={Math.max(totalPages, 1)}
            onPageChange={handlePageChange}
            onMarkRead={(id: string) => markRead([id])}
            onDelete={deleteNotification}
          />
        )}
      </div>
    </AdminLayout>
  )
}
