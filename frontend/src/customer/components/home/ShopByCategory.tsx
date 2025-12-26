import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/lib/utils'

const categories = [
  {
    id: '1',
    name: 'SKIN CARE',
    slug: 'skin-care',
    image:
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
    productCount: 156,
    gradient: 'from-emerald-500/30 to-teal-500/30',
    hoverGradient: 'group-hover:from-emerald-500/50 group-hover:to-teal-500/50',
    badgeColor: 'bg-emerald-600',
  },
  {
    id: '2',
    name: 'HAIR CARE',
    slug: 'hair-care',
    image:
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop',
    productCount: 89,
    gradient: 'from-purple-500/30 to-pink-500/30',
    hoverGradient: 'group-hover:from-purple-500/50 group-hover:to-pink-500/50',
    badgeColor: 'bg-purple-600',
  },
  {
    id: '3',
    name: 'MAKEUP',
    slug: 'makeup',
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop',
    productCount: 234,
    gradient: 'from-rose-500/30 to-pink-500/30',
    hoverGradient: 'group-hover:from-rose-500/50 group-hover:to-pink-500/50',
    badgeColor: 'bg-rose-600',
  },
  {
    id: '4',
    name: 'BATH & BODY',
    slug: 'bath-body',
    image:
      'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400&h=400&fit=crop',
    productCount: 123,
    gradient: 'from-blue-500/30 to-cyan-500/30',
    hoverGradient: 'group-hover:from-blue-500/50 group-hover:to-cyan-500/50',
    badgeColor: 'bg-blue-600',
  },
  {
    id: '5',
    name: 'FRAGRANCE',
    slug: 'fragrance',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    productCount: 67,
    gradient: 'from-amber-500/30 to-orange-500/30',
    hoverGradient: 'group-hover:from-amber-500/50 group-hover:to-orange-500/50',
    badgeColor: 'bg-orange-600',
  },
  {
    id: '6',
    name: 'TOOLS & DEVICES',
    slug: 'tools-devices',
    image:
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
    productCount: 45,
    gradient: 'from-slate-500/30 to-gray-500/30',
    hoverGradient: 'group-hover:from-slate-500/50 group-hover:to-gray-500/50',
    badgeColor: 'bg-slate-600',
  },
  {
    id: '7',
    name: 'HOME',
    slug: 'home',
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',
    productCount: 78,
    gradient: 'from-green-500/30 to-emerald-500/30',
    hoverGradient:
      'group-hover:from-green-500/50 group-hover:to-emerald-500/50',
    badgeColor: 'bg-green-600',
  },
]

export const ShopByCategory = () => {
  return (
    <section className='py-12'>
      <div className='text-center mb-10 space-y-2'>
        <Badge
          variant='secondary'
          className='bg-primary/10 text-primary border-primary/20'
        >
          <Sparkles className='w-3 h-3 mr-1' />
          Explore Collections
        </Badge>
        <h2 className='text-3xl md:text-4xl font-serif font-bold'>
          Shop by Category
        </h2>
        <p className='text-muted-foreground'>
          Discover our curated collections
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'>
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to={`/categories/${category.slug}`}
            className='group'
          >
            {/* Card với ảnh FULL, không padding */}
            <div
              className={cn(
                'relative overflow-hidden rounded-2xl',
                'border-2 border-border/50',
                'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10',
                'transition-all duration-500 cursor-pointer',
                'aspect-3/4', // Tỷ lệ 3:4 cho card đẹp
                'animate-in fade-in slide-in-from-bottom duration-1000'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Background Image - FULL CARD */}
              <img
                src={category.image}
                alt={category.name}
                className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
              />

              {/* Gradient Overlay */}
              <div
                className={cn(
                  'absolute inset-0 bg-linear-to-br transition-all duration-500',
                  category.gradient,
                  category.hoverGradient
                )}
              />

              {/* Content - Centered */}
              <div className='absolute inset-0 flex flex-col items-center justify-center p-4 text-center'>
                {/* Category Name */}
                <h3 className='text-sm md:text-base font-bold uppercase tracking-wider mb-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-110'>
                  {category.name}
                </h3>

                {/* Product Count Badge */}
                <Badge
                  className={cn(
                    'text-white shadow-lg text-xs md:text-sm font-semibold',
                    'transform transition-all duration-300',
                    'group-hover:scale-110 group-hover:shadow-xl',
                    category.badgeColor
                  )}
                >
                  {category.productCount}
                </Badge>
              </div>

              {/* Shine Effect */}
              <div
                className={cn(
                  'absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent',
                  'translate-x-[-200%] group-hover:translate-x-[200%]',
                  'transition-transform duration-1000 pointer-events-none'
                )}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
