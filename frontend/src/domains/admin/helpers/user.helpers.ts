import {
  TFA_STATUS_CONFIG,
  USER_ROLE_CONFIG,
  USER_STATUS_CONFIG,
} from '@/api/services/user.constants'

export const getUserInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

export const formatUserDate = (value: string) =>
  new Date(value).toLocaleDateString()

export const formatUserTime = (value: string) =>
  new Date(value).toLocaleTimeString()

export const formatUserLongDateTime = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const getUserStatusConfig = (status: string) => {
  const key = status.toUpperCase()
  return (
    USER_STATUS_CONFIG[key] || {
      label: status,
      className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    }
  )
}

export const getUserRoleConfig = (roleName: string) => {
  const key = roleName.toUpperCase()
  return (
    USER_ROLE_CONFIG[key] || {
      label: roleName,
      className: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    }
  )
}

export const getUserTfaConfig = (isEnabled: boolean) =>
  isEnabled ? TFA_STATUS_CONFIG.enabled : TFA_STATUS_CONFIG.disabled
