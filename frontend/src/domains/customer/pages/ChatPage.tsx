import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  Search,
  ShoppingCart,
  ArrowLeftToLine,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ChatMessage, COMPANY_LOGO_SRC, type Message } from '../components/chatbot/ChatMessage'
import { TypingIndicator } from '../components/chatbot/TypingIndicator'

import { type MessageResponse } from '@/api/chat.api'
import { useChatStore } from '@/stores/useChatStore'
import { ChatLoadingSkeleton } from '../components/chatbot/ChatLoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/shared/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar'

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

const isDisplayableMessage = (message: Message) => {
  if (
    message.sender === 'ai' &&
    !message.content?.trim() &&
    (!message.artifacts || message.artifacts.length === 0)
  ) {
    return false
  }
  return true
}

const hasPendingAssistantMessage = (messages?: MessageResponse[]) => {
  return (
    messages?.some(
      (msg) =>
        msg.role === 'assistant' &&
        msg.id?.startsWith('assistant-') &&
        !msg.content?.trim() &&
        (!msg.artifacts || msg.artifacts.length === 0)
    ) ?? false
  )
}

type SuggestionCardProps = {
  icon: React.ElementType
  label: string
  query: string
  onClick: (q: string) => void
}

// Component gợi ý câu hỏi
const SuggestionCard = ({
  icon: Icon,
  label,
  query,
  onClick,
}: SuggestionCardProps) => (
  <Card
    className='bg-card hover:bg-accent/50 cursor-pointer transition-all duration-300 group shadow-sm border-border/60 hover:border-primary/50'
    onClick={() => onClick(query)}
  >
    <CardContent className='p-4 flex flex-col items-center text-center gap-3'>
      <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
        <Icon className='w-5 h-5 text-primary' />
      </div>
      <div>
        <p className='font-medium text-sm text-card-foreground'>{label}</p>
      </div>
    </CardContent>
  </Card>
)

