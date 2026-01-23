import { create } from 'zustand'
import { notificationAPI, type NotificationQueryParams } from '@/api/notification.api'
import type { NotificationItem, NotificationStats } from '@/api/notification.types'
import {
  NotificationSocket,
  type NotificationSocketCallbacks,
  type NotificationSocketStatus,
} from '@/api/services/notification/NotificationSocket'

interface NotificationState {
  notifications: NotificationItem[]
  stats: NotificationStats | null
  isConnected: boolean
  isLoading: boolean
  lastError: string | null
  currentPage: number
  pageSize: number
  totalPages: number
  unreadOnly: boolean
  connect: () => void
  disconnect: () => void
  fetchNotifications: (
    params?: NotificationQueryParams & { append?: boolean }
  ) => Promise<void>
  refreshStats: () => Promise<void>
  markRead: (notificationIds: string[]) => Promise<void>
  markAllRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  deleteAllRead: () => Promise<void>
  reset: () => void
}

let socket: NotificationSocket | null = null

type StoreSetter = (
  partial:
    | Partial<NotificationState>
    | ((state: NotificationState) => Partial<NotificationState>)
) => void

const setLoadingState = (set: StoreSetter, isLoading: boolean) => {
  set({ isLoading })
}

const updateConnectionState = (
  set: StoreSetter,
  status: NotificationSocketStatus
) => {
  set({ isConnected: status === 'connected' })
}

const updateStatsForNewNotification = (
  stats: NotificationStats | null,
  notification: NotificationItem
): NotificationStats | null => {
  if (!stats) return stats

  const currentCount = stats.by_type[notification.type] || 0
  return {
    ...stats,
    total_notifications: stats.total_notifications + 1,
    unread_notifications: stats.unread_notifications + 1,
    by_type: {
      ...stats.by_type,
      [notification.type]: currentCount + 1,
    },
  }
}

const updateStatsAfterDelete = (
  stats: NotificationStats | null,
  notifications: NotificationItem[]
): NotificationStats | null => {
  if (!stats) return stats
  let unreadRemoved = 0
  const byTypeCounts: Record<string, number> = { ...stats.by_type }

  notifications.forEach((item) => {
    if (!item.is_read) unreadRemoved += 1
    if (byTypeCounts[item.type]) {
      byTypeCounts[item.type] = Math.max(0, byTypeCounts[item.type] - 1)
    }
  })

  const totalRemoved = notifications.length
  return {
    ...stats,
    total_notifications: Math.max(0, stats.total_notifications - totalRemoved),
    unread_notifications: Math.max(0, stats.unread_notifications - unreadRemoved),
    read_notifications: Math.max(
      0,
      stats.read_notifications - (totalRemoved - unreadRemoved)
    ),
    by_type: byTypeCounts,
  }
}

const markNotificationsRead = (
  notifications: NotificationItem[],
  notificationIds: string[]
) => {
  const idSet = new Set(notificationIds)
  return notifications.map((item) =>
    idSet.has(item.id) ? { ...item, is_read: true } : item
  )
}

const buildSocketCallbacks = (
  set: StoreSetter,
  get: () => NotificationState
): NotificationSocketCallbacks => ({
  onNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      stats: updateStatsForNewNotification(state.stats, notification),
    }))
  },
  onStats: (stats) => set({ stats }),
  onStatus: (status) => updateConnectionState(set, status),
  onError: (message) => set({ lastError: message }),
})

const ensureSocket = (set: StoreSetter, get: () => NotificationState) => {
  if (!socket) {
    socket = new NotificationSocket(buildSocketCallbacks(set, get))
  }
  return socket
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  stats: null,
  isConnected: false,
  isLoading: false,
  lastError: null,
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
  unreadOnly: false,

  connect: () => {
    if (get().isConnected) return
    ensureSocket(set, get).connect()
  },

  disconnect: () => {
    socket?.disconnect()
    set({ isConnected: false })
  },

  fetchNotifications: async (params) => {
    setLoadingState(set, true)
    try {
      const response = await notificationAPI.getNotifications(params)
      const meta = response.meta
      const totalPages =
        typeof meta?.total_pages === 'number' ? meta.total_pages : get().totalPages
      set({
        notifications: params?.append
          ? [...get().notifications, ...(response.data || [])]
          : response.data || [],
        currentPage: params?.page ?? get().currentPage,
        pageSize: params?.limit ?? get().pageSize,
        unreadOnly: params?.unreadOnly ?? get().unreadOnly,
        totalPages,
      })
    } finally {
      setLoadingState(set, false)
    }
  },

  refreshStats: async () => {
    const response = await notificationAPI.getNotificationStats()
    set({ stats: response.data || null })
  },

  markRead: async (notificationIds) => {
    await notificationAPI.markAsRead(notificationIds)
    set((state) => ({
      notifications: markNotificationsRead(state.notifications, notificationIds),
    }))
    await get().refreshStats()
  },

  markAllRead: async () => {
    await notificationAPI.markAllAsRead()
    set((state) => ({
      notifications: state.notifications.map((item) => ({
        ...item,
        is_read: true,
      })),
    }))
    await get().refreshStats()
  },

  deleteNotification: async (notificationId) => {
    await notificationAPI.deleteNotification(notificationId)
    set((state) => {
      const deleted = state.notifications.filter((item) => item.id === notificationId)
      return {
        notifications: state.notifications.filter((item) => item.id !== notificationId),
        stats: updateStatsAfterDelete(state.stats, deleted),
      }
    })
  },

  deleteAllRead: async () => {
    await notificationAPI.deleteAllRead()
    set((state) => {
      const deleted = state.notifications.filter((item) => item.is_read)
      return {
        notifications: state.notifications.filter((item) => !item.is_read),
        stats: updateStatsAfterDelete(state.stats, deleted),
      }
    })
  },

  reset: () => {
    socket?.disconnect()
    set({
      notifications: [],
      stats: null,
      isConnected: false,
      isLoading: false,
      lastError: null,
      currentPage: 1,
      pageSize: 20,
      totalPages: 1,
      unreadOnly: false,
    })
  },
}))
