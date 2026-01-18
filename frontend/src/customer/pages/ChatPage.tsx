import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, RefreshCcw, Menu, X, Loader2 } from 'lucide-react'
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
    currentToolCall,
    initChat,
    sendMessageStreaming,
    startNewConversation,
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
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        })
      }
    }
  }, [currentConversation?.messages, isTyping, isInitializing, currentToolCall])

  const mapApiMessagesToUi = (apiMessages: MessageResponse[]): Message[] => {
    return apiMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'ai',
      timestamp: new Date(msg.created_at),
      status: 'read',
      artifacts: msg.artifacts || [],
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
    (isTyping || !!streamingStatus || !!currentToolCall) &&
    lastVisibleMessage?.sender !== 'ai'

  return (
    <div className='flex h-screen bg-background'>
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

          <ScrollArea className='flex-1 p-4'>
            <div className='space-y-2'>
              <Button variant='ghost' className='w-full justify-start gap-3'>
                <MessageSquare className='w-4 h-4' />
                <span>Chats</span>
              </Button>

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

              {streamingStatus || currentToolCall ? (
                <div className='flex items-center gap-2'>
                  <Loader2 className='w-3 h-3 animate-spin text-primary' />
                  <p className='text-sm text-muted-foreground animate-pulse'>
                    {currentToolCall || streamingStatus}
                  </p>
                </div>
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
                  Start New
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        {/* Messages */}
        <div className='flex-1 overflow-hidden'>
          <ScrollArea ref={scrollAreaRef} className='h-full'>
            <div className='max-w-4xl mx-auto'>
              {isInitializing ? (
                <ChatLoadingSkeleton />
              ) : !currentConversation || visibleMessages.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-full px-6 py-12 text-center'>
                  <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                    <MessageSquare className='w-8 h-8 text-primary' />
                  </div>

                  <h2 className='text-xl font-semibold mb-2'>
                    Welcome to Beauty Shop Assistant!
                  </h2>

                  <p className='text-muted-foreground mb-6 max-w-md'>
                    I'm here to help you find the perfect beauty products. Ask
                    me anything!
                  </p>

                  <div className='flex flex-wrap gap-2 justify-center'>
                    <button
                      onClick={() => setInputValue('Show me Cerave products')}
                      className='px-4 py-2 text-sm bg-muted hover:bg-accent rounded-full transition-colors'
                    >
                      🔍 Search Products
                    </button>

                    <button
                      onClick={() =>
                        setInputValue('Recommend skincare routine')
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
                          userAvatar={user?.avatar || ''}
                        />
                      </div>
                    )
                  })}

                  {shouldShowTypingIndicator && (
                    <div className='mt-1'>
                      <TypingIndicator />
                      {(currentToolCall || streamingStatus) && (
                        <p className='text-xs text-muted-foreground ml-14 animate-pulse'>
                          {currentToolCall || streamingStatus}
                        </p>
                      )}
                    </div>
                  )}
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
                size='icon'
                className='h-11 w-11 rounded-full shrink-0'
              >
                <Send className='w-5 h-5' />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
