import type { ReactNode } from 'react'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface OrderPageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  subtitle?: string
  icon?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
}

export function OrderPageHeader({
  breadcrumbs,
  title,
  subtitle,
  icon,
  meta,
  actions,
}: OrderPageHeaderProps) {
  return (
    <div className='sticky top-0 z-20 bg-background/95 backdrop-blur border-b shadow-sm'>
      <div className='max-w-7xl mx-auto px-6 py-4'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground mb-3'>
          <Home className='w-4 h-4' />
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <div key={`${crumb.label}-${index}`} className='flex items-center gap-2'>
                <ChevronRight className='w-4 h-4' />
                {isLast || !crumb.onClick ? (
                  <span className='text-foreground font-medium'>{crumb.label}</span>
                ) : (
                  <button
                    onClick={crumb.onClick}
                    className='hover:text-foreground transition-colors'
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              {icon}
              {title}
            </h1>
            {subtitle && <p className='text-sm text-muted-foreground mt-1'>{subtitle}</p>}
            {meta && <div className='mt-2 flex flex-wrap items-center gap-2'>{meta}</div>}
          </div>

          {actions && <div className='flex items-center gap-2'>{actions}</div>}
        </div>
      </div>
    </div>
  )
}
