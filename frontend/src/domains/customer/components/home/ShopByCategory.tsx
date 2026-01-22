import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks/useCategories'

const fallbackCategoryImage =
  'https://placehold.co/400x400/png?text=Category'

const categoryStyles = [
  {
    gradient: 'from-emerald-500/30 to-teal-500/30',
    hoverGradient: 'group-hover:from-emerald-500/50 group-hover:to-teal-500/50',
    badgeColor: 'bg-emerald-600',
  },
  {
    gradient: 'from-purple-500/30 to-pink-500/30',
    hoverGradient: 'group-hover:from-purple-500/50 group-hover:to-pink-500/50',
    badgeColor: 'bg-purple-600',
  },
  {
    gradient: 'from-rose-500/30 to-pink-500/30',
    hoverGradient: 'group-hover:from-rose-500/50 group-hover:to-pink-500/50',
    badgeColor: 'bg-rose-600',
  },
  {
    gradient: 'from-blue-500/30 to-cyan-500/30',
    hoverGradient: 'group-hover:from-blue-500/50 group-hover:to-cyan-500/50',
    badgeColor: 'bg-blue-600',
  },
  {
    gradient: 'from-amber-500/30 to-orange-500/30',
    hoverGradient: 'group-hover:from-amber-500/50 group-hover:to-orange-500/50',
    badgeColor: 'bg-orange-600',
  },
  {
    gradient: 'from-slate-500/30 to-gray-500/30',
    hoverGradient: 'group-hover:from-slate-500/50 group-hover:to-gray-500/50',
    badgeColor: 'bg-slate-600',
  },
  {
    gradient: 'from-green-500/30 to-emerald-500/30',
    hoverGradient: 'group-hover:from-green-500/50 group-hover:to-emerald-500/50',
    badgeColor: 'bg-green-600',
  },
]

export const ShopByCategory = () => {
  const { categories, isLoading } = useCategories()
  const displayCategories = useMemo(() => {
    return categories.map((category, index) => {
      const style = categoryStyles[index % categoryStyles.length]
      return {
        id: category.id,
        name: category.name.toUpperCase(),
        slug: category.slug,
        image: category.image_url || fallbackCategoryImage,
        productCount: category.product_count || 0,
        gradient: style.gradient,
        hoverGradient: style.hoverGradient,
        badgeColor: style.badgeColor,
      }
    })
  }, [categories])

  const primaryCategories = displayCategories.slice(0, 4)
  const secondaryCategories = displayCategories.slice(4)

  return (
    <section className='py-16 bg-linear-to-b from-background via-muted/20 to-background'>
      <div className='max-w-7xl mx-auto px-6'>
        {/* Section Header - Enhanced */}
        <div className='text-center mb-12 space-y-4'>
          <div className='inline-flex items-center gap-2.5 px-5 py-2.5 bg-linear-to-r from-primary/15 to-primary/10 text-primary rounded-full border-2 border-primary/30 shadow-md'>
            <Sparkles className='w-4 h-4 animate-pulse' />
            <span className='text-sm font-extrabold uppercase tracking-wider'>
              Explore Collections
            </span>
          </div>
          <h2 className='text-4xl md:text-5xl font-serif font-bold bg-linear-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight'>
            Shop by Category
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Discover our curated collections of premium beauty products
          </p>
        </div>

        {/* Categories Grid - Refined Layout */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {isLoading && (
            <div className='col-span-full text-center text-muted-foreground'>
              Loading categories...
            </div>
          )}
          {!isLoading && primaryCategories.length === 0 && (
            <div className='col-span-full text-center text-muted-foreground'>
              No categories available.
            </div>
          )}
          {primaryCategories.map((category, index) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className='group'
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl',
                  'border border-border/40 bg-card',
                  'hover:border-primary/30 hover:shadow-2xl',
                  'transition-all duration-300 cursor-pointer',
                  'aspect-square',
                  'animate-in fade-in slide-in-from-bottom duration-700'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                />

                {/* Gradient Overlay - Softer */}
                <div
                  className={cn(
                    'absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/70 transition-all duration-300',
                    category.gradient,
                    category.hoverGradient
                  )}
                />

                {/* Content */}
                <div className='absolute inset-0 flex flex-col items-center justify-end p-6 text-center'>
                  <h3 className='text-lg md:text-xl font-bold uppercase tracking-wide mb-2 text-white transform transition-transform group-hover:scale-105'>
                    {category.name}
                  </h3>
                  <p className='text-sm text-white/80 font-medium'>
                    {category.productCount} Products
                  </p>
                </div>

                {/* Hover Accent Border */}
                <div className='absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-2xl transition-all duration-300 pointer-events-none' />
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Categories - Smaller Grid */}
        <div className='grid grid-cols-3 md:grid-cols-3 gap-4 mt-6'>
          {secondaryCategories.map((category, index) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              className='group'
            >
              <div
                className={cn(
                  'relative overflow-hidden rounded-xl',
                  'border border-border/40 bg-card',
                  'hover:border-primary/30 hover:shadow-lg',
                  'transition-all duration-300 cursor-pointer',
                  'aspect-video',
                  'animate-in fade-in slide-in-from-bottom duration-700'
                )}
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                />

                {/* Gradient Overlay */}
                <div
                  className={cn(
                    'absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/60 transition-all duration-300',
                    category.gradient,
                    category.hoverGradient
                  )}
                />

                {/* Content */}
                <div className='absolute inset-0 flex flex-col items-center justify-center text-center p-4'>
                  <h3 className='text-sm md:text-base font-bold uppercase tracking-wide text-white transform transition-transform group-hover:scale-105'>
                    {category.name}
                  </h3>
                  <p className='text-xs text-white/70 font-medium mt-1'>
                    {category.productCount} Products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
