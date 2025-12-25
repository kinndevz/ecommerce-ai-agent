import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  description?: string
  className?: string
  align?: 'left' | 'center'
}

export const SectionHeading = ({
  title,
  subtitle,
  description,
  className,
  align = 'left',
}: SectionHeadingProps) => {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className={cn('space-y-2', alignClass, className)}>
      {subtitle && (
        <p className='text-sm font-semibold text-primary uppercase tracking-wider'>
          {subtitle}
        </p>
      )}
      <h2 className='text-3xl md:text-4xl font-serif font-bold text-foreground'>
        {title}
      </h2>
      {description && (
        <p className='text-muted-foreground max-w-2xl'>{description}</p>
      )}
    </div>
  )
}
