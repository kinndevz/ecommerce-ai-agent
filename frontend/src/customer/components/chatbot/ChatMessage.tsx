import { Check, CheckCheck } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AiFillTwitch } from 'react-icons/ai'
import { FaUserGraduate } from 'react-icons/fa'
import DOMPurify from 'dompurify'
import { ProductCarousel } from './ProductCarousel'
import type { Artifact, ProductData } from '@/api/chat.api'
import { toast } from 'sonner'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date | string
  status?: 'sending' | 'sent' | 'read'
  artifacts?: Artifact[]
}

interface ChatMessageProps {
  message: Message
  showAvatar?: boolean
  showTimestamp?: boolean
  userAvatar?: string | null
}

export const ChatMessage = ({
  message,
  showAvatar = true,
  showTimestamp = false,
  userAvatar,
}: ChatMessageProps) => {
  const isUser = message.sender === 'user'
  const isAI = message.sender === 'ai'

  const handleAddToCart = (product: ProductData) => {
    toast.success(`Added "${product.name}" to cart!`)
    console.log('Add to cart:', product)
  }

  const handleViewProduct = (product: ProductData) => {
    console.log('View product:', product)
    window.open(`/products/${product.slug}`, '_blank')
  }

  const extractProducts = (artifacts?: Artifact[]): ProductData[] => {
    if (!artifacts || artifacts.length === 0) return []

    return artifacts
      .filter((artifact) => artifact.tool_name === 'search_products')
      .flatMap((artifact) => artifact.data_mcp?.data || [])
  }

  const products = extractProducts(message.artifacts)

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 group',
        isUser && 'flex-row-reverse',
        !showAvatar && (isUser ? 'pr-14' : 'pl-14')
      )}
    >
      {showAvatar && (
        <Avatar className='w-8 h-8 shrink-0'>
          {isUser ? (
            <>
              <AvatarImage
                src={userAvatar || undefined}
                alt='User Avatar'
                className='object-cover'
              />
              <AvatarFallback className='bg-primary text-primary-foreground'>
                <FaUserGraduate className='w-4 h-4' />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className='bg-accent text-accent-foreground'>
              <AiFillTwitch className='w-4 h-4' />
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-1',
          isAI ? 'max-w-[85%]' : 'max-w-[75%]',
          isUser && 'items-end',
          !showAvatar && (isUser ? 'mr-11' : 'ml-11')
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm wrap-break-word',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted text-foreground rounded-tl-sm'
          )}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(message.content || '', {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p'],
                ALLOWED_ATTR: ['href', 'target'],
              }),
            }}
          />
        </div>

        {/* Product Carousel for AI messages with artifacts */}
        {isAI && products.length > 0 && (
          <ProductCarousel
            products={products}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
          />
        )}

        {/* Message Info */}
        <div
          className={cn(
            'flex items-center gap-2 px-2',
            isUser && 'flex-row-reverse'
          )}
        >
          {showTimestamp && (
            <span className='text-xs text-muted-foreground'>
              {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          {isUser && message.status && (
            <div className='text-muted-foreground'>
              {message.status === 'read' && <CheckCheck className='w-3 h-3' />}
              {message.status === 'sent' && <Check className='w-3 h-3' />}
              {message.status === 'sending' && (
                <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin' />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const TimestampSeparator = ({
  timestamp,
}: {
  timestamp: Date | string
}) => {
  const date = new Date(timestamp)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  let displayText = ''
  if (isToday) {
    displayText = 'Today'
  } else if (isYesterday) {
    displayText = 'Yesterday'
  } else {
    displayText = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='flex items-center justify-center my-4'>
      <div className='flex items-center gap-3'>
        <div className='h-px w-12 bg-border' />
        <span className='text-xs text-muted-foreground font-medium'>
          {displayText}
        </span>
        <div className='h-px w-12 bg-border' />
      </div>
    </div>
  )
}
