import { ShoppingCart, Star } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import type { ProductData } from '@/api/chat.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import { useChatLayout } from '@/context/ChatLayoutContext'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductData
  isAdding: boolean
  onView: (product: ProductData) => void
  onAddToCart: (product: ProductData) => void
}

export const ProductCard = ({
  product,
  isAdding,
  onView,
  onAddToCart,
}: ProductCardProps) => {
  const layout = useChatLayout()
  const isCompact = layout === 'compact'

  return (
    <Card
      className='h-full border-none shadow-none hover:bg-transparent bg-transparent group/card cursor-pointer'
      onClick={() => onView(product)}
    >
      <CardContent className='p-0'>
        <div className='relative aspect-3/4 rounded-lg overflow-hidden bg-muted/50 border border-border/50'>
          {product.product_image ? (
            <img
              src={product.product_image}
              alt={product.name}
              className='w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-muted-foreground/30'>
              <ShoppingCart className={isCompact ? 'w-8 h-8' : 'w-10 h-10'} />
            </div>
          )}

          {product.is_available && product.stock_quantity < 10 && (
            <div className='absolute top-2 left-2'>
              <Badge
                variant='outline'
                className={cn(
                  'bg-background/90 backdrop-blur-sm',
                  isCompact ? 'text-[9px] px-1.5 py-0' : 'text-xs'
                )}
              >
                Only {product.stock_quantity} left
              </Badge>
            </div>
          )}

          {product.is_available && (
            <div className='absolute bottom-2 left-2 right-2 translate-y-[120%] group-hover/card:translate-y-0 transition-transform duration-300 ease-out'>
              <Button
                variant='secondary'
                size='sm'
                className={cn(
                  'w-full shadow-sm font-medium rounded-md border border-border/50 bg-background/90 hover:bg-background text-foreground backdrop-blur-md',
                  isCompact ? 'h-7 text-xs' : 'h-9 text-sm'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart(product)
                }}
                disabled={isAdding}
              >
                <ShoppingCart
                  className={cn(
                    isCompact ? 'w-3 h-3 mr-1.5' : 'w-3.5 h-3.5 mr-2'
                  )}
                />
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          )}

          {!product.is_available && (
            <div className='absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[1px]'>
              <Badge
                variant='destructive'
                className={isCompact ? 'text-[10px] px-2 py-0.5' : 'px-3 py-1'}
              >
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        <div
          className={cn('space-y-1', isCompact ? 'pt-2' : 'pt-3 space-y-1.5')}
        >
          <div className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate'>
            {product.brand_name}
          </div>

          <h3
            className={cn(
              'font-medium leading-snug line-clamp-2 text-foreground group-hover/card:text-primary transition-colors',
              isCompact ? 'text-xs min-h-8' : 'text-sm min-h-10'
            )}
          >
            {product.name}
          </h3>

          <div
            className={cn(
              'text-muted-foreground truncate',
              isCompact ? 'text-[10px]' : 'text-xs'
            )}
          >
            {product.category_name}
          </div>

          <div className='flex items-center gap-1.5'>
            <div className='flex items-center gap-0.5'>
              <Star
                className={cn(
                  'fill-yellow-400 text-yellow-400',
                  isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'
                )}
              />
              <span
                className={cn(
                  'font-medium',
                  isCompact ? 'text-[10px]' : 'text-xs'
                )}
              >
                {product.rating_average.toFixed(1)}
              </span>
            </div>
            <span
              className={cn(
                'text-muted-foreground',
                isCompact ? 'text-[10px]' : 'text-xs'
              )}
            >
              • {product.stock_quantity} in stock
            </span>
          </div>

          <div className='pt-1 flex items-baseline gap-2'>
            <span
              className={cn(
                'font-bold text-foreground',
                isCompact ? 'text-sm' : 'text-base'
              )}
            >
              {formatCurrencyVnd(product.price)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
