import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAddToCart } from '@/hooks/useCarts'
import { useToggleWishlist } from '@/hooks/useWishlist'
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
  variant?: 'grid' | 'list' | 'compact'
  isFavorite?: boolean
  className?: string
}

// HELPERS

const FALLBACK_IMAGE =
  'https://placehold.co/400x400/f8f8f8/e4e4e7?text=No+Image'

export const normalizeProduct = (product: ProductListItem): ProductCardData => {
  const hasSale =
    product.sale_price !== null && product.sale_price !== undefined

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

// FAVORITE BUTTON

interface FavoriteButtonProps {
  isFavorite: boolean
  onToggle: () => void
  isLoading?: boolean
  className?: string
}

export const FavoriteButton = ({
  isFavorite,
  onToggle,
  isLoading,
  className,
}: FavoriteButtonProps) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onToggle()
    }}
    disabled={isLoading}
    className={cn(
      'w-7 h-7 rounded-full flex items-center justify-center',
      'bg-white/90 backdrop-blur-sm shadow-sm border border-border/50',
      'hover:scale-110 transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      isFavorite && 'bg-red-50 border-red-200',
      className
    )}
    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
  >
    <Heart
      className={cn(
        'w-3.5 h-3.5 transition-colors',
        isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
      )}
    />
  </button>
)

// GRID/DEFAULT VARIANT
export const ProductCard = ({
  product,
  variant = 'grid',
  isFavorite = false,
  className,
}: ProductCardProps) => {
  const [localFavorite, setLocalFavorite] = useState(isFavorite)

  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart()
  const { toggle: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist()

  const productUrl = `/products/${product.slug || product.id}`

  const handleToggleFavorite = () => {
    const newState = !localFavorite
    setLocalFavorite(newState)
    toggleWishlist(product.id, localFavorite)
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart({
      product_id: product.id,
      variant_id: null,
      quantity: 1,
    })
  }

  const displayName = product.brand
    ? `${product.brand} - ${product.name}`
    : product.name

  // LIST VARIANT - Horizontal Layout
  if (variant === 'list') {
    return (
      <div className={cn('group', className)}>
        <Link
          to={productUrl}
          className='flex gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow'
        >
          {/* Image - Fixed width */}
          <div className='relative w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-white border'>
            <img
              src={product.image}
              alt={product.name}
              className='absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105'
              loading='lazy'
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = FALLBACK_IMAGE
              }}
            />

            {product.isSale && (
              <Badge className='absolute top-1 right-1 bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-md z-10'>
                Sale
              </Badge>
            )}

            <div className='absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
              <FavoriteButton
                isFavorite={localFavorite}
                onToggle={handleToggleFavorite}
                isLoading={isTogglingWishlist}
              />
            </div>
          </div>

          {/* Content */}
          <div className='flex flex-1 flex-col justify-between min-w-0'>
            {/* Top Section */}
            <div>
              <h3 className='text-base font-semibold text-foreground leading-tight line-clamp-2 mb-2'>
                {displayName}
              </h3>
              {product.description && (
                <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
                  {product.description}
                </p>
              )}
            </div>

            {/* Bottom Section - Price & Button */}
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-baseline gap-2'>
                <span className='text-lg font-bold text-foreground'>
                  {formatCurrencyVnd(product.price)}
                </span>
                {product.originalPrice && (
                  <span className='text-sm text-muted-foreground line-through'>
                    {formatCurrencyVnd(product.originalPrice)}
                  </span>
                )}
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className='shrink-0'
              >
                {isAddingToCart ? (
                  <>
                    <div className='mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className='h-4 w-4 mr-2' />
                    Add to cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </Link>
      </div>
    )
  }

  // GRID VARIANT - Vertical Layout
  return (
    <div className={cn('group', className)}>
      <Link to={productUrl} className='block space-y-2'>
        {/* Image Container */}
        <div className='relative aspect-4/5 w-full overflow-hidden rounded-lg bg-white border border-border'>
          <img
            src={product.image}
            alt={product.name}
            className='absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = FALLBACK_IMAGE
            }}
          />

          {product.isSale && (
            <Badge className='absolute top-2 right-2 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md z-10'>
              Sale
            </Badge>
          )}

          <div className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10'>
            <FavoriteButton
              isFavorite={localFavorite}
              onToggle={handleToggleFavorite}
              isLoading={isTogglingWishlist}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className='space-y-1.5'>
          <h3 className='text-sm font-medium text-foreground leading-tight line-clamp-2 min-h-10'>
            {displayName}
          </h3>

          <div className='flex items-center justify-between gap-2'>
            <div className='flex flex-col'>
              <span className='text-base font-bold text-foreground'>
                {formatCurrencyVnd(product.price)}
              </span>
              {product.originalPrice && (
                <span className='text-xs text-muted-foreground line-through'>
                  {formatCurrencyVnd(product.originalPrice)}
                </span>
              )}
            </div>

            <Button
              variant='outline'
              size='icon'
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className='h-8 w-8 rounded-lg shrink-0 border-2'
            >
              {isAddingToCart ? (
                <div className='h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <ShoppingCart className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
}

// COMPACT VARIANT (for trending section etc)
export const ProductCardCompact = ({
  product,
  isFavorite = false,
  className,
}: ProductCardProps) => {
  const [localFavorite, setLocalFavorite] = useState(isFavorite)

  const { toggle: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist()

  const productUrl = `/products/${product.slug || product.id}`

  const handleToggleFavorite = () => {
    const newState = !localFavorite
    setLocalFavorite(newState)
    toggleWishlist(product.id, localFavorite)
  }

  return (
    <div className={cn('group', className)}>
      <Link to={productUrl} className='block space-y-2'>
        <div className='relative aspect-4/5 w-full overflow-hidden rounded-lg bg-white border border-border'>
          <img
            src={product.image}
            alt={product.name}
            className='absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105'
            loading='lazy'
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = FALLBACK_IMAGE
            }}
          />

          {product.isSale && (
            <Badge className='absolute top-2 right-2 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md z-10'>
              Sale
            </Badge>
          )}

          <div className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
            <FavoriteButton
              isFavorite={localFavorite}
              onToggle={handleToggleFavorite}
              isLoading={isTogglingWishlist}
            />
          </div>
        </div>

        <div className='space-y-1'>
          <h4 className='text-sm font-medium text-foreground line-clamp-2 leading-tight min-h-10'>
            {product.brand
              ? `${product.brand} - ${product.name}`
              : product.name}
          </h4>

          <div className='flex items-baseline gap-1.5'>
            <span className='text-sm font-bold'>
              {formatCurrencyVnd(product.price)}
            </span>
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
