import { cn } from '@/lib/utils'
import { BENEFITS } from './newsletter.data'

export const BenefitsList = () => (
  <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3'>
    {BENEFITS.map((benefit, index) => (
      <div key={index} className='flex items-center gap-3 p-3 rounded-xl bg-muted/50'>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            benefit.color
          )}
        >
          <benefit.icon className='w-5 h-5' />
        </div>
        <div className='text-left'>
          <p className='text-sm font-semibold'>{benefit.title}</p>
          <p className='text-xs text-muted-foreground'>{benefit.description}</p>
        </div>
      </div>
    ))}
  </div>
)
