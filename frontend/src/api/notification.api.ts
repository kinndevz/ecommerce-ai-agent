import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  BroadcastNotificationRequest,
  NotificationConnectionStatus,
  NotificationCreateRequest,
  NotificationItem,
  NotificationOnlineUsers,
  NotificationStats,
  WsTicketData,
} from './notification.types'

export interface NotificationQueryParams {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

const buildNotificationParams = (params?: NotificationQueryParams) => {
  if (!params) return undefined

  const query: Record<string, any> = {}

  if (params.page) query.page = params.page
  if (params.limit) query.limit = params.limit
  if (params.unreadOnly !== undefined) query.unread_only = params.unreadOnly

  return query
}

export const notificationAPI = {
  getNotifications: async (
    params?: NotificationQueryParams
  ): Promise<ApiSuccessResponse<NotificationItem[]>> => {
    const { data } = await api.get<ApiSuccessResponse<NotificationItem[]>>(
      API_ENDPOINT.NOTIFICATIONS,
      { params: buildNotificationParams(params) }
    )
    return data
  },

  getNotificationStats: async (): Promise<ApiSuccessResponse<NotificationStats>> => {
    const { data } = await api.get<ApiSuccessResponse<NotificationStats>>(
      API_ENDPOINT.NOTIFICATION_STATS
    )
    return data
  },

  markAsRead: async (
    notificationIds: string[]
  ): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.post<ApiSuccessResponse<null>>(
      API_ENDPOINT.NOTIFICATION_MARK_READ,
      { notification_ids: notificationIds }
    )
    return data
  },

  markAllAsRead: async (): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.post<ApiSuccessResponse<null>>(
      API_ENDPOINT.NOTIFICATION_MARK_ALL_READ
    )
    return data
  },

  deleteNotification: async (
    notificationId: string
  ): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.NOTIFICATIONS}/${notificationId}`
    )
    return data
  },

  deleteAllRead: async (): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.NOTIFICATIONS}/clear/read`
    )
    return data
  },

  getWsTicket: async (): Promise<ApiSuccessResponse<WsTicketData>> => {
    const { data } = await api.post<ApiSuccessResponse<WsTicketData>>(
      API_ENDPOINT.NOTIFICATION_WS_TICKET
    )
    return data
  },

  createNotification: async (
    payload: NotificationCreateRequest
  ): Promise<ApiSuccessResponse<NotificationItem>> => {
    const { data } = await api.post<ApiSuccessResponse<NotificationItem>>(
      API_ENDPOINT.NOTIFICATIONS,
      payload
    )
    return data
  },

  broadcastNotification: async (
    payload: BroadcastNotificationRequest
  ): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.post<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.NOTIFICATIONS}/broadcast`,
      payload
    )
    return data
  },

  getOnlineUsers: async (): Promise<ApiSuccessResponse<NotificationOnlineUsers>> => {
    const { data } = await api.get<ApiSuccessResponse<NotificationOnlineUsers>>(
      `${API_ENDPOINT.NOTIFICATIONS}/admin/online-users`
    )
    return data
  },

  getUserConnectionStatus: async (
    userId: string
  ): Promise<ApiSuccessResponse<NotificationConnectionStatus>> => {
    const { data } = await api.get<ApiSuccessResponse<NotificationConnectionStatus>>(
      `${API_ENDPOINT.NOTIFICATIONS}/admin/connection-status/${userId}`
    )
    return data
  },
}
