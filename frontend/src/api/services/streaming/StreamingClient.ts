import { getAccessToken } from '@/api/services/token.service'

// ===== TYPES =====
export enum StreamEventType {
  STATUS = 'status',
  CONTENT = 'content',
  DONE = 'done',
  ERROR = 'error',
}

export interface StreamEvent {
  type: StreamEventType
  message?: string
  stage?: string
  chunk?: string
  message_id?: string
  conversation_id?: string
  thread_id?: string
  total_length?: number
}

export interface StreamOptions {
  signal?: AbortSignal
  onStatus?: (message: string, stage?: string) => void
  onContent?: (chunk: string) => void
  onDone?: (
    messageId: string,
    conversationId: string,
    threadId?: string
  ) => void // ✅ UPDATE
  onError?: (error: string) => void
}

// ===== CLIENT =====
export class StreamingClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || import.meta.env.VITE_API_BASE_URLL || 'http://localhost:8000'
  }

  async streamMessage(
    message: string,
    conversationId: string | null,
    options: StreamOptions = {}
  ): Promise<void> {
    const token = getAccessToken()
    if (!token) throw new Error('Authentication required')

    const url = this.buildUrl(conversationId)
    const response = await this.sendRequest(
      url,
      token,
      message,
      conversationId,
      options.signal
    )

    await this.processStream(response, options)
  }

  private buildUrl(conversationId: string | null): string {
    return conversationId
      ? `${this.baseUrl}/chat/conversations/${conversationId}/messages/stream`
      : `${this.baseUrl}/chat/messages/stream`
  }

  private async sendRequest(
    url: string,
    token: string,
    message: string,
    conversationId: string | null,
    signal?: AbortSignal
  ): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, conversation_id: conversationId }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    return response
  }

  private async processStream(
    response: Response,
    options: StreamOptions
  ): Promise<void> {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        this.parseEvents(chunk, options)
      }
    } finally {
      reader.releaseLock()
    }
  }

  private parseEvents(chunk: string, options: StreamOptions): void {
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event: StreamEvent = JSON.parse(line.slice(6))
          this.handleEvent(event, options)
        } catch (error) {
          console.error('Failed to parse SSE event:', error)
        }
      }
    }
  }

  private handleEvent(event: StreamEvent, options: StreamOptions): void {
    switch (event.type) {
      case StreamEventType.STATUS:
        options.onStatus?.(event.message || '', event.stage)
        break

      case StreamEventType.CONTENT:
        options.onContent?.(event.chunk || '')
        break

      case StreamEventType.DONE:
        // ✅ FIX: Pass conversation_id and thread_id
        options.onDone?.(
          event.message_id || '',
          event.conversation_id || '',
          event.thread_id
        )
        break

      case StreamEventType.ERROR:
        options.onError?.(event.message || 'Unknown error')
        break
    }
  }
}
