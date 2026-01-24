import { ChevronRight } from 'lucide-react'
import type { OrderStatusStep } from '@/domains/admin/helpers/order.helpers'

interface OrderStatusPreviewProps {
  steps: OrderStatusStep[]
  selectedIndex: number
}

export function OrderStatusPreview({ steps, selectedIndex }: OrderStatusPreviewProps) {
  return (
    <div className='rounded-xl border bg-muted/30 p-4 space-y-4'>
      <div className='flex items-center gap-2 text-sm font-medium text-primary'>
        <ChevronRight className='w-4 h-4' />
        <span>Preview: After Update</span>
      </div>

      <div className='relative'>
        <div className='absolute top-3 left-[12.5%] right-[12.5%] h-0.5 bg-muted/50 -z-10'>
          <div
            className='h-full bg-primary/60 transition-all duration-500'
            style={{
              width: `${(selectedIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className='grid grid-cols-4 w-full'>
          {steps.map((step, index) => {
            const willBeActive = index <= selectedIndex
            return (
              <div key={step.status} className='flex justify-center'>
                <div
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] font-bold bg-background transition-colors
                    ${
                      willBeActive
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                    }
                  `}
                >
                  {index + 1}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
