export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REVIEW_RECEIVED'
  | 'PROMOTION'
  | 'SYSTEM'

export const ORDER_NOTIFICATION_TYPES: NotificationType[] = [
  'ORDER_CREATED',
  'ORDER_CONFIRMED',
  'ORDER_SHIPPED',
  'ORDER_DELIVERED',
  'ORDER_CANCELLED',
]

export const UPDATE_NOTIFICATION_TYPES: NotificationType[] = [
  'PROMOTION',
  'SYSTEM',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'REVIEW_RECEIVED',
]

export interface NotificationItem {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data: string | null
  action_url: string | null
  is_read: boolean
  read_at?: string | null
  created_at: string
}

export interface NotificationQueryParams {
  page?: number
  limit?: number
  unreadOnly?: boolean
}

export interface NotificationStats {
  total_notifications: number
  unread_notifications: number
  read_notifications: number
  by_type: Record<string, number>
}

export interface NotificationCreateRequest {
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: string | null
  action_url?: string | null
}

export interface BroadcastNotificationRequest {
  type: NotificationType
  title: string
  message: string
  action_url?: string | null
}

export interface NotificationOnlineUsers {
  online_users: string[]
  online_count: number
  total_connections: number
}

export interface NotificationConnectionStatus {
  user_id: string
  is_online: boolean
  connection_count: number
}

export interface ApiSuccessResponse<T> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}

export interface WsTicketData {
  ticket: string
  expires_at: string
}

export type NotificationWsMessage =
  | { type: 'notification'; data: NotificationItem }
  | { type: 'stats'; data: NotificationStats }
  | { type: 'pong'; timestamp: string }
