import { Link } from 'react-router-dom'
import { Flame, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  ProductCardCompact,
  type ProductCardData,
} from '../../product/ProductCard'

interface TrendingSectionProps {
  products: ProductCardData[]
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onAddToCart: (id: string) => void
}

export const TrendingSection = ({
  products,
  favorites,
  onToggleFavorite,
  onAddToCart,
}: TrendingSectionProps) => {
  if (products.length === 0) return null

  return (
    <div className='mt-20'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-red-500/10 to-orange-500/10 rounded-full border border-red-500/20'>
          <Flame className='w-3.5 h-3.5 text-red-500' />
          <span className='text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider'>
            Trending Now
          </span>
        </div>
        <div className='h-px flex-1 bg-border' />
        <Button
          variant='ghost'
          size='sm'
          asChild
          className='text-muted-foreground hover:text-foreground'
        >
          <Link to='/products?sort=trending'>
            See all
            <ArrowRight className='w-3.5 h-3.5 ml-1' />
          </Link>
        </Button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-6'>
        {products.map((product) => (
          <ProductCardCompact
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  )
}
