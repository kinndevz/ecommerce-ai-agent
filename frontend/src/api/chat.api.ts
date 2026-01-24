import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  ChatMessageRequest,
  ChatResponse,
  ConversationDetail,
  ConversationsResponse,
  ConversationSummary,
  Artifact,
  MCPData,
  MessageMetadata,
  MessageResponse,
  ProductData,
  ProductMeta,
} from './types/chat.types'

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

export type {
  ChatMessageRequest,
  ChatResponse,
  ConversationDetail,
  ConversationsResponse,
  ConversationSummary,
  Artifact,
  MCPData,
  MessageMetadata,
  MessageResponse,
  ProductData,
  ProductMeta,
  ApiSuccessResponse,
} from './types/chat.types'

export type {
  ChatMessageRequest as SendMessageRequest,
  ChatResponse as SendMessageResponse,
}
