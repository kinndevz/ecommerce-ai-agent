const DEFAULT_API_BASE_URL = 'http://localhost:8000'

const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URLL || DEFAULT_API_BASE_URL
}

const toWebSocketBaseUrl = (baseUrl: string): string => {
  if (baseUrl.startsWith('https://')) {
    return baseUrl.replace('https://', 'wss://')
  }

  if (baseUrl.startsWith('http://')) {
    return baseUrl.replace('http://', 'ws://')
  }

  return baseUrl
}

const trimTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export const buildNotificationWsUrl = (ticket: string): string => {
  const baseUrl = getApiBaseUrl()
  const wsBaseUrl = toWebSocketBaseUrl(baseUrl)
  const normalized = trimTrailingSlash(wsBaseUrl)
  const encodedTicket = encodeURIComponent(ticket)

  return `${normalized}/notifications/ws?ticket=${encodedTicket}`
}
