import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { useChatStore } from '@/stores/useChatStore'
import {
  hasPendingAiMessage,
  isVisibleMessage,
  toUiMessages,
} from '@/domains/customer/helpers/artifacts'
import { ChatLoadingSkeleton } from '../ChatLoadingSkeleton'
import { PopupEmptyState } from './PopupEmptyState'
import { ChatMessage } from '../ChatMessage'
import { TypingIndicator } from '../TypingIndicator'

interface PopupMessageListProps {
  userAvatar: string
}

export function PopupMessageList({ userAvatar }: PopupMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const {
    isOpen,
    currentConversation,
    isInitializing,
    streamingStatus,
    currentToolCall,
  } = useChatStore()

  const visibleMessages = currentConversation
    ? toUiMessages(currentConversation.messages).filter(isVisibleMessage)
    : []

  const pendingAi = hasPendingAiMessage(currentConversation?.messages)
  const lastIsAi = visibleMessages[visibleMessages.length - 1]?.sender === 'ai'
  const isStreaming = !!streamingStatus || !!currentToolCall
  const showTyping = isStreaming && (pendingAi || !lastIsAi)

  useEffect(() => {
    if (!isOpen) return
    const viewport = scrollRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    )
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight
      })
    }
  }, [visibleMessages.length, showTyping, isOpen])

  return (
    <ScrollArea ref={scrollRef} className='flex-1 overflow-hidden'>
      <div className='pl-3 pr-5 py-4 w-full max-w-full overflow-x-hidden'>
        {isInitializing ? (
          <ChatLoadingSkeleton />
        ) : visibleMessages.length === 0 ? (
          <PopupEmptyState />
        ) : (
          <div className='space-y-1 w-full min-w-0 flex flex-col'>
            {visibleMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} userAvatar={userAvatar} />
            ))}

            {showTyping && (
              <div className='animate-in fade-in duration-200'>
                <TypingIndicator />
                {(currentToolCall || streamingStatus) && (
                  <p className='text-xs text-muted-foreground ml-9 mt-1 animate-pulse'>
                    {currentToolCall || streamingStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
