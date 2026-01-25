import { Navbar } from '../components/layout/Navbar'
import { HeroSection } from '../components/home/HeroSection'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { BrandShowcase } from '../components/home/BrandShowcase'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { NewsletterSection } from '../components/home/NewsletterSection'
import { Footer } from '../components/layout/Footer'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main>
        {/* Featured Products with Trending Section */}
        <FeaturedProducts />

        {/* Brand Showcase */}
        <BrandShowcase />

        {/* Customer Testimonials */}
        <TestimonialsSection />

        {/* Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
