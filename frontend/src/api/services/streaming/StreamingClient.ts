import type { Artifact } from '@/api/chat.api'
import { API_ENDPOINT } from '../constants'
import { getAccessToken } from '../token.service'

interface StreamCallbacks {
  onStatus?: (status: string) => void
  onToolCall?: (toolName: string) => void
  onArtifact?: (artifact: Artifact) => void
  onContent?: (chunk: string) => void
  onDone?: (messageId: string, conversationId: string, threadId: string) => void
  onError?: (error: string) => void
}

interface StreamEvent {
  type: 'status' | 'artifact' | 'content' | 'done' | 'error'
  message?: string
  stage?: string
  tool_name?: string
  tool_call_id?: string
  data?: any
  success?: boolean
  chunk?: string
  message_id?: string
  conversation_id?: string
  thread_id?: string
  total_length?: number
  total_artifacts?: number
}

export class StreamingClient {
  private readonly baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URLL || 'http://localhost:8000'
  }

  async streamMessage(
    message: string,
    conversationId: string | null,
    callbacks: StreamCallbacks,
    options?: { isActive?: boolean }
  ): Promise<void> {
    const accessToken = getAccessToken()

    if (!accessToken) {
      callbacks.onError?.('Unauthorized: Please login first')
      return
    }

    const url = `${this.baseURL}${API_ENDPOINT.CHAT_STREAM}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          is_active: options?.isActive ?? true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is not readable')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue

          try {
            const jsonStr = line.slice(6)
            const event: StreamEvent = JSON.parse(jsonStr)

            this.handleEvent(event, callbacks)
          } catch (err) {
            console.error('Parse error:', err, 'Line:', line)
          }
        }
      }
    } catch (error: any) {
      console.error('Streaming error:', error)
      callbacks.onError?.(error.message || 'Connection failed')
    }
  }

  private handleEvent(event: StreamEvent, callbacks: StreamCallbacks): void {
    switch (event.type) {
      case 'status':
        if (event.message) {
          callbacks.onStatus?.(event.message)
        }
        break

      case 'artifact':
        if (event.tool_name) {
          callbacks.onToolCall?.(event.tool_name)
        }

        if (event.data) {
          const artifact: Artifact = {
            success: event.success ?? true,
            data_mcp: event.data,
            tool_name: event.tool_name || 'unknown',
            tool_call_id: event.tool_call_id || '',
          }
          callbacks.onArtifact?.(artifact)
        }
        break

      case 'content':
        if (event.chunk) {
          callbacks.onContent?.(event.chunk)
        }
        break

      case 'done':
        if (event.message_id && event.conversation_id && event.thread_id) {
          callbacks.onDone?.(
            event.message_id,
            event.conversation_id,
            event.thread_id
          )
        }
        break

      case 'error':
        if (event.message) {
          callbacks.onError?.(event.message)
        }
        break
    }
  }
}
