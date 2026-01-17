import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, RefreshCcw, Menu, X } from 'lucide-react'
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
import {
  ChatMessage,
  TimestampSeparator,
  type Message,
} from '../components/chatbot/ChatMessage'
import { TypingIndicator } from '../components/chatbot/TypingIndicator'
import { type MessageResponse } from '@/api/chat.api'
import { useChatStore } from '@/stores/useChatStore'
import { ChatLoadingSkeleton } from '../components/chatbot/ChatLoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/shared/components/ui/input'

export default function ChatPage() {
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    currentConversation,
    isLoading,
    isInitializing,
    streamingStatus,
    initChat,
    sendMessageStreaming,
    startNewConversation,
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
  }, [currentConversation?.messages, isTyping, isInitializing])

  const mapApiMessagesToUi = (apiMessages: MessageResponse[]): Message[] => {
    return apiMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(msg.created_at),
      status: 'read',
    }))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || streamingStatus) return

    const messageToSend = inputValue.trim()

    setInputValue('')
    setIsTyping(true)

    try {
      await sendMessageStreaming(messageToSend)
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()

      handleSendMessage()
    }
  }

  const handleRefreshChat = () => {
    startNewConversation()
  }

  // Message filtering logic

  const rawUiMessages = currentConversation
    ? mapApiMessagesToUi(currentConversation.messages)
    : []

  const visibleMessages = rawUiMessages.filter((msg) => {
    if (msg.sender === 'ai' && !msg.content?.trim()) return false

    return true
  })

  const lastVisibleMessage =
    visibleMessages.length > 0
      ? visibleMessages[visibleMessages.length - 1]
      : null

  const shouldShowTypingIndicator =
    (isTyping || !!streamingStatus) && lastVisibleMessage?.sender !== 'ai'

  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar - Mobile Overlay */}

      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50',
          'w-72 bg-card border-r border-border',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex flex-col h-full'>
          {/* Sidebar Header */}

          <div className='flex items-center justify-between p-4 border-b'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-primary flex items-center justify-center'>
                <AiFillTwitch className='w-6 h-6 text-primary-foreground' />
              </div>

              <div>
                <h2 className='font-semibold text-sm'>AI Assistant</h2>

                <p className='text-xs text-muted-foreground'>Shopping Helper</p>
              </div>
            </div>

            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden'
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className='w-4 h-4' />
            </Button>
          </div>

          {/* Sidebar Content */}

          <ScrollArea className='flex-1 p-4'>
            <div className='space-y-2'>
              <Button variant='ghost' className='w-full justify-start gap-3'>
                <MessageSquare className='w-4 h-4' />

                <span>Chats</span>
              </Button>

              {/* Placeholder for conversation history */}

              <div className='pt-4'>
                <p className='text-xs text-muted-foreground px-3 mb-2'>
                  Recent Conversations
                </p>

                <div className='space-y-1'>
                  {currentConversation && (
                    <div className='p-3 rounded-lg bg-accent/50 border border-accent'>
                      <p className='text-sm font-medium truncate'>
                        Current Chat
                      </p>

                      <p className='text-xs text-muted-foreground mt-1'>
                        {currentConversation.messages.length} messages
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}

          <div className='p-4 border-t'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name || 'User'}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-sm font-medium'>
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>
                  {user?.full_name || 'Guest'}
                </p>

                <p className='text-xs text-muted-foreground truncate'>
                  {user?.email || 'guest@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}

      <main className='flex-1 flex flex-col min-w-0'>
        {/* Chat Header */}

        <header className='flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden'
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className='w-5 h-5' />
            </Button>

            <div>
              <h1 className='text-lg font-semibold'>Shopping Assistant</h1>

              {streamingStatus ? (
                <p className='text-sm text-muted-foreground animate-pulse'>
                  {streamingStatus}
                </p>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  Ready to help you find products
                </p>
              )}
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <RefreshCcw className='w-4 h-4' />

                <span className='hidden sm:inline'>New Chat</span>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start a new conversation?</AlertDialogTitle>

                <AlertDialogDescription>
                  Your current conversation will be saved and you can view it
                  later.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleRefreshChat}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        {/* Chat Messages */}

        <div className='flex-1 overflow-hidden bg-linear-to-b from-background to-muted/20'>
          <ScrollArea className='h-full' ref={scrollAreaRef}>
            <div className='max-w-4xl mx-auto px-6 py-8'>
              {isInitializing ? (
                <ChatLoadingSkeleton />
              ) : !currentConversation ||
                !currentConversation.messages.length ? (
                <div className='flex flex-col items-center justify-center h-[60vh] text-center space-y-6'>
                  {/* Welcome UI */}

                  <div className='relative'>
                    <div className='w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center shadow-lg border border-accent/30'>
                      <div className='w-20 h-20 rounded-full bg-accent flex items-center justify-center'>
                        <AiFillTwitch className='w-12 h-12 text-accent-foreground' />
                      </div>
                    </div>

                    <div className='absolute inset-0 rounded-full bg-accent/10 animate-pulse animation-duration-[3s]' />
                  </div>

                  <div className='space-y-4 px-6 max-w-lg'>
                    <h2 className='text-3xl font-bold text-foreground'>
                      Welcome! 👋
                    </h2>

                    <p className='text-base text-muted-foreground leading-relaxed'>
                      I'm your AI shopping assistant. I can help you find the
                      perfect cosmetics products, answer questions, and manage
                      your cart.
                    </p>

                    <div className='flex flex-wrap gap-2 justify-center pt-4'>
                      <button
                        onClick={() =>
                          setInputValue('Show me new arrival products')
                        }
                        className='px-4 py-2 text-sm bg-muted hover:bg-accent rounded-full transition-colors'
                      >
                        🆕 New Arrivals
                      </button>

                      <button
                        onClick={() =>
                          setInputValue('What products do you recommend?')
                        }
                        className='px-4 py-2 text-sm bg-muted hover:bg-accent rounded-full transition-colors'
                      >
                        ✨ Recommendations
                      </button>

                      <button
                        onClick={() => setInputValue('Show my cart')}
                        className='px-4 py-2 text-sm bg-muted hover:bg-accent rounded-full transition-colors'
                      >
                        🛒 View Cart
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
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

                  {shouldShowTypingIndicator && <TypingIndicator />}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Input */}

        <div className='border-t bg-card/80 backdrop-blur-sm'>
          <div className='max-w-4xl mx-auto px-6 py-4'>
            <div className='flex items-end gap-3'>
              <div className='flex-1 relative'>
                <Input
                  ref={textareaRef as any}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='What are you looking for?'
                  disabled={isTyping || isInitializing || !!streamingStatus}
                  className='pr-12 min-h-13 resize-none rounded-2xl'
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={
                  !inputValue.trim() ||
                  isTyping ||
                  isInitializing ||
                  !!streamingStatus
                }
                size='lg'
                className='h-13 px-6 rounded-2xl'
              >
                <Send className='w-5 h-5' />
              </Button>
            </div>

            <p className='text-xs text-muted-foreground text-center mt-3'>
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
