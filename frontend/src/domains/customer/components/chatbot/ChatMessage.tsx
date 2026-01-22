import { Copy, ThumbsUp, ThumbsDown, RefreshCw, User } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import DOMPurify from 'dompurify'
import { useState } from 'react'
import { ProductCarousel } from './ProductCarousel'
import { ProductDetailSheet } from './ProductDetailSheet'
import { CartView } from './CartView'
import { OrderListView } from './OrderListView'
import { OrderSummaryView } from './OrderSummaryView'
import { extractCart, extractCreatedOrder, extractOrders, extractProducts } from '../../helpers/artifacts'
import { formatShortTime } from '../../helpers/formatters'
import type { Artifact, ProductData } from '@/api/chat.api'
import { toast } from 'sonner'

export const COMPANY_LOGO_SRC = 'src/assets/company-logo.svg'

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
}

export const ChatMessage = ({ message, userAvatar }: ChatMessageProps) => {
  const isUser = message.sender === 'user'
  const isAI = message.sender === 'ai'
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const products = extractProducts(message.artifacts)
  const cartData = extractCart(message.artifacts)
  const orders = extractOrders(message.artifacts)
  const createdOrder = extractCreatedOrder(message.artifacts)

  const handleViewProduct = (product: ProductData) => {
    setSelectedProduct(product)
    setIsSheetOpen(true)
  }

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content)
      toast.success('Copied to clipboard')
    }
  }

  const formattedTime = formatShortTime(message.timestamp)

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
                src={COMPANY_LOGO_SRC}
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
            {/* AI Text Content */}
            {message.content && (
              <div
                className='text-muted-foreground text-[15px] leading-7 space-y-2 whitespace-pre-wrap'
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(message.content),
                }}
              />
            )}

            {/* Product Carousel Artifact */}
            {products.length > 0 && (
              <div className='mt-4'>
                <ProductCarousel
                  products={products}
                  onViewProduct={handleViewProduct}
                />
              </div>
            )}

            {/* Cart View Artifact */}
            {cartData && (
              <div className='mt-4'>
                <CartView cartData={cartData} />
              </div>
            )}

            {createdOrder && (
              <div className='mt-4'>
                <OrderSummaryView order={createdOrder} />
              </div>
            )}

            {orders.length > 0 && (
              <div className='mt-4'>
                <OrderListView orders={orders} />
              </div>
            )}

            <ProductDetailSheet
              open={isSheetOpen}
              onOpenChange={setIsSheetOpen}
              productId={selectedProduct?.id || null}
              previewProduct={selectedProduct}
            />

            {/* Action Buttons */}
            <div className='flex items-center gap-2 mt-4 pt-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
                onClick={handleCopy}
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

            {/* Timestamp */}
            <div className='text-[11px] text-muted-foreground/60 text-right mt-1 opacity-0 group-hover:opacity-100 transition-opacity select-none'>
              {formattedTime}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
