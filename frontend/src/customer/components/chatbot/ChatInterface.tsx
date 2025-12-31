import { useState, useRef, useEffect } from 'react'
import { Minimize2, Maximize2, X, RefreshCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
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
  const [isClosing, setIsClosing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const {
    currentConversation,
    isLoading,
    isInitializing,
    streamingStatus,
    initChat,
    sendMessageStreaming,
    startNewConversation,
    setIsOpen,
  } = useChatStore()

  const { user } = useAuth()

  useEffect(() => {
    initChat()
  }, [initChat])

  // Scroll logic
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        })
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
      await sendMessageStreaming(content)
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }

  const handleRefreshChat = () => {
    startNewConversation()
  }

  // 1. Lấy tất cả tin nhắn
  const rawUiMessages = currentConversation
    ? mapApiMessagesToUi(currentConversation.messages)
    : []

  // 2. LỌC TIN NHẮN: Chỉ hiển thị những tin nhắn có nội dung thực sự
  // Nếu AI đang stream tin nhắn rỗng (lúc mới bắt đầu), ta ẩn nó đi để hiện 3 chấm
  const visibleMessages = rawUiMessages.filter((msg) => {
    if (msg.sender === 'ai' && !msg.content?.trim()) return false
    return true
  })

  // 3. XÁC ĐỊNH TIN NHẮN CUỐI CÙNG NGƯỜI DÙNG THẤY
  const lastVisibleMessage =
    visibleMessages.length > 0
      ? visibleMessages[visibleMessages.length - 1]
      : null

  // 4. LOGIC HIỂN THỊ 3 CHẤM (FIX LỖI CỦA BẠN TẠI ĐÂY)
  // Chỉ hiện khi: (Đang gõ hoặc Đang stream) VÀ (Tin cuối cùng KHÔNG PHẢI là AI)
  // Giải thích: Ngay khi AI bắt đầu nhả chữ, visibleMessages sẽ có thêm tin nhắn AI,
  // lúc đó lastVisibleMessage.sender là 'ai' -> Điều kiện dưới sai -> 3 chấm tắt ngay.
  const shouldShowTypingIndicator =
    (isTyping || !!streamingStatus) && lastVisibleMessage?.sender !== 'ai'

  return (
    <div
      className={cn(
        'fixed bottom-6 z-50 w-full max-w-md flex flex-col',
        'bg-background border border-border rounded-2xl',
        'shadow-xl',
        'overflow-hidden',
        isMinimized ? 'h-16 right-6' : 'h-150 right-6',
        isClosing && 'animate-out slide-out-to-bottom-4 fade-out duration-200'
      )}
    >
      {/* Header */}
      <div className='shrink-0 flex items-center justify-between px-4 py-3 border-b bg-muted/30'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <AiFillTwitch className='w-8 h-8 text-primary' />
            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background' />
          </div>
          <div>
            <h3 className='font-semibold text-sm'>AI Assistant</h3>
            {streamingStatus ? (
              <p className='text-xs text-muted-foreground animate-pulse'>
                {streamingStatus}
              </p>
            ) : (
              <p className='text-xs text-muted-foreground'>Sẵn sàng trợ giúp</p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <RefreshCcw className='w-4 h-4' />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Bắt đầu cuộc trò chuyện mới?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cuộc trò chuyện hiện tại sẽ được lưu lại và bạn có thể xem lại
                  sau.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleRefreshChat}>
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsMinimized(!isMinimized)}
            className='h-8 w-8'
          >
            {isMinimized ? (
              <Maximize2 className='w-4 h-4' />
            ) : (
              <Minimize2 className='w-4 h-4' />
            )}
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleClose}
            className='h-8 w-8 hover:bg-destructive/10'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className='flex-1 overflow-hidden'>
            <ScrollArea className='h-full' ref={scrollAreaRef}>
              <div className='p-4'>
                {isInitializing ? (
                  <ChatLoadingSkeleton />
                ) : !currentConversation ||
                  !currentConversation.messages.length ? (
                  <div className='flex flex-col items-center justify-center h-full text-center space-y-5 animate-in fade-in duration-1000 py-12'>
                    {/* Welcome UI */}
                    <div className='relative'>
                      <div className='w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center shadow-sm border border-accent/20'>
                        <div className='w-16 h-16 rounded-full bg-accent flex items-center justify-center'>
                          <AiFillTwitch className='w-10 h-10 text-accent-foreground' />
                        </div>
                      </div>
                      <div className='absolute inset-0 rounded-full bg-accent/10 animate-pulse [animation-duration:3s]' />
                    </div>
                    <div className='space-y-3 px-6'>
                      <h4 className='text-xl font-bold text-foreground'>
                        Xin chào! 👋
                      </h4>
                      <p className='text-sm text-muted-foreground/90 max-w-xs mx-auto leading-relaxed'>
                        Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm
                        nay?
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {/* 👇 SỬ DỤNG DANH SÁCH visibleMessages ĐÃ LỌC */}
                    {visibleMessages.map((message, index) => {
                      const prevMessage =
                        index > 0 ? visibleMessages[index - 1] : undefined
                      const nextMessage =
                        index < visibleMessages.length - 1
                          ? visibleMessages[index + 1]
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

                    {/* 👇 CHỈ HIỂN THỊ KHI ĐIỀU KIỆN ĐÚNG */}
                    {shouldShowTypingIndicator && <TypingIndicator />}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className='shrink-0'>
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isTyping || isInitializing || !!streamingStatus}
              placeholder='Nhập tin nhắn...'
            />
          </div>
        </>
      )}
    </div>
  )
}
