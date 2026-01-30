import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import { useRemoveFromWishlist } from '@/hooks/useWishlist'
import { useAddToCart } from '@/hooks/useCarts'
import type { WishlistItem } from '@/api/wishlist.api'

interface WishlistItemCardProps {
  item: WishlistItem
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const { mutate: removeFromWishlist, isPending: isRemoving } =
    useRemoveFromWishlist()

  const { mutate: addToCart, isPending: isAdding } = useAddToCart()

  const hasSale = item.sale_price && item.sale_price < item.price

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      product_id: item.product_id,
      quantity: 1,
    })
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromWishlist(item.product_id)
  }

  return (
    <Card className='group overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:shadow-md bg-card'>
      <CardContent className='p-0 flex flex-col h-full'>
        <div className='relative aspect-4/5 overflow-hidden bg-muted/20'>
          <Link to={`/products/${item.product_slug}`} className='block h-full'>
            <img
              src={
                item.product_image ||
                'https://placehold.co/400x500/f8f8f8/e4e4e7?text=No+Image'
              }
              alt={item.product_name}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
              loading='lazy'
            />
          </Link>

          {hasSale && (
            <Badge
              variant='destructive'
              className='absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider shadow-sm'
            >
              Sale
            </Badge>
          )}

          <Button
            variant='secondary'
            size='icon'
            className='absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-white/90 hover:bg-white hover:text-destructive shadow-sm'
            onClick={handleRemove}
            disabled={isRemoving}
            title='Remove from wishlist'
          >
            {isRemoving ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Trash2 size={14} />
            )}
          </Button>
        </div>

        {/* Info Area */}
        <div className='p-4 flex flex-col flex-1 gap-3'>
          <div className='flex-1 space-y-1'>
            <Link
              to={`/products/${item.product_slug}`}
              className='block font-medium text-foreground line-clamp-2 hover:underline underline-offset-4 decoration-muted-foreground/50 transition-colors'
            >
              {item.product_name}
            </Link>

            <div className='flex items-baseline gap-2'>
              <span className='font-semibold text-lg'>
                {formatCurrencyVnd(item.sale_price || item.price)}
              </span>
              {hasSale && (
                <span className='text-sm text-muted-foreground line-through decoration-muted-foreground/50'>
                  {formatCurrencyVnd(item.price)}
                </span>
              )}
            </div>
          </div>

          <Button
            className='w-full gap-2 font-medium'
            onClick={handleAddToCart}
            disabled={isAdding}
            variant='default'
          >
            {isAdding ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <ShoppingBag size={16} />
            )}
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
