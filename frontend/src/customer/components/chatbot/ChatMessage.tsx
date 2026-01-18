import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  User,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
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
  userAvatar?: string | null
  onAddToCart?: (product: ProductData) => void
  onViewDetails?: (productId: string) => void
}

export const ChatMessage = ({ message, userAvatar }: ChatMessageProps) => {
  const isUser = message.sender === 'user'
  const isAI = message.sender === 'ai'

  const extractProducts = (artifacts?: Artifact[]): ProductData[] => {
    if (!artifacts || artifacts.length === 0) return []
    return artifacts
      .filter(
        (artifact) =>
          artifact.tool_name === 'search_products' ||
          artifact.tool_name === 'search_product_new_arrival'
      )
      .flatMap((artifact) => artifact.data_mcp?.data || [])
  }
  const products = extractProducts(message.artifacts)

  const handleAddToCart = (product: ProductData) =>
    toast.success(`Added ${product.name}`)
  const handleViewProduct = (product: ProductData) =>
    console.log('View', product)

  // Format time function
  const formattedTime = new Date(message.timestamp).toLocaleTimeString(
    'vi-VN',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  )

  return (
    <div className='flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 group'>
      <div className='flex items-center gap-3 select-none'>
        <Avatar
          className={cn(
            'h-8 w-8 ring-1',
            isAI ? 'ring-primary/10' : 'ring-border'
          )}
        >
          {isAI ? (
            <div className='h-full w-full flex items-center justify-center'>
              <AvatarImage
                src={'src/assets/company-logo.svg'}
                className='object-cover'
              />
            </div>
          ) : (
            <>
              <AvatarImage
                src={userAvatar || undefined}
                className='object-cover'
              />
              <AvatarFallback className='bg-muted'>
                <User className='h-4 w-4 text-muted-foreground' />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <span className='font-semibold text-sm text-foreground'>
          {isAI ? 'Shopping Assistant' : 'You'}
        </span>
      </div>

      <div className='pl-11 max-w-4xl'>
        {isUser ? (
          <div>
            <div className='text-foreground text-[15px] font-medium leading-relaxed whitespace-pre-wrap'>
              {message.content}
            </div>
            <div className='text-[11px] text-muted-foreground/60 text-right mt-1 opacity-0 group-hover:opacity-100 transition-opacity select-none'>
              {formattedTime}
            </div>
          </div>
        ) : (
          <div className='relative'>
            {message.content && (
              <div
                className='text-muted-foreground text-[15px] leading-7 space-y-2 whitespace-pre-wrap'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(message.content),
                }}
              />
            )}

            {products.length > 0 && (
              <div className='mt-4'>
                <ProductCarousel
                  products={products}
                  onAddToCart={handleAddToCart}
                  onViewProduct={handleViewProduct}
                />
              </div>
            )}

            <div className='flex items-center gap-2 mt-4 pt-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
              >
                <Copy className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
              <div className='flex-1' />
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
              >
                <ThumbsUp className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
              >
                <ThumbsDown className='h-4 w-4' />
              </Button>
            </div>

            <div className='text-[11px] text-muted-foreground/60 text-right mt-1 opacity-0 group-hover:opacity-100 transition-opacity select-none'>
              {formattedTime}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
