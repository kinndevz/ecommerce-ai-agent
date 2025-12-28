import { create } from 'zustand'
import {
  chatAPI,
  type ConversationDetail,
  type ConversationSummary,
  type MessageResponse,
} from '@/api/chat.api'
import { toast } from 'sonner'

interface ChatState {
  conversations: ConversationSummary[]
  currentConversation: ConversationDetail | null
  isLoading: boolean
  isInitializing: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  initChat: () => Promise<void>
  sendMessage: (message: string) => Promise<void>
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

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isLoading: false,
  isInitializing: false,
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),

  initChat: async () => {
    if (get().currentConversation || get().isInitializing) return

    set({ isInitializing: true })
    try {
      const response = await chatAPI.getConversations(1, 1)

      if (response.conversations.length > 0) {
        const latestId = response.conversations[0].id
        const detail = await chatAPI.getConversationDetail(latestId)

        if (detail.messages) {
          detail.messages = sortMessagesByDate(detail.messages)
        }

        set({ currentConversation: detail })
      } else {
        set({ currentConversation: null })
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
      if (detail.messages) {
        detail.messages = sortMessagesByDate(detail.messages)
      }
      set({ currentConversation: detail })
    } catch (error) {
      toast.error('Không thể tải hội thoại')
    } finally {
      set({ isLoading: false })
    }
  },

  startNewConversation: () => {
    set({ currentConversation: null })
  },

  sendMessage: async (message: string) => {
    const { currentConversation } = get()
    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      created_at: new Date().toISOString(),
    }

    set((state) => {
      const prevMsgs = state.currentConversation?.messages || []
      return {
        currentConversation: {
          ...state.currentConversation!,
          id: state.currentConversation?.id || 'temp-id',
          thread_id: state.currentConversation?.thread_id || '',
          title: state.currentConversation?.title || 'New Chat',
          created_at:
            state.currentConversation?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          messages: [...prevMsgs, tempUserMsg],
        },
      }
    })

    try {
      const response = await chatAPI.sendMessage({
        message,
        conversation_id: currentConversation?.id,
      })

      set((state) => {
        const currentMsgs = state.currentConversation?.messages || []

        return {
          currentConversation: {
            ...state.currentConversation!,
            id: response.conversation_id,
            thread_id: response.thread_id,
            messages: [...currentMsgs, response.message],
          },
        }
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gửi tin nhắn thất bại')
    }
  },

  reset: () => {
    set({
      conversations: [],
      currentConversation: null,
      isLoading: false,
      isInitializing: false,
      isOpen: false,
    })
  },
}))
