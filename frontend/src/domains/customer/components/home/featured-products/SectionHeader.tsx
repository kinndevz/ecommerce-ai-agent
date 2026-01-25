import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export interface SectionHeaderProps {
  badge: {
    icon: React.ReactNode
    label: string
    className: string
  }
  title: string
  description: string
  viewAllLink?: string
}

export const SectionHeader = ({
  badge,
  title,
  description,
  viewAllLink,
}: SectionHeaderProps) => (
  <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10'>
    <div className='space-y-3'>
      <div className={badge.className}>
        {badge.icon}
        <span className='text-xs font-semibold uppercase tracking-wider'>
          {badge.label}
        </span>
      </div>
      <h2 className='text-3xl sm:text-4xl font-serif font-bold tracking-tight'>
        {title}
      </h2>
      <p className='text-muted-foreground max-w-lg'>{description}</p>
    </div>

    {viewAllLink && (
      <Button
        variant='outline'
        asChild
        className='group rounded-full self-start sm:self-auto'
      >
        <Link to={viewAllLink}>
          View All
          <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
        </Link>
      </Button>
    )}
  </div>
)
