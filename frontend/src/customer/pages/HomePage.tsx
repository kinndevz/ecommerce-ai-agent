import { HeroSection } from '../components/home/HeroSection'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { ProductCarousel } from '../components/home/ProductCarousel'
import { BrandsSection } from '../components/home/BrandsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { NewsletterSection } from '../components/home/NewsletterSection'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Banner */}
      <div className='max-w-7xl mx-auto px-6 pt-6'>
        <HeroSection />
      </div>

      {/* Categories */}
      <CategoryGrid />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Arrivals Carousel */}
      <ProductCarousel />

      {/* Brands */}
      <BrandsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  )
}
