import { useState } from 'react'
import { ShoppingCart, Heart, Star, Eye, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/shared/components/ui/card'
import { cn } from '@/lib/utils'

const products = [
  {
    id: '1',
    name: 'Hydrating Hyaluronic Acid Serum',
    brand: 'The Ordinary',
    price: 320000,
    originalPrice: 450000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    rating: 4.8,
    reviews: 1234,
    badge: 'Best Seller',
    badgeColor: 'bg-amber-500',
  },
  {
    id: '2',
    name: 'Retinol Night Treatment Cream',
    brand: 'CeraVe',
    price: 580000,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
    rating: 4.9,
    reviews: 987,
    badge: 'New',
    badgeColor: 'bg-green-500',
  },
  {
    id: '3',
    name: 'Vitamin C Brightening Serum',
    brand: 'La Roche-Posay',
    price: 750000,
    originalPrice: 890000,
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
    rating: 4.7,
    reviews: 756,
    badge: 'Sale',
    badgeColor: 'bg-red-500',
  },
  {
    id: '4',
    name: 'Advanced Night Repair Serum',
    brand: 'Estée Lauder',
    price: 1850000,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    rating: 5.0,
    reviews: 2341,
    badge: 'Premium',
    badgeColor: 'bg-purple-500',
  },
  {
    id: '5',
    name: 'Gentle Foaming Cleanser',
    brand: 'Cetaphil',
    price: 285000,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    rating: 4.6,
    reviews: 543,
  },
  {
    id: '6',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    rating: 4.8,
    reviews: 1876,
    badge: 'Best Value',
    badgeColor: 'bg-blue-500',
  },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export const FeaturedProducts = () => {
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
          {products.map((product, index) => (
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
  product: (typeof products)[0]
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
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className='text-sm text-muted-foreground line-through'>
              {formatPrice(product.originalPrice)}
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
