import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

// PRODUCT TYPES (from MCP artifacts)
export interface ProductData {
  id: string
  name: string
  slug: string
  tags: string[]
  price: number
  benefits: string[]
  concerns: string[]
  brand_name: string
  skin_types: string[]
  description: string
  is_available: boolean
  category_name: string
  product_image: string
  rating_average: number
  stock_quantity: number
}

export interface ProductMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface MCPData {
  data: ProductData[]
  meta: ProductMeta
  message: string
  success: boolean
}

export interface Artifact {
  success: boolean
  data_mcp: MCPData
  tool_name: string
  tool_call_id: string
}

// MESSAGE TYPES
export interface MessageMetadata {
  artifacts?: Artifact[]
  tool_calls?: number
  has_artifacts?: boolean
  [key: string]: any
}

export interface MessageResponse {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  artifacts?: Artifact[]
  message_metadata?: MessageMetadata
  created_at: string
}

// REQUEST/RESPONSE TYPES
export interface ChatMessageRequest {
  message: string
  conversation_id?: string
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
  updated_at: string | null
  message_count: number
}

export interface ConversationDetail {
  id: string
  thread_id: string
  title: string
  messages: MessageResponse[]
  created_at: string
  updated_at: string | null
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
  data: T
  meta?: Record<string, any> | null
}

// CHAT API METHODS
export const chatAPI = {
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

  deleteConversation: async (
    conversationId: string
  ): Promise<{ conversation_id: string }> => {
    const { data } = await api.delete<
      ApiSuccessResponse<{ conversation_id: string }>
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
