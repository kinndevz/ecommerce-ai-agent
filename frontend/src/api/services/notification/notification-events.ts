import type {
  NotificationWsMessage,
  NotificationItem,
  NotificationStats,
} from '@/api/types/notification.types'

const isObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null
}

const isNotificationItem = (value: unknown): value is NotificationItem => {
  return isObject(value) && typeof value.id === 'string'
}

const isStats = (value: unknown): value is NotificationStats => {
  return (
    isObject(value) &&
    typeof value.total_notifications === 'number' &&
    typeof value.unread_notifications === 'number'
  )
}

const isNotificationMessage = (
  value: unknown
): value is { type: 'notification'; data: NotificationItem } => {
  return isObject(value) && value.type === 'notification' && isNotificationItem(value.data)
}

const isStatsMessage = (
  value: unknown
): value is { type: 'stats'; data: NotificationStats } => {
  return isObject(value) && value.type === 'stats' && isStats(value.data)
}

const isPongMessage = (
  value: unknown
): value is { type: 'pong'; timestamp: string } => {
  return (
    isObject(value) &&
    value.type === 'pong' &&
    typeof value.timestamp === 'string'
  )
}

export const parseNotificationWsMessage = (
  raw: string
): NotificationWsMessage | null => {
  try {
    const parsed = JSON.parse(raw)

    if (isNotificationMessage(parsed)) return parsed
    if (isStatsMessage(parsed)) return parsed
    if (isPongMessage(parsed)) return parsed

    return null
  } catch {
    return null
  }
}
