import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export const HeroBadge = () => (
  <div
    className='inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border border-border/50 shadow-lg animate-in fade-in slide-in-from-left duration-700'
    style={{ animationDelay: '0.1s' }}
  >
    <div className='flex items-center gap-1.5'>
      <Sparkles className='w-4 h-4 text-amber-500 animate-pulse' />
      <span className='text-xs font-semibold text-amber-600 dark:text-amber-400'>
        NEW COLLECTION
      </span>
    </div>
    <div className='w-px h-4 bg-border' />
    <div className='flex items-center gap-1'>
      <TrendingUp className='w-3.5 h-3.5 text-emerald-500' />
      <span className='text-xs text-muted-foreground'>Trending Now</span>
    </div>
  </div>
)

export const HeroHeading = () => (
  <div
    className='space-y-3 animate-in fade-in slide-in-from-left duration-700'
    style={{ animationDelay: '0.2s' }}
  >
    <h1 className='text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold tracking-tight leading-[1.1]'>
      <span className='block text-foreground'>Discover Your</span>
      <span className='block bg-linear-to-r from-primary via-rose-500 to-violet-500 bg-clip-text text-transparent'>
        Perfect Beauty
      </span>
    </h1>

    <p className='text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed'>
      Explore our curated collection of premium skincare and beauty essentials.
      Where luxury meets{' '}
      <span className='text-foreground font-medium'>affordable elegance</span>.
    </p>
  </div>
)

export const HeroCTAButtons = () => (
  <div
    className='flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-left duration-700'
    style={{ animationDelay: '0.3s' }}
  >
    <Button
      size='lg'
      asChild
      className='group h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5'
    >
      <Link to='/products'>
        <span className='font-semibold'>Shop Collection</span>
        <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
      </Link>
    </Button>

    <Button
      size='lg'
      variant='outline'
      className='group h-12 sm:h-14 px-6 sm:px-8 rounded-full border-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300'
    >
      <Play className='w-4 h-4 mr-2 group-hover:scale-110 transition-transform' />
      <span className='font-medium'>Watch Story</span>
    </Button>
  </div>
)

export const HeroTrustIndicators = () => (
  <div
    className='flex flex-wrap items-center gap-4 sm:gap-6 pt-4 animate-in fade-in slide-in-from-left duration-700'
    style={{ animationDelay: '0.4s' }}
  >
    <div className='flex items-center gap-2 px-3 py-2 bg-background/60 backdrop-blur-sm rounded-xl border border-border/50'>
      <div className='flex'>
        {[...Array(5)].map((_, i) => (
          <Star key={i} className='w-3.5 h-3.5 text-amber-400 fill-amber-400' />
        ))}
      </div>
      <span className='text-sm font-semibold'>4.9</span>
      <span className='text-xs text-muted-foreground'>(2.5k reviews)</span>
    </div>

    <div className='flex items-center gap-4'>
      <div className='text-center'>
        <p className='text-lg font-bold'>50K+</p>
        <p className='text-[10px] text-muted-foreground uppercase tracking-wide'>
          Happy Customers
        </p>
      </div>
      <div className='w-px h-8 bg-border' />
      <div className='text-center'>
        <p className='text-lg font-bold'>200+</p>
        <p className='text-[10px] text-muted-foreground uppercase tracking-wide'>
          Premium Brands
        </p>
      </div>
    </div>
  </div>
)

export const HeroContent = () => (
  <div className='space-y-6 lg:space-y-8 z-10'>
    <HeroBadge />
    <HeroHeading />
    <HeroCTAButtons />
    <HeroTrustIndicators />
  </div>
)
