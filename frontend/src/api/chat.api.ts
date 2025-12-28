import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

// INTERFACES & TYPES
export interface ChatMessageRequest {
  message: string
  conversation_id?: string
}

export interface MessageResponse {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  message_metadata?: Record<string, any>
  created_at: string
}

export interface ChatResponse {
  conversation_id: string
  thread_id: string
  message: MessageResponse
}

export interface ConversationSummary {
  id: string
  thread_id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

export interface ConversationDetail {
  id: string
  thread_id: string
  title: string | null
  messages: MessageResponse[]
  created_at: string
  updated_at: string
}

export interface ConversationsResponse {
  conversations: ConversationSummary[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T | null
  meta?: Record<string, any> | null
}

// CHAT API METHODS
export const chatAPI = {
  /**
   * Send message to AI assistant
   * Creates new conversation if conversation_id not provided
   */
  sendMessage: async (
    messageData: ChatMessageRequest
  ): Promise<ChatResponse> => {
    const { data } = await api.post<ApiSuccessResponse<ChatResponse>>(
      API_ENDPOINT.CHAT,
      messageData
    )

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to send message')
    }

    return data.data
  },

  /**
   * Get user's conversation list
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   */
  getConversations: async (
    page: number = 1,
    limit: number = 20
  ): Promise<ConversationsResponse> => {
    const { data } = await api.get<ApiSuccessResponse<ConversationsResponse>>(
      API_ENDPOINT.CHAT_CONVERSATIONS,
      {
        params: { page, limit },
      }
    )

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to get conversations')
    }

    return data.data
  },

  /**
   * Get conversation detail with all messages
   */
  getConversationDetail: async (
    conversationId: string
  ): Promise<ConversationDetail> => {
    const { data } = await api.get<ApiSuccessResponse<ConversationDetail>>(
      API_ENDPOINT.CHAT_CONVERSATION_DETAIL(conversationId)
    )

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to get conversation detail')
    }

    return data.data
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (
    conversationId: string
  ): Promise<{ deleted_id: string }> => {
    const { data } = await api.delete<
      ApiSuccessResponse<{ deleted_id: string }>
    >(API_ENDPOINT.DELETE_CONVERSATION(conversationId))

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to delete conversation')
    }

    return data.data
  },
}

// Export types
export type {
  ChatMessageRequest as SendMessageRequest,
  ChatResponse as SendMessageResponse,
}
