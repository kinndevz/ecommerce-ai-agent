import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { formatPrice, type Product } from '../data/mockData'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onToggleFavorite?: (productId: string) => void
  className?: string
}

export const ProductCard = ({
  product,
  onAddToCart,
  onToggleFavorite,
  className,
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onAddToCart?.(product.id)
    setIsAddingToCart(false)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    onToggleFavorite?.(product.id)
  }

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price

  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50',
        className
      )}
    >
      {/* Image Container */}
      <div className='relative aspect-square overflow-hidden bg-muted/30'>
        <img
          src={product.image}
          alt={product.name}
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
          loading='lazy'
        />

        {/* Badges */}
        <div className='absolute top-3 left-3 flex flex-col gap-2'>
          {product.isBestSeller && (
            <Badge className='bg-amber-500 text-white hover:bg-amber-600'>
              Best Seller
            </Badge>
          )}
          {product.isNew && (
            <Badge className='bg-green-500 text-white hover:bg-green-600'>
              New
            </Badge>
          )}
          {product.discount && (
            <Badge className='bg-red-500 text-white hover:bg-red-600'>
              -{product.discount}%
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={cn(
            'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center',
            'transition-all duration-300 backdrop-blur-md',
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-muted-foreground hover:bg-white'
          )}
        >
          <Heart className={cn('w-5 h-5', isFavorite && 'fill-white')} />
        </button>

        {/* Quick Add to Cart - Shows on Hover */}
        <div className='absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300'>
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className='w-full bg-primary hover:bg-primary/90 text-white'
          >
            {isAddingToCart ? (
              <>Adding...</>
            ) : (
              <>
                <ShoppingCart className='w-4 h-4 mr-2' />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className='p-4 space-y-2'>
        {/* Brand */}
        <p className='text-xs font-semibold text-primary uppercase tracking-wide'>
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className='font-medium text-foreground line-clamp-2 min-h-10'>
          {product.name}
        </h3>

        {/* Rating */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
            <span className='text-sm font-semibold text-foreground'>
              {product.rating}
            </span>
          </div>
          <span className='text-xs text-muted-foreground'>
            ({product.reviewCount.toLocaleString()} reviews)
          </span>
        </div>

        {/* Price */}
        <div className='flex items-center gap-2'>
          <span className='text-lg font-bold text-foreground'>
            {formatPrice(discountedPrice)}
          </span>
          {product.discount && (
            <span className='text-sm text-muted-foreground line-through'>
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
