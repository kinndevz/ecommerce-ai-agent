import type { NotificationItem, NotificationStats } from '@/api/types/notification.types'
import { getAccessToken } from '@/api/services/token.service'
import { notificationAPI } from '@/api/notification.api'
import { buildNotificationWsUrl } from './notification-url'
import { parseNotificationWsMessage } from './notification-events'
import { getRetryDelayMs } from './notification-retry'

export type NotificationSocketStatus =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error'
  | 'missing_token'

export interface NotificationSocketCallbacks {
  onNotification?: (item: NotificationItem) => void
  onStats?: (stats: NotificationStats) => void
  onStatus?: (status: NotificationSocketStatus) => void
  onError?: (message: string) => void
}

export class NotificationSocket {
  private socket: WebSocket | null = null
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private manualClose = false
  private isConnecting = false

  constructor(private callbacks: NotificationSocketCallbacks = {}) {}

  connect(): void {
    void this.connectWithTicket()
  }

  private async connectWithTicket(): Promise<void> {
    if (this.isConnecting) return

    if (this.socket) {
      const state = this.socket.readyState
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        return
      }
    }

    const token = getAccessToken()
    if (!token) {
      this.emitStatus('missing_token')
      this.emitError('Missing access token')
      return
    }

    this.isConnecting = true
    this.manualClose = false

    try {
      const response = await notificationAPI.getWsTicket()
      const ticket = response.data?.ticket
      if (!ticket) {
        throw new Error('Missing ticket')
      }
      this.openSocket(buildNotificationWsUrl(ticket))
    } catch {
      this.emitStatus('error')
      this.emitError('Failed to obtain WebSocket ticket')
      this.scheduleReconnect()
    } finally {
      this.isConnecting = false
    }
  }

  disconnect(): void {
    this.manualClose = true
    this.stopReconnect()
    this.stopHeartbeat()
    this.closeSocket()
    this.emitStatus('disconnected')
  }

  sendPing(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'ping' }))
    }
  }

  private openSocket(url: string): void {
    this.closeSocket()
    this.socket = new WebSocket(url)
    this.socket.onopen = () => this.handleOpen()
    this.socket.onclose = () => this.handleClose()
    this.socket.onerror = () => this.handleError()
    this.socket.onmessage = (event) => this.handleMessage(event.data)
  }

  private closeSocket(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  private handleOpen(): void {
    this.reconnectAttempts = 0
    this.emitStatus('connected')
    this.startHeartbeat()
  }

  private handleClose(): void {
    this.stopHeartbeat()
    if (!this.manualClose) {
      this.scheduleReconnect()
    }
  }

  private handleError(): void {
    this.emitStatus('error')
    this.emitError('WebSocket error')
  }

  private handleMessage(raw: string): void {
    const message = parseNotificationWsMessage(raw)
    if (!message) return

    if (message.type === 'notification') {
      this.callbacks.onNotification?.(message.data)
    }

    if (message.type === 'stats') {
      this.callbacks.onStats?.(message.data)
    }
  }

  private scheduleReconnect(): void {
    if (!getAccessToken()) {
      this.emitStatus('missing_token')
      return
    }

    const delay = getRetryDelayMs(this.reconnectAttempts)
    this.reconnectAttempts += 1
    this.emitStatus('reconnecting')
    this.reconnectTimer = window.setTimeout(() => this.connect(), delay)
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => this.sendPing(), 30000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private emitStatus(status: NotificationSocketStatus): void {
    this.callbacks.onStatus?.(status)
  }

  private emitError(message: string): void {
    this.callbacks.onError?.(message)
  }
}
