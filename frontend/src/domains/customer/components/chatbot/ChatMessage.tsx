import { useState } from 'react'
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, User } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import DOMPurify from 'dompurify'
import { toast } from 'sonner'
import type { Artifact, ProductData } from '@/api/chat.api'
import { ProductCarousel } from './productview/ProductCarousel'
import { ProductDetailSheet } from './productview/ProductDetailSheet'
import { CartView } from './cartview/CartView'
import { OrderListView } from './orderview/OrderListView'
import { OrderSummaryView } from './orderview/OrderSummaryView'
import { OrderDetailView } from './orderview/OrderDetailView'
import {
  extractCart,
  extractCreatedOrder,
  extractOrderDetail,
  extractOrders,
  extractProducts,
} from '../../helpers/artifacts'
import { formatShortDate } from '../../helpers/formatters'

import CompanyLogo from '@/assets/company-logo.svg'
import { Markdown } from './Markdown'
export const COMPANY_LOGO_SRC = CompanyLogo

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
  isStreaming?: boolean
}

//  Avatar

function MessageAvatar({
  isAI,
  userAvatar,
}: {
  isAI: boolean
  userAvatar?: string | null
}) {
  return (
    <Avatar
      className={cn(
        'h-7 w-7 shrink-0 ring-1',
        isAI ? 'ring-primary/15' : 'ring-border/60'
      )}
    >
      {isAI ? (
        <AvatarImage src={COMPANY_LOGO_SRC} className='object-cover' />
      ) : (
        <>
          <AvatarImage src={userAvatar || undefined} className='object-cover' />
          <AvatarFallback className='bg-muted'>
            <User className='h-3.5 w-3.5 text-muted-foreground' />
          </AvatarFallback>
        </>
      )}
    </Avatar>
  )
}

//  Action Bar

function AIActionBar({ onCopy }: { onCopy: () => void }) {
  return (
    <div className='flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
      <Button
        variant='ghost'
        size='icon'
        className='h-7 w-7 text-muted-foreground hover:text-foreground'
        onClick={onCopy}
        title='Copy'
      >
        <Copy className='h-3.5 w-3.5' />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='h-7 w-7 text-muted-foreground hover:text-foreground'
        title='Regenerate'
      >
        <RefreshCw className='h-3.5 w-3.5' />
      </Button>
      <div className='flex-1' />
      <Button
        variant='ghost'
        size='icon'
        className='h-7 w-7 text-muted-foreground hover:text-foreground'
        title='Helpful'
      >
        <ThumbsUp className='h-3.5 w-3.5' />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='h-7 w-7 text-muted-foreground hover:text-foreground'
        title='Not helpful'
      >
        <ThumbsDown className='h-3.5 w-3.5' />
      </Button>
    </div>
  )
}

//  Artifacts

function ArtifactSection({
  message,
  onViewProduct,
}: {
  message: Message
  onViewProduct: (p: ProductData) => void
}) {
  const products = extractProducts(message.artifacts)
  const cartData = extractCart(message.artifacts)
  const orders = extractOrders(message.artifacts)
  const createdOrder = extractCreatedOrder(message.artifacts)
  const orderDetail = extractOrderDetail(message.artifacts)

  if (
    !products.length &&
    !cartData &&
    !orders.length &&
    !createdOrder &&
    !orderDetail
  )
    return null

  return (
    <div className='mt-3 space-y-3'>
      {products.length > 0 && (
        <ProductCarousel products={products} onViewProduct={onViewProduct} />
      )}
      {cartData && <CartView cartData={cartData} />}
      {createdOrder && <OrderSummaryView order={createdOrder} />}
      {orders.length > 0 && <OrderListView orders={orders} />}
      {orderDetail && <OrderDetailView order={orderDetail} />}
    </div>
  )
}

//  Main Component

export function ChatMessage({
  message,
  userAvatar,
  isStreaming,
}: ChatMessageProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const isAI = message.sender === 'ai'
  const formattedTime = new Date(message.timestamp).toLocaleTimeString(
    'vi-VN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )

  const handleCopy = () => {
    if (!message.content) return
    navigator.clipboard.writeText(message.content)
    toast.success('Copied to clipboard')
  }

  return (
    // THAY ĐỔI: Đổi flex flex-col thành block w-full
    <div className='block w-full mb-5 group animate-in fade-in slide-in-from-bottom-1 duration-300'>
      {/* Sender row (Vẫn giữ flex cho hàng ngang này) */}
      <div className='flex items-center gap-2 select-none mb-1.5'>
        <MessageAvatar isAI={isAI} userAvatar={userAvatar} />
        <span className='text-xs font-semibold text-foreground'>
          {isAI ? 'AI Assistant' : 'You'}
        </span>
        <span className='text-[10px] text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
          {formattedTime}
        </span>
      </div>

      {/* Content */}
      <div className='block pl-9 w-full'>
        {isAI ? (
          <div className='block w-full'>
            {message.content && (
              <div
                className={cn(
                  'text-sm text-foreground leading-relaxed w-full wrap-break-word whitespace-pre-wrap',
                  isStreaming &&
                    "after:content-['▋'] after:ml-1 after:animate-pulse after:text-primary"
                )}
              >
                <Markdown content={message.content} />
              </div>
            )}

            {message.artifacts && message.artifacts.length > 0 && (
              <div
                className={cn(
                  'block w-full transition-all duration-700 ease-out mt-3',
                  isStreaming
                    ? 'opacity-0 translate-y-4 pointer-events-none absolute -z-10'
                    : 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-0'
                )}
              >
                <ArtifactSection
                  message={message}
                  onViewProduct={(p) => {
                    setSelectedProduct(p)
                    setIsSheetOpen(true)
                  }}
                />
              </div>
            )}

            <AIActionBar onCopy={handleCopy} />
          </div>
        ) : (
          <p className='text-sm font-medium text-foreground leading-relaxed w-full wrap-break-word whitespace-pre-wrap'>
            {message.content}
          </p>
        )}
      </div>

      <ProductDetailSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        productId={selectedProduct?.id || null}
        previewProduct={selectedProduct}
      />
    </div>
  )
}
