import { useState, useRef, useEffect } from 'react'
import { Bot, Minimize2, Maximize2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { ChatMessage, TimestampSeparator, type Message } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'
import { ChatInput } from './ChatInput'
import { cn } from '@/lib/utils'
import { AiFillTwitch } from 'react-icons/ai'

interface ChatInterfaceProps {
  onClose?: () => void
  initialMessages?: Message[]
}

export const ChatInterface = ({
  onClose,
  initialMessages = [],
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new message
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    }

    setMessages((prev) => [...prev, userMessage])

    // Update status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
        )
      )
    }, 500)

    // Simulate AI typing
    setIsTyping(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(content),
        sender: 'ai',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)

      // Mark user message as read
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, status: 'read' as const }
              : msg
          )
        )
      }, 500)
    }, 1500)
  }

  // Mock AI response (replace with actual AI logic)
  const getAIResponse = (userMessage: string): string => {
    const responses = [
      'Tôi ở đây để giúp bạn! Hãy cho tôi biết thêm chi tiết.',
      'Đó là câu hỏi hay! Đây là những gì tôi nghĩ...',
      'Tôi hiểu. Để tôi cung cấp cho bạn một số thông tin.',
      'Chắc chắn rồi! Tôi có thể giúp bạn điều đó.',
      'Cảm ơn bạn đã hỏi! Đây là những gì bạn cần biết:',
    ]
    return (
      responses[Math.floor(Math.random() * responses.length)] +
      '\n\n' +
      'Đây là phản hồi demo. Trong production, điều này sẽ kết nối với AI agent backend của bạn.'
    )
  }

  // Group messages by date for timestamp separators
  const shouldShowTimestamp = (
    currentMsg: Message,
    prevMsg: Message | undefined
  ): boolean => {
    if (!prevMsg) return true

    const currentDate = new Date(currentMsg.timestamp)
    const prevDate = new Date(prevMsg.timestamp)

    // Show timestamp if different day
    return currentDate.toDateString() !== prevDate.toDateString()
  }

  // Check if we should show avatar (show for first message in group)
  const shouldShowAvatar = (
    currentMsg: Message,
    nextMsg: Message | undefined
  ): boolean => {
    if (!nextMsg) return true
    return currentMsg.sender !== nextMsg.sender
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'w-full max-w-md',
        'flex flex-col',
        'bg-card border-2 border-border',
        'rounded-2xl shadow-2xl',
        'transition-all duration-300 overflow-hidden',
        isMinimized ? 'h-16' : 'h-150'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <div className='w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg'>
              <AiFillTwitch className='w-5 h-5 text-accent-foreground' />
            </div>
            {/* Online indicator */}
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
          {/* Minimize/Maximize */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsMinimized(!isMinimized)}
            className='h-8 w-8 hover:bg-accent hover:text-accent-foreground'
          >
            {isMinimized ? (
              <Maximize2 className='w-4 h-4' />
            ) : (
              <Minimize2 className='w-4 h-4' />
            )}
          </Button>

          {/* Close */}
          {onClose && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='h-8 w-8 hover:bg-destructive/10 hover:text-destructive'
            >
              <X className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          {/* ScrollArea with fixed height */}
          <div className='flex-1 overflow-hidden'>
            <ScrollArea ref={scrollAreaRef} className='h-full'>
              <div className='p-4'>
                {messages.length === 0 ? (
                  // Welcome message
                  <div className='flex flex-col items-center justify-center h-full text-center space-y-4 animate-in fade-in duration-1000'>
                    <div className='w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-xl'>
                      <AiFillTwitch className='w-8 h-8 text-accent-foreground' />
                    </div>
                    <div className='space-y-2'>
                      <h4 className='text-lg font-semibold'>Xin chào! 👋</h4>
                      <p className='text-sm text-muted-foreground max-w-xs'>
                        Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm
                        nay?
                      </p>
                    </div>
                  </div>
                ) : (
                  // Messages
                  <div className='space-y-1'>
                    {messages.map((message, index) => {
                      const prevMessage =
                        index > 0 ? messages[index - 1] : undefined
                      const nextMessage =
                        index < messages.length - 1
                          ? messages[index + 1]
                          : undefined

                      return (
                        <div key={message.id}>
                          {shouldShowTimestamp(message, prevMessage) && (
                            <TimestampSeparator timestamp={message.timestamp} />
                          )}
                          <ChatMessage
                            message={message}
                            showAvatar={shouldShowAvatar(message, nextMessage)}
                          />
                        </div>
                      )
                    })}

                    {/* Typing Indicator */}
                    {isTyping && <TypingIndicator />}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className='shrink-0'>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping}
              placeholder='Nhập tin nhắn...'
            />
          </div>
        </>
      )}
    </div>
  )
}