export default function ChatPage() {
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const {
    currentConversation,
    isLoading,
    isInitializing,
    streamingStatus,
    currentToolCall,
    initChat,
    sendMessageStreaming,
  } = useChatStore()

  const { user } = useAuth()

  useEffect(() => {
    initChat()
  }, [initChat])

  // Auto-scroll logic
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || streamingStatus) return
    const messageToSend = inputValue.trim()
    setInputValue('')
    setIsTyping(true)
    try {
      await sendMessageStreaming(messageToSend)
    } catch (error) {
      console.error('Error:', error)
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

  const visibleMessages = currentConversation
    ? mapApiMessagesToUi(currentConversation.messages).filter(
        isDisplayableMessage
      )
    : []

  const hasPendingAssistant = hasPendingAssistantMessage(
    currentConversation?.messages
  )

  const shouldShowTypingIndicator =
    (isTyping || !!streamingStatus || !!currentToolCall) &&
    (hasPendingAssistant ||
      visibleMessages[visibleMessages.length - 1]?.sender !== 'ai')

  const isInputDisabled = isTyping || isInitializing || !!streamingStatus
  const isSendDisabled = !inputValue.trim() || isInputDisabled
  const userAvatar = user?.avatar || ''

  return (
    <div className='flex h-screen bg-background overflow-hidden font-sans text-foreground'>
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50',
          'w-72 lg:w-80 bg-muted/30 border-r border-border',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='h-16 flex items-center px-6 border-b border-border/40'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg text-primary-foreground flex items-center justify-center'>
              <Avatar>
                <AvatarImage
                  src={COMPANY_LOGO_SRC}
                  className='object-cover'
                />
              </Avatar>
            </div>
            <span className='font-bold text-lg tracking-tight'>Beauty AI</span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='ml-auto lg:hidden'
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        <ScrollArea className='flex-1 px-4 py-6'>
          <div className='space-y-6'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className='w-full justify-start gap-2 shadow-sm'
                  variant='default'
                  onClick={() => navigate('/home')}
                >
                  <ArrowLeftToLine className='w-4 h-4' /> Back to shop
                </Button>
              </AlertDialogTrigger>
            </AlertDialog>

            <div>
              <h3 className='text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2'>
                History
              </h3>
              <Button
                variant='ghost'
                className='w-full justify-start text-muted-foreground font-normal bg-accent/50'
              >
                Current Session ({currentConversation?.messages.length || 0})
              </Button>
            </div>
          </div>
        </ScrollArea>

        <div className='p-4 border-t border-border/40 bg-background/50'>
          <div className='flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group'>
            <div className='w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border'>
              {userAvatar ? (
                <img src={userAvatar} className='w-full h-full object-cover' />
              ) : (
                <User className='w-5 h-5 text-muted-foreground' />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>
                {user?.full_name || 'Guest'}
              </p>
              <p className='text-xs text-muted-foreground truncate'>
                {user?.email}
              </p>
            </div>
            <LogOut className='w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
          </div>
        </div>
      </aside>

      <main className='flex-1 flex flex-col min-w-0 relative bg-background'>
        <header className='lg:hidden h-14 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className='w-5 h-5' />
          </Button>
          <span className='font-semibold'>Beauty AI</span>
          <div className='w-9'></div>
        </header>

        <div className='flex-1 overflow-hidden relative'>
          <ScrollArea ref={scrollAreaRef} className='h-full'>
            <div className='max-w-6xl mx-auto px-4 md:px-8 py-8 pb-32'>
              {isInitializing ? (
                <div className='pt-10'>
                  <ChatLoadingSkeleton />
                </div>
              ) : !currentConversation || visibleMessages.length === 0 ? (
                <div className='flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in-95 duration-500'>
                  <div className='w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center'>
                    <Avatar>
                      <AvatarImage
                        src={COMPANY_LOGO_SRC}
                        className='w-full'
                      />
                    </Avatar>
                  </div>
                  <h2 className='text-2xl font-bold tracking-tight text-foreground text-center'>
                    What can I help you with?
                  </h2>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl'>
                    <SuggestionCard
                      icon={Search}
                      label='Find Products'
                      query='Show me Cerave products'
                      onClick={setInputValue}
                    />
                    <SuggestionCard
                      icon={Sparkles}
                      label='Get Advice'
                      query='Routine for oily skin'
                      onClick={setInputValue}
                    />
                    <SuggestionCard
                      icon={ShoppingCart}
                      label='My Cart'
                      query='Check my cart'
                      onClick={setInputValue}
                    />
                  </div>
                </div>
              ) : (
                <div className='flex flex-col'>
                  {visibleMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      userAvatar={user?.avatar || ''}
                    />
                  ))}

                  {shouldShowTypingIndicator && (
                    <div className='animate-in fade-in'>
                      <TypingIndicator />
                      {(currentToolCall || streamingStatus) && (
                        <span className='text-xs text-muted-foreground ml-2 animate-pulse'>
                          {currentToolCall || streamingStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className='absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-linear-to-t from-background via-background/95 to-transparent'>
          <div className='max-w-6xl mx-auto'>
            <div className='relative flex items-end shadow-2xl rounded-3xl bg-background border border-input focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-300'>
              <Input
                ref={inputRef as any}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Ask anything...'
                disabled={isInputDisabled}
                className='flex-1 border-none shadow-none bg-transparent focus-visible:ring-0 min-h-15 py-5 px-4 text-base placeholder:text-muted-foreground/80'
                autoComplete='off'
              />
              <div className='pr-3 pb-3 flex items-center gap-1 self-end'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSendDisabled}
                        size='icon'
                        className={cn(
                          'h-10 w-10 rounded-full transition-all duration-300',
                          inputValue.trim()
                            ? 'bg-primary text-primary-foreground shadow-md hover:scale-105'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isTyping ? (
                          <div className='w-2 h-2 bg-current rounded-full animate-ping' />
                        ) : (
                          <Send className='w-5 h-5 ml-0.5' />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Message</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
