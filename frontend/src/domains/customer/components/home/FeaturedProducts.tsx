import { useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { useFeaturedProducts, useTrendingProducts } from '@/hooks/useProducts'
import {
  SectionHeader,
  ProductSkeleton,
  TrendingSection,
} from './featured-products'
import ProductCard, { normalizeProduct } from '../product/ProductCard'

export const FeaturedProducts = () => {
  const { data, isLoading } = useFeaturedProducts(6)
  const { data: trendingData } = useTrendingProducts(30, 4)

  const featuredProducts = data?.data?.map(normalizeProduct) ?? []
  const trendingProducts = trendingData?.data?.map(normalizeProduct) ?? []

  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    )
  }, [])

  const handleAddToCart = useCallback((id: string) => {
    console.log('Add to cart:', id)
  }, [])

  return (
    <section className='py-16 lg:py-24'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <SectionHeader
          badge={{
            icon: <Sparkles className='w-3.5 h-3.5 text-amber-500' />,
            label: 'Hand-picked Selection',
            className:
              'inline-flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20 text-amber-600 dark:text-amber-400',
          }}
          title='Featured Products'
          description='Discover our most loved skincare essentials, carefully selected for exceptional quality'
          viewAllLink='/products?featured=true'
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
          {isLoading && <ProductSkeleton count={3} />}

          {!isLoading && featuredProducts.length === 0 && (
            <div className='col-span-full text-center py-12 text-muted-foreground'>
              No featured products available.
            </div>
          )}

          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        <TrendingSection
          products={trendingProducts}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onAddToCart={handleAddToCart}
        />
      </div>
    </section>
  )
}
