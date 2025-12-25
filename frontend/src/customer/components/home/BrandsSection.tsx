import { mockBrands } from '../data/mockData'
import { SectionHeading } from '../shared/SectionHeading'
import { cn } from '@/lib/utils'

export const BrandsSection = () => {
  return (
    <section className='py-16 bg-muted/30'>
      <div className='max-w-7xl mx-auto px-6'>
        <SectionHeading
          subtitle='Trusted by'
          title='Featured Brands'
          description='Premium beauty brands we proudly carry'
          align='center'
          className='mb-12'
        />

        <div className='grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6'>
          {mockBrands.map((brand, index) => (
            <BrandCard key={brand.id} brand={brand} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Brand Card Sub-component
interface BrandCardProps {
  brand: (typeof mockBrands)[0]
  index: number
}

const BrandCard = ({ brand, index }: BrandCardProps) => {
  return (
    <a
      href={`/brands/${brand.id}`}
      className={cn(
        'group relative aspect-square rounded-xl overflow-hidden',
        'bg-card border border-border',
        'transition-all duration-300 hover:scale-105',
        'hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Logo Container */}
      <div className='w-full h-full p-6 flex items-center justify-center'>
        <div className='relative w-full h-full'>
          <img
            src={brand.logo}
            alt={brand.name}
            className='w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0'
            loading='lazy'
          />
        </div>
      </div>

      {/* Hover Overlay */}
      <div className='absolute inset-0 bg-linear-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
        <div className='text-white'>
          <p className='font-semibold text-sm mb-1'>{brand.name}</p>
          <p className='text-xs opacity-90'>{brand.description}</p>
        </div>
      </div>
    </a>
  )
}
