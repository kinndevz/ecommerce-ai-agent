import { useState, useRef, useEffect } from 'react'
import { Minimize2, Maximize2, X, RefreshCcw } from 'lucide-react'
import { Button, buttonVariants } from '@/shared/components/ui/button'
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

  const handleClose = () => {
    setIsClosing(true)
    // Use shorter timeout for faster close
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }

  const handleRefreshChat = () => {
    startNewConversation()
  }

  const uiMessages = currentConversation
    ? mapApiMessagesToUi(currentConversation.messages)
    : []

  return (
    <div
      className={cn(
        'fixed bottom-6 z-50 w-full max-w-md flex flex-col',
        'bg-background border border-border rounded-2xl',
        'shadow-xl',
        'overflow-hidden',
        isMinimized ? 'h-[66px]' : 'h-[600px]'
      )}
      style={{
        right: 'calc(1.5rem + var(--removed-body-scroll-bar-size, 0px))',
        transition: isClosing
          ? 'opacity 0.2s ease-out'
          : 'height 0.3s ease-out',
        opacity: isClosing ? 0 : 1,
      }}
    >
      <div
        className={cn(
          'flex items-center justify-between px-5 border-b border-border shrink-0',
          'bg-muted/50',
          isMinimized ? 'py-2.5' : 'py-4'
        )}
      >
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <div className='w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-sm'>
              <AiFillTwitch className='w-6 h-6 text-accent-foreground' />
            </div>
            <div className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background shadow-sm' />
          </div>
          <div className='min-w-0'>
            <h3 className='font-semibold text-base truncate text-foreground'>
              AI Assistant
            </h3>
            <p className='text-xs text-muted-foreground/80 truncate font-medium'>
              {isTyping ? 'Đang nhập...' : 'Trực tuyến'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {!isMinimized && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-9 w-9 hover:bg-orange-500/15 hover:text-orange-600 dark:hover:text-orange-400 transition-colors'
                  title='Cuộc trò chuyện mới'
                >
                  <RefreshCcw className='w-4 h-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Bắt đầu cuộc trò chuyện mới?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này sẽ xóa toàn bộ lịch sử trò chuyện hiện tại và
                    bắt đầu một cuộc hội thoại mới. Bạn có chắc chắn muốn tiếp
                    tục không?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRefreshChat}
                    className={buttonVariants({ variant: 'destructive' })}
                  >
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsMinimized(!isMinimized)}
            className='h-9 w-9 hover:bg-primary/15 hover:text-primary transition-all hover:scale-110'
            title={isMinimized ? 'Mở rộng' : 'Thu gọn'}
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
            className='h-9 w-9 hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 transition-all hover:scale-110'
            title='Đóng'
          >
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
                  <div className='flex flex-col items-center justify-center h-full text-center space-y-5 animate-in fade-in duration-1000 py-12'>
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
