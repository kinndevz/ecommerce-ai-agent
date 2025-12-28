import { useState, useRef, useEffect } from 'react'
import { Minimize2, Maximize2, X, RefreshCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { AiFillTwitch } from 'react-icons/ai'
import { ChatMessage, TimestampSeparator, type Message } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { type MessageResponse } from '@/api/chat.api'
import { useChatStore } from '@/stores/useChatStore'
import { ChatLoadingSkeleton } from './ChatLoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'

export const ChatInterface = () => {
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    currentConversation,
    isLoading,
    isInitializing,
    initChat,
    sendMessage,
    startNewConversation,
    setIsOpen,
  } = useChatStore()

  const { user } = useAuth()
  useEffect(() => {
    initChat()
  }, [initChat])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [currentConversation?.messages, isTyping, isMinimized, isInitializing])

  const mapApiMessagesToUi = (apiMessages: MessageResponse[]): Message[] => {
    return apiMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(msg.created_at),
      status: 'read',
    }))
  }

  const handleSendMessage = async (content: string) => {
    setIsTyping(true)
    try {
      await sendMessage(content)
    } finally {
      setIsTyping(false)
    }
  }

  const uiMessages = currentConversation
    ? mapApiMessagesToUi(currentConversation.messages)
    : []

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-full max-w-md flex flex-col',
        'bg-card border-2 border-border rounded-2xl shadow-2xl',
        'transition-all duration-300 overflow-hidden',
        isMinimized ? 'h-16' : 'h-150'
      )}
    >
      <div className='flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <div className='w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg'>
              <AiFillTwitch className='w-5 h-5 text-accent-foreground' />
            </div>
            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card' />
          </div>
          <div>
            <h3 className='font-semibold text-sm'>AI Assistant</h3>
            <p className='text-xs text-muted-foreground'>
              {isTyping ? 'Đang nhập...' : 'Trực tuyến'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          {!isMinimized && (
            <Button
              variant='ghost'
              size='icon'
              onClick={startNewConversation}
              title='Cuộc trò chuyện mới'
            >
              <RefreshCcw className='w-4 h-4' />
            </Button>
          )}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className='w-4 h-4' />
            ) : (
              <Minimize2 className='w-4 h-4' />
            )}
          </Button>

          <Button variant='ghost' size='icon' onClick={() => setIsOpen(false)}>
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className='flex-1 overflow-hidden relative'>
            {(isInitializing || (isLoading && !currentConversation)) && (
              <div className='absolute inset-0 z-20 bg-background'>
                <ChatLoadingSkeleton />
              </div>
            )}

            <ScrollArea ref={scrollAreaRef} className='h-full'>
              <div className='p-4'>
                {!isInitializing && uiMessages.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-1000 mt-10'>
                    <div className='w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-xl'>
                      <AiFillTwitch className='w-8 h-8 text-accent-foreground' />
                    </div>
                    <div className='space-y-2'>
                      <h4 className='text-lg font-semibold'>Xin chào! 👋</h4>
                      <p className='text-sm text-muted-foreground max-w-xs mx-auto'>
                        Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm
                        nay?
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-1'>
                    {uiMessages.map((message, index) => {
                      const prevMessage =
                        index > 0 ? uiMessages[index - 1] : undefined
                      const nextMessage =
                        index < uiMessages.length - 1
                          ? uiMessages[index + 1]
                          : undefined
                      const showTimestamp =
                        !prevMessage ||
                        new Date(message.timestamp).toDateString() !==
                          new Date(prevMessage.timestamp).toDateString()
                      const showAvatar =
                        !nextMessage || message.sender !== nextMessage.sender

                      return (
                        <div key={message.id}>
                          {showTimestamp && (
                            <TimestampSeparator timestamp={message.timestamp} />
                          )}
                          <ChatMessage
                            message={message}
                            showAvatar={showAvatar}
                            userAvatar={user?.avatar}
                          />
                        </div>
                      )
                    })}
                    {isTyping && <TypingIndicator />}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className='shrink-0'>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping || isInitializing}
              placeholder='Nhập tin nhắn...'
            />
          </div>
        </>
      )}
    </div>
  )
}
