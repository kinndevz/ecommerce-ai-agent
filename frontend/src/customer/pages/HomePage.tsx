import { NewsletterSection } from '@/customer/components/home/NewsletterSection'
import { Navbar } from '../components/layout/Navbar'
import { HeroSection } from '../components/home/HeroSection'
import { ShopByCategory } from '../components/home/ShopByCategory'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { Sidebar } from '../components/layout/Sidebar'
import { Footer } from '../components/layout/Footer'
import { FloatingChatButton } from '../components/chatbot'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background relative overflow-hidden'>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content with Sidebar */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid lg:grid-cols-[1fr_320px] gap-8'>
          {/* Main Content */}
          <main className='space-y-16'>
            {/* Shop by Category - FULL IMAGE */}
            <div className='animate-in fade-in slide-in-from-bottom duration-1000'>
              <ShopByCategory />
            </div>

            {/* Featured Products */}
            <FeaturedProducts />
          </main>

          {/* Sidebar - FULL HEIGHT */}
          <aside className='hidden lg:block'>
            <div className='sticky top-24 h-[calc(100vh-7rem)]'>
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter */}
      <div className='animate-in fade-in slide-in-from-bottom duration-1000'>
        <NewsletterSection />
      </div>

      {/* Footer */}
      <Footer />

      <FloatingChatButton unreadCount={3} />
    </div>
  )
}
