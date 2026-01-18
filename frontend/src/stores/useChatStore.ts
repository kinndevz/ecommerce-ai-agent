import { create } from 'zustand'
import {
  chatAPI,
  type ConversationDetail,
  type ConversationSummary,
  type MessageResponse,
  type Artifact,
} from '@/api/chat.api'
import { toast } from 'sonner'
import { StreamingClient } from '@/api/services/streaming'

interface ChatState {
  conversations: ConversationSummary[]
  currentConversation: ConversationDetail | null
  isLoading: boolean
  isInitializing: boolean
  isOpen: boolean
  streamingStatus: string | null
  currentToolCall: string | null
  setIsOpen: (open: boolean) => void
  initChat: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
  sendMessageStreaming: (message: string) => Promise<void>
  startNewConversation: () => void
  fetchConversationDetail: (id: string) => Promise<void>
  reset: () => void
}

const sortMessagesByDate = (messages: MessageResponse[]) => {
  return messages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

const createTempMessage = (
  role: 'user' | 'assistant',
  content: string = ''
): MessageResponse => ({
  id: `${role}-${Date.now()}`,
  role,
  content,
  artifacts: [],
  message_metadata: {},
  created_at: new Date().toISOString(),
})

const hasRealConversationId = (id?: string): boolean => {
  return !!id && id !== 'temp-id'
}

const createEmptyConversation = (
  messages: MessageResponse[]
): ConversationDetail => ({
  id: undefined as any,
  thread_id: '',
  title: 'New Chat',
  messages,
  created_at: new Date().toISOString(),
  updated_at: null,
})

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isInitializing: false,
  isOpen: false,
  streamingStatus: null,
  currentToolCall: null,

  setIsOpen: (open) => set({ isOpen: open }),

  initChat: async () => {
    const { currentConversation, isInitializing } = get()
    if (currentConversation || isInitializing) return

    set({ isInitializing: true })

    try {
      const { conversations } = await chatAPI.getConversations(1, 1)

      if (conversations.length > 0) {
        const detail = await chatAPI.getConversationDetail(conversations[0].id)
        detail.messages = sortMessagesByDate(detail.messages)
        set({ currentConversation: detail })
      }
    } catch (error) {
      console.error('Failed to init chat:', error)
    } finally {
      set({ isInitializing: false })
    }
  },

  fetchConversationDetail: async (id: string) => {
    set({ isLoading: true })

    try {
      const detail = await chatAPI.getConversationDetail(id)
      detail.messages = sortMessagesByDate(detail.messages)
      set({ currentConversation: detail })
    } catch (error) {
      toast.error('Không thể tải hội thoại')
    } finally {
      set({ isLoading: false })
    }
  },

  startNewConversation: () => {
    set({
      currentConversation: null,
      streamingStatus: null,
      currentToolCall: null,
    })
  },

  sendMessage: async (message: string) => {
    const { currentConversation } = get()
    const userMsg = createTempMessage('user', message)

    set((state) => ({
      currentConversation: {
        ...(state.currentConversation || createEmptyConversation([])),
        messages: [...(state.currentConversation?.messages || []), userMsg],
      },
    }))

    try {
      const response = await chatAPI.sendMessage({
        message,
        conversation_id: currentConversation?.id,
      })

      set((state) => ({
        currentConversation: {
          ...state.currentConversation!,
          id: response.conversation_id,
          thread_id: response.thread_id,
          messages: [
            ...(state.currentConversation?.messages || []),
            response.message,
          ],
        },
      }))
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi tin nhắn thất bại')
    }
  },

  sendMessageStreaming: async (message: string) => {
    const { currentConversation } = get()

    const userMsg = createTempMessage('user', message)
    const aiMsg = createTempMessage('assistant')

    set((state) => ({
      currentConversation: {
        ...(state.currentConversation || createEmptyConversation([])),
        messages: [
          ...(state.currentConversation?.messages || []),
          userMsg,
          aiMsg,
        ],
      },
    }))

    const conversationId = hasRealConversationId(currentConversation?.id)
      ? currentConversation!.id
      : null

    try {
      const client = new StreamingClient()

      await client.streamMessage(message, conversationId, {
        onStatus: (statusMessage) => {
          set({ streamingStatus: statusMessage })
        },

        onToolCall: (toolName) => {
          set({ currentToolCall: `Calling tool: ${toolName}` })
        },

        onArtifact: (artifact: Artifact) => {
          set((state) => ({
            currentConversation: state.currentConversation
              ? {
                  ...state.currentConversation,
                  messages: state.currentConversation.messages.map((msg) =>
                    msg.id === aiMsg.id
                      ? {
                          ...msg,
                          artifacts: [...(msg.artifacts || []), artifact],
                          message_metadata: {
                            ...msg.message_metadata,
                            has_artifacts: true,
                          },
                        }
                      : msg
                  ),
                }
              : null,

            currentToolCall: `Used tool: ${artifact.tool_name}`,
            streamingStatus: null,
          }))
        },

        onContent: (chunk) => {
          set((state) => ({
            currentToolCall: null,
            streamingStatus: 'Typing...',
            currentConversation: {
              ...state.currentConversation!,
              messages: state.currentConversation!.messages.map((msg) =>
                msg.id === aiMsg.id
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              ),
            },
          }))
        },

        onDone: (messageId, conversationId, threadId) => {
          set((state) => ({
            streamingStatus: null,
            currentToolCall: null,
            currentConversation: {
              ...state.currentConversation!,
              id: conversationId || state.currentConversation!.id,
              thread_id: threadId || state.currentConversation!.thread_id,
              messages: state.currentConversation!.messages.map((msg) =>
                msg.id === aiMsg.id ? { ...msg, id: messageId } : msg
              ),
            },
          }))
        },

        onError: (error) => {
          toast.error(error)

          set((state) => ({
            streamingStatus: null,
            currentToolCall: null,
            currentConversation: {
              ...state.currentConversation!,
              messages: state.currentConversation!.messages.filter(
                (msg) => msg.id !== aiMsg.id
              ),
            },
          }))
        },
      })
    } catch (error: any) {
      toast.error(error.message || 'Streaming failed')

      set((state) => ({
        streamingStatus: null,
        currentToolCall: null,
        currentConversation: {
          ...state.currentConversation!,
          messages: state.currentConversation!.messages.filter(
            (msg) => msg.id !== aiMsg.id
          ),
        },
      }))
    }
  },

  reset: () => {
    set({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      isInitializing: false,
      isOpen: false,
      streamingStatus: null,
      currentToolCall: null,
    })
  },
}))
