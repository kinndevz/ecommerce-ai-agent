import { useState } from 'react'
import { ShoppingCart, Heart, Star, Eye, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardFooter } from '@/shared/components/ui/card'
import { cn } from '@/lib/utils'
import { useFeaturedProducts } from '@/hooks/useProducts'
import type { ProductListItem } from '@/api/product.api'
import { formatCurrencyVnd } from '@/domains/customer/helpers/formatters'

const fallbackImageUrl = 'https://placehold.co/400x500/png?text=Product'

interface FeaturedProduct {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  badge?: string
  badgeColor?: string
}

const buildBadge = (product: ProductListItem) => {
  const hasSale = product.sale_price !== null && product.sale_price !== undefined
  if (hasSale) {
    return { label: 'Sale', color: 'bg-red-500' }
  }
  if (product.rating_average >= 4.8) {
    return { label: 'Top Rated', color: 'bg-amber-500' }
  }
  if (product.is_featured) {
    return { label: 'Featured', color: 'bg-primary' }
  }
  return null
}

const normalizeFeaturedProduct = (product: ProductListItem): FeaturedProduct => {
  const hasSale = product.sale_price !== null && product.sale_price !== undefined
  const badge = buildBadge(product)
  return {
    id: product.id,
    name: product.name,
    brand: product.brand?.name || 'Unknown',
    price: hasSale ? product.sale_price! : product.price,
    originalPrice: hasSale ? product.price : undefined,
    image: product.product_image || fallbackImageUrl,
    rating: product.rating_average || 0,
    reviews: product.review_count || 0,
    badge: badge?.label,
    badgeColor: badge?.color,
  }
}

export const FeaturedProducts = () => {
  const { data, isLoading } = useFeaturedProducts(6)
  const featuredProducts = data?.data?.map(normalizeFeaturedProduct) ?? []
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }

  return (
    <section className='py-20 relative overflow-hidden'>
      {/* Background Effects */}
      <div className='absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent' />

      <div className='relative max-w-7xl mx-auto px-6'>
        {/* Section Header - Enhanced */}
        <div className='text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom duration-1000'>
          <div className='inline-flex items-center gap-2.5 px-5 py-2.5 bg-linear-to-r from-primary/15 to-primary/10 text-primary rounded-full border-2 border-primary/30 shadow-md'>
            <Sparkles className='w-4 h-4 animate-pulse' />
            <span className='text-sm font-extrabold uppercase tracking-wider'>
              Hand-picked Favorites
            </span>
          </div>

          <h2 className='text-4xl md:text-5xl font-serif font-bold bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight'>
            Featured Products
          </h2>

          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Discover our most popular and highly-rated skincare essentials
          </p>
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {isLoading && (
            <div className='col-span-full text-center text-muted-foreground'>
              Loading featured products...
            </div>
          )}
          {!isLoading && featuredProducts.length === 0 && (
            <div className='col-span-full text-center text-muted-foreground'>
              No featured products available.
            </div>
          )}
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
            />
          ))}
        </div>

        {/* View All Button - Enhanced */}
        <div
          className='text-center mt-16 animate-in fade-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.2s' }}
        >
          <Button
            size='lg'
            variant='default'
            className='group h-12 px-8 rounded-full border-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200'
          >
            View All Products
            <Eye className='w-4 h-4 ml-2 group-hover:scale-110 transition-transform' />
          </Button>
        </div>
      </div>
    </section>
  )
}

// Product Card Component
interface ProductCardProps {
  product: FeaturedProduct
  index: number
  isFavorite: boolean
  onToggleFavorite: () => void
}

const ProductCard = ({
  product,
  index,
  isFavorite,
  onToggleFavorite,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-2 border-border/60 p-0',
        'hover:border-primary/40 hover:shadow-xl',
        'transition-all duration-300 cursor-pointer',
        'bg-card/80 dark:bg-card/50 backdrop-blur-sm',
        'dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]',
        'animate-in fade-in slide-in-from-bottom duration-700'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Full Image */}
      <div className='relative overflow-hidden aspect-4/5 bg-muted/30 dark:bg-muted/10'>
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-transform duration-500',
            isHovered && 'scale-105'
          )}
        />

        {/* Subtle Gradient Overlay */}
        <div className='absolute inset-0 bg-linear-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Badges - Refined */}
        <div className='absolute top-3 left-3 flex flex-col gap-2'>
          {product.badge && (
            <Badge
              className={cn(
                'text-white text-xs font-semibold shadow-md',
                product.badgeColor
              )}
            >
              {product.badge}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className='bg-red-500 text-white text-xs font-semibold shadow-md'>
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Favorite Button - More Visible */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className={cn(
            'absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center',
            'backdrop-blur-md transition-all duration-200 shadow-lg',
            'hover:scale-110 border',
            isFavorite
              ? 'bg-red-500 text-white border-red-600'
              : 'bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
          )}
        >
          <Heart className={cn('w-5 h-5', isFavorite && 'fill-white')} />
        </button>

        {/* Quick Actions - Simplified */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0',
            'transition-transform duration-300 flex gap-2'
          )}
        >
          <Button
            size='sm'
            className='flex-1 h-9 bg-primary hover:bg-primary/90 shadow-md rounded-full'
          >
            <ShoppingCart className='w-4 h-4 mr-1.5' />
            Add to Cart
          </Button>
          <Button
            size='sm'
            variant='default'
            className='w-9 h-9 p-0 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full'
          >
            <Eye className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Product Info - Enhanced Spacing */}
      <CardFooter className='flex flex-col items-start gap-2.5 p-4 bg-card dark:bg-card/70'>
        {/* Brand */}
        <Badge
          variant='secondary'
          className='text-xs font-medium px-2.5 py-0.5 dark:bg-secondary/70 dark:text-secondary-foreground'
        >
          {product.brand}
        </Badge>

        {/* Name */}
        <h3 className='font-semibold text-base leading-snug line-clamp-2 min-h-10 group-hover:text-primary transition-colors dark:text-foreground'>
          {product.name}
        </h3>

        {/* Rating */}
        <div className='flex items-center gap-2 w-full'>
          <div className='flex items-center gap-1'>
            <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' />
            <span className='text-sm font-semibold'>{product.rating}</span>
          </div>
          <span className='text-xs text-muted-foreground'>
            ({product.reviews.toLocaleString()} reviews)
          </span>
        </div>

        {/* Price */}
        <div className='flex items-baseline gap-2 w-full'>
          <span className='text-lg font-bold text-primary'>
            {formatCurrencyVnd(product.price)}
          </span>
          {product.originalPrice && (
            <span className='text-sm text-muted-foreground line-through'>
              {formatCurrencyVnd(product.originalPrice)}
            </span>
          )}
        </div>
      </CardFooter>

      {/* Shine Effect on Hover */}
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent',
          'translate-x-[-200%] group-hover:translate-x-[200%]',
          'transition-transform duration-1000 pointer-events-none'
        )}
      />
    </Card>
  )
}
