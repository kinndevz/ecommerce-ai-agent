import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SectionHeading } from '../shared/SectionHeading'
import { ProductCard } from '../product/ProductCard'
import { toast } from 'sonner'
import { mockFeaturedProducts } from '../data/mockData'

export const FeaturedProducts = () => {
  const handleAddToCart = (productId: string) => {
    toast.success('Product added to cart!', {
      description: 'Check your cart to proceed to checkout',
    })
    console.log('Add to cart:', productId)
  }

  const handleToggleFavorite = (productId: string) => {
    console.log('Toggle favorite:', productId)
  }

  return (
    <section className='py-16 bg-muted/30'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Header */}
        <div className='flex items-end justify-between mb-10'>
          <SectionHeading
            subtitle='Hand-picked'
            title='Featured Products'
            description='Our most popular and best-selling items'
          />
          <Button variant='outline' className='group hidden md:flex'>
            View All
            <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
          </Button>
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6'>
          {mockFeaturedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className='flex justify-center mt-8 md:hidden'>
          <Button variant='outline' className='w-full group'>
            View All Products
            <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
          </Button>
        </div>
      </div>
    </section>
  )
}
