import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '../shared/SectionHeading'
import { cn } from '@/lib/utils'
import { mockCategories } from '../data/mockData'

export const CategoryGrid = () => {
  return (
    <section className='py-16'>
      <div className='max-w-7xl mx-auto px-6'>
        <SectionHeading
          subtitle='Browse by'
          title='Shop by Category'
          description='Find your perfect beauty essentials'
          className='mb-10'
        />

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {mockCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Category Card Sub-component
interface CategoryCardProps {
  category: (typeof mockCategories)[0]
  index: number
}

const CategoryCard = ({ category, index }: CategoryCardProps) => {
  return (
    <a
      href={`/categories/${category.slug}`}
      className={cn(
        'group relative aspect-square rounded-xl overflow-hidden',
        'transition-all duration-300 hover:scale-105',
        'hover:shadow-xl hover:shadow-primary/20'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Background Image */}
      <img
        src={category.image}
        alt={category.name}
        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
        loading='lazy'
      />

      {/* Overlay */}
      <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent' />

      {/* Content */}
      <div className='absolute inset-0 p-4 flex flex-col justify-end text-white'>
        <h3 className='font-serif font-bold text-lg mb-1'>{category.name}</h3>
        <p className='text-xs text-gray-300 mb-2'>
          {category.productCount} products
        </p>
        <div className='flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all'>
          Explore
          <ArrowRight className='w-3 h-3' />
        </div>
      </div>
    </a>
  )
}
