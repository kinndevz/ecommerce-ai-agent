import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'

const floatingProducts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300',
    name: 'Hydrating Serum',
    price: '320,000₫',
    position: 'top-20 right-10',
    delay: 0,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=300',
    name: 'Vitamin C',
    price: '450,000₫',
    position: 'top-40 right-32',
    delay: 0.2,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300',
    name: 'Night Cream',
    price: '550,000₫',
    position: 'bottom-32 right-20',
    delay: 0.4,
  },
]

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className='relative min-h-150 md:min-h-175 overflow-hidden bg-linear-to-br from-background via-primary/5 to-secondary/10'>
      {/* Animated Background Gradients */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />
        <div
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className='absolute inset-0 bg-grid-pattern opacity-[0.02]' />

      <div className='relative max-w-7xl mx-auto px-6 py-20 md:py-32'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          {/* Left Content */}
          <div className='space-y-8 animate-in fade-in slide-in-from-left duration-1000'>
            {/* Premium Badge - Enhanced */}
            <div className='inline-flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-primary/15 to-primary/10 text-primary rounded-full shadow-md border-2 border-primary/30'>
              <Sparkles className='w-4 h-4 animate-pulse' />
              <span className='text-sm font-extrabold uppercase tracking-wider'>
                Premium Beauty Products
              </span>
              <div className='w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse' />
            </div>

            {/* Main Heading */}
            <div className='space-y-4'>
              <h1 className='text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight'>
                <span className='bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent'>
                  Luxury Beauty,
                </span>
                <br />
                <span className='bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient'>
                  Exclusive Prices.
                </span>
              </h1>

              <p className='text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed'>
                Where premium products meet honest pricing.
                <span className='text-foreground font-semibold'>
                  {' '}
                  Shop now
                </span>{' '}
                and experience the finest in beauty.
              </p>
            </div>

            {/* CTA Buttons - Refined & Elegant */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                size='lg'
                className='group h-12 px-8 rounded-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200'
              >
                Shop Featured Products
                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
              </Button>

              <Button
                size='lg'
                variant='soft'
                className='group h-12 px-8 rounded-full border-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200'
              >
                Explore Collections
                <ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform' />
              </Button>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-6 pt-8 border-t border-border/50'>
              <div className='space-y-1'>
                <div className='flex items-center gap-1'>
                  <Star className='w-4 h-4 text-amber-500 fill-amber-500' />
                  <p className='text-2xl font-bold'>4.9</p>
                </div>
                <p className='text-xs text-muted-foreground'>Customer Rating</p>
              </div>
              <div className='space-y-1'>
                <p className='text-2xl font-bold'>10K+</p>
                <p className='text-xs text-muted-foreground'>Products Sold</p>
              </div>
              <div className='space-y-1'>
                <p className='text-2xl font-bold'>500+</p>
                <p className='text-xs text-muted-foreground'>Premium Brands</p>
              </div>
            </div>
          </div>

          {/* Right - Floating Products */}
          <div className='relative h-125 hidden lg:block'>
            {/* Main Product Showcase */}
            <div
              className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-in fade-in zoom-in duration-1000'
              style={{
                transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px))`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <div className='relative w-full h-full'>
                {/* Glow Effect */}
                <div className='absolute inset-0 bg-linear-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl animate-pulse' />

                {/* Main Image */}
                <div className='relative w-full h-full bg-background/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl overflow-hidden'>
                  <img
                    src='https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
                    alt='Featured Product'
                    className='w-full h-full object-cover'
                  />

                  {/* Price Tag */}
                  <div className='absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-md rounded-xl p-4 border border-border/50'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      Featured Product
                    </p>
                    <p className='font-semibold mb-1'>Premium Moisturizer</p>
                    <p className='text-lg font-bold text-primary'>₫450,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Mini Products */}
            {floatingProducts.map((product, index) => (
              <div
                key={product.id}
                className={cn(
                  'absolute w-32 h-32 animate-in fade-in zoom-in duration-1000',
                  product.position
                )}
                style={{
                  animationDelay: `${product.delay}s`,
                  transform: `translate(${mousePosition.x * -0.5}px, ${
                    mousePosition.y * -0.5
                  }px)`,
                  transition: 'transform 0.5s ease-out',
                }}
              >
                <div className='relative w-full h-full group cursor-pointer'>
                  {/* Hover Glow */}
                  <div className='absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity' />

                  {/* Card */}
                  <div className='relative w-full h-full bg-background/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-300'>
                    <img
                      src={product.image}
                      alt={product.name}
                      className='w-full h-full object-cover'
                    />

                    {/* Overlay on Hover */}
                    <div className='absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3'>
                      <div className='text-white'>
                        <p className='text-xs font-medium'>{product.name}</p>
                        <p className='text-xs opacity-90'>{product.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Decorative Elements */}
            <div className='absolute top-10 left-10 w-20 h-20 border-2 border-primary/30 rounded-full animate-spin-slow' />
            <div
              className='absolute bottom-20 right-10 w-16 h-16 border-2 border-secondary/30 rounded-full animate-spin-slow'
              style={{ animationDirection: 'reverse' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className='absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-background to-transparent' />
    </section>
  )
}
