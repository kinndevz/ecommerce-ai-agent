export interface StreamingMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  isStreaming?: boolean
}

export interface StreamingStatus {
  message: string
  stage?: string
}
