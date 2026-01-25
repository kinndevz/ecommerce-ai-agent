import { Link } from 'react-router-dom'
import { ArrowRight, Building2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/lib/utils'
import { useBrands } from '@/hooks/useBrands'
import { BrandCard, BrandShowcaseSkeleton, TrustBadges } from './brand-showcase'

export const BrandShowcase = () => {
  const { brands, isLoading, total } = useBrands({ include_inactive: false })

  const featuredBrands = brands.slice(0, 2)
  const otherBrands = brands.slice(2, 6)

  if (!isLoading && brands.length === 0) return null

  return (
    <section className='py-16 lg:py-24 relative overflow-hidden'>
      <div className='absolute inset-0 bg-linear-to-b from-background via-muted/20 to-background' />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 lg:mb-14'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-emerald-500/10 to-teal-500/10 rounded-full border border-emerald-500/20'>
              <Building2 className='w-3.5 h-3.5 text-emerald-500' />
              <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider'>
                {total > 0 ? `${total} Trusted Partners` : 'Trusted Partners'}
              </span>
            </div>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight'>
              Shop Premium Brands
            </h2>
            <p className='text-muted-foreground max-w-lg'>
              We partner with the world's leading beauty and skincare brands
            </p>
          </div>

          <Button
            variant='outline'
            asChild
            className='group rounded-full self-start sm:self-auto'
          >
            <Link to='/brands'>
              All Brands
              <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <BrandShowcaseSkeleton />
        ) : (
          <>
            {featuredBrands.length > 0 && (
              <div
                className={cn(
                  'grid gap-4 lg:gap-6 mb-6',
                  featuredBrands.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'
                )}
              >
                {featuredBrands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} variant='featured' />
                ))}
              </div>
            )}

            {otherBrands.length > 0 && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4'>
                {otherBrands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            )}
          </>
        )}

        <TrustBadges />
      </div>
    </section>
  )
}
