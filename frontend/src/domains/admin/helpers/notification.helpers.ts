import type { NotificationType } from '@/api/types/notification.types'

export const formatNotificationTypeLabel = (type: NotificationType) =>
  type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export const getNotificationTypeBadgeClass = (type: NotificationType) => {
  switch (type) {
    case 'ORDER_CREATED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_SHIPPED':
    case 'ORDER_DELIVERED':
    case 'ORDER_CANCELLED':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    case 'REVIEW_RECEIVED':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    case 'PROMOTION':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'SYSTEM':
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
  }
}

export const getNotificationStatusBadgeClass = (isRead: boolean) =>
  isRead
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : 'bg-red-500/10 text-red-600 border-red-500/20'
