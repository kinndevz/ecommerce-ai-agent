import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'
import type { ProductListItem } from '@/api/product.api'

// TYPES

export interface ProductCardData {
  id: string
  slug?: string
  name: string
  brand: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  rating?: number
  reviews?: number
  isSale?: boolean
}

export interface ProductCardProps {
  product: ProductCardData
  variant?: 'default' | 'compact'
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
  onAddToCart?: (id: string) => void
  className?: string
}

// HELPERS

const FALLBACK_IMAGE = 'https://placehold.co/400x400/f8f8f8/e4e4e7?text=No+Image'

export const normalizeProduct = (product: ProductListItem): ProductCardData => {
  const hasSale = product.sale_price !== null && product.sale_price !== undefined

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name || '',
    description: product.short_description || '',
    price: hasSale ? product.sale_price! : product.price,
    originalPrice: hasSale ? product.price : undefined,
    image: product.product_image || FALLBACK_IMAGE,
    rating: product.rating_average || 0,
    reviews: product.review_count || 0,
    isSale: hasSale,
  }
}

export const calculateDiscount = (price: number, originalPrice?: number): number => {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

// FAVORITE BUTTON

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  className?: string
}

export const FavoriteButton = ({ isFavorite, onToggle, className }: FavoriteButtonProps) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onToggle()
    }}
    className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center',
      'bg-white/90 backdrop-blur-sm shadow-sm border border-border/50',
      'hover:scale-110 transition-all duration-200',
      isFavorite && 'bg-red-50 border-red-200',
      className
    )}
    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  >
    <Heart
      className={cn(
        'w-4 h-4 transition-colors',
        isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
      )}
    />
  </button>
)


export const ProductCard = ({
  product,
  variant = 'default',
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  className,
}: ProductCardProps) => {
  const [localFavorite, setLocalFavorite] = useState(isFavorite)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const productUrl = `/products/${product.slug || product.id}`

  const handleToggleFavorite = () => {
    setLocalFavorite(!localFavorite)
    onToggleFavorite?.(product.id)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAddingToCart(true)
    onAddToCart?.(product.id)
    // Simulate loading
    setTimeout(() => setIsAddingToCart(false), 500)
  }

  // Format display name: "Brand - Product Name" or just "Product Name"
  const displayName = product.brand 
    ? `${product.brand} - ${product.name}` 
    : product.name

  return (
    <div className={cn('group', className)}>
      <Link to={productUrl} className='block space-y-3'>
        {/* Image Container */}
        <div className='relative aspect-square overflow-hidden rounded-2xl bg-muted/30'>
          <img
            src={product.image}
            alt={product.name}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
          />

          {/* Sale Badge */}
          {product.isSale && (
            <Badge className='absolute top-3 right-3 bg-foreground text-background text-xs font-medium px-2.5 py-1 rounded-md'>
              Sale
            </Badge>
          )}

          {/* Favorite Button - Show on Hover */}
          {onToggleFavorite && (
            <div className='absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
              <FavoriteButton
                isFavorite={localFavorite}
                onToggle={handleToggleFavorite}
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className='space-y-2'>
          {/* Title */}
          <h3 className='font-medium text-foreground leading-snug line-clamp-1'>
            {displayName}
          </h3>

          {/* Description */}
          {product.description && (
            <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className='flex items-center justify-between gap-3 pt-1'>
          {/* Price */}
          <div className='flex items-baseline gap-2'>
            <span className='text-base font-semibold text-foreground'>
              {formatCurrencyVnd(product.price)}
            </span>
            {product.originalPrice && (
              <span className='text-sm text-muted-foreground line-through'>
                {formatCurrencyVnd(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {onAddToCart && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className='h-9 px-4 rounded-lg text-sm font-medium border-border hover:bg-foreground hover:text-background transition-colors'
            >
              {isAddingToCart ? 'Adding...' : 'Add to cart'}
            </Button>
          )}
        </div>
      </Link>
    </div>
  )
}

// COMPACT VARIANT - For smaller grids

export const ProductCardCompact = ({
  product,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  className,
}: ProductCardProps) => {
  const [localFavorite, setLocalFavorite] = useState(isFavorite)

  const productUrl = `/products/${product.slug || product.id}`

  const handleToggleFavorite = () => {
    setLocalFavorite(!localFavorite)
    onToggleFavorite?.(product.id)
  }

  return (
    <div className={cn('group', className)}>
      <Link to={productUrl} className='block space-y-2.5'>
        {/* Image */}
        <div className='relative aspect-square overflow-hidden rounded-xl bg-muted/30'>
          <img
            src={product.image}
            alt={product.name}
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
          />

          {product.isSale && (
            <Badge className='absolute top-2 right-2 bg-foreground text-background text-[10px] font-medium px-2 py-0.5 rounded'>
              Sale
            </Badge>
          )}

          {onToggleFavorite && (
            <div className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <FavoriteButton
                isFavorite={localFavorite}
                onToggle={handleToggleFavorite}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className='space-y-1'>
          <h4 className='text-sm font-medium text-foreground line-clamp-1'>
            {product.brand ? `${product.brand} - ${product.name}` : product.name}
          </h4>
          
          <div className='flex items-baseline gap-1.5'>
            <span className='text-sm font-semibold'>{formatCurrencyVnd(product.price)}</span>
            {product.originalPrice && (
              <span className='text-xs text-muted-foreground line-through'>
                {formatCurrencyVnd(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
