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
        {/* Section Header */}
        <div className='text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom duration-1000'>
          <Badge
            variant='secondary'
            className='bg-primary/10 text-primary border-primary/20'
          >
            <Sparkles className='w-3 h-3 mr-1' />
            Hand-picked Favorites
          </Badge>

          <h2 className='text-4xl md:text-5xl font-serif font-bold'>
            <span className='bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent'>
              Featured Products
            </span>
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

        {/* View All Button */}
        <div
          className='text-center mt-16 animate-in fade-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.2s' }}
        >
          <Button
            size='lg'
            variant='outline'
            className='group border-2 hover:border-primary/50 hover:bg-primary/5'
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
        'group relative overflow-hidden border-2 border-border/50',
        'hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10',
        'transition-all duration-500 cursor-pointer',
        'animate-in fade-in slide-in-from-bottom duration-1000'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <CardContent className='p-0 relative overflow-hidden aspect-square bg-muted/30'>
        <img
          src={product.image}
          alt={product.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            isHovered && 'scale-110'
          )}
        />

        {/* Gradient Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          )}
        />

        {/* Badges */}
        <div className='absolute top-4 left-4 flex flex-col gap-2'>
          {product.badge && (
            <Badge className={cn('text-white shadow-lg', product.badgeColor)}>
              {product.badge}
            </Badge>
          )}
          {discount > 0 && (
            <Badge className='bg-red-500 text-white shadow-lg'>
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className={cn(
            'absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center',
            'backdrop-blur-md transition-all duration-300',
            'hover:scale-110',
            isFavorite
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
              : 'bg-white/90 text-muted-foreground hover:bg-white'
          )}
        >
          <Heart className={cn('w-5 h-5', isFavorite && 'fill-white')} />
        </button>

        {/* Quick Actions - Show on Hover */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0',
            'transition-transform duration-500 flex gap-2'
          )}
        >
          <Button
            size='sm'
            className='flex-1 bg-primary hover:bg-primary/90 shadow-lg'
          >
            <ShoppingCart className='w-4 h-4 mr-2' />
            Add to Cart
          </Button>
          <Button
            size='sm'
            variant='secondary'
            className='backdrop-blur-md bg-white/90 hover:bg-white'
          >
            <Eye className='w-4 h-4' />
          </Button>
        </div>
      </CardContent>

      {/* Product Info */}
      <CardFooter className='flex flex-col items-start gap-3 p-4'>
        {/* Brand */}
        <Badge variant='secondary' className='text-xs'>
          {product.brand}
        </Badge>

        {/* Name */}
        <h3 className='font-semibold text-base line-clamp-2 min-h-12 group-hover:text-primary transition-colors'>
          {product.name}
        </h3>

        {/* Rating */}
        <div className='flex items-center gap-2 w-full'>
          <div className='flex items-center gap-1'>
            <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
            <span className='text-sm font-semibold'>{product.rating}</span>
          </div>
          <span className='text-xs text-muted-foreground'>
            ({product.reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className='flex items-center gap-2 w-full'>
          <span className='text-xl font-bold text-primary'>
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
