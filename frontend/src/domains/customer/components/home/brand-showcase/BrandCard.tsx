import { Link } from 'react-router-dom'
import { ArrowRight, Verified } from 'lucide-react'
import type { Brand } from '@/api/brand.api'

const FALLBACK_LOGO = 'https://placehold.co/200x200/f4f4f5/a1a1aa?text=Brand'

interface BrandCardProps {
  brand: Brand
  variant?: 'featured' | 'default'
}

export const BrandCard = ({ brand, variant = 'default' }: BrandCardProps) => {
  const logoUrl = brand.logo_url || FALLBACK_LOGO

  if (variant === 'featured') {
    return (
      <Link
        to={`/brands/${brand.slug}`}
        className='group relative overflow-hidden rounded-2xl lg:rounded-3xl bg-linear-to-br from-card to-muted/50 border border-border/50 p-6 lg:p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1'
      >
        <div className='absolute inset-0 opacity-[0.03]'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className='relative flex items-center gap-5 lg:gap-6'>
          <div className='relative w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden bg-background shadow-lg border border-border/50 shrink-0'>
            <img
              src={logoUrl}
              alt={brand.name}
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
              loading='lazy'
            />
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2'>
              <h3 className='text-xl lg:text-2xl font-bold truncate group-hover:text-primary transition-colors'>
                {brand.name}
              </h3>
              {brand.is_active && (
                <Verified className='w-5 h-5 text-blue-500 shrink-0' />
              )}
            </div>

            {brand.description && (
              <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
                {brand.description}
              </p>
            )}

            <div className='inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300'>
              <span>Shop Collection</span>
              <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </div>
          </div>
        </div>

        <div className='absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-primary/10 to-transparent rounded-tl-full pointer-events-none' />
      </Link>
    )
  }

  return (
    <Link
      to={`/brands/${brand.slug}`}
      className='group relative overflow-hidden rounded-xl lg:rounded-2xl bg-card border border-border/50 p-4 lg:p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5'
    >
      <div className='flex flex-col items-center text-center gap-3'>
        <div className='w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-muted/50 shadow-sm'>
          <img
            src={logoUrl}
            alt={brand.name}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
            loading='lazy'
          />
        </div>

        <div>
          <h4 className='font-semibold text-sm lg:text-base group-hover:text-primary transition-colors'>
            {brand.name}
          </h4>
          {brand.description && (
            <p className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
              {brand.description}
            </p>
          )}
        </div>
      </div>

      <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
        <ArrowRight className='w-4 h-4 text-primary' />
      </div>
    </Link>
  )
}
