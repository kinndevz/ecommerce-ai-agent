import type { OrderStatusStep } from '@/domains/admin/helpers/order.helpers'
import { getOrderStatusIndex } from '@/domains/admin/helpers/order.helpers'
import type { OrderStatusType } from '@/api/services/order.constants'

interface OrderStatusProgressProps {
  steps: OrderStatusStep[]
  currentStatus: OrderStatusType
}

export function OrderStatusProgress({
  steps,
  currentStatus,
}: OrderStatusProgressProps) {
  const currentIndex = getOrderStatusIndex(steps, currentStatus)

  return (
    <div className='space-y-4'>
      <div className='text-sm font-medium text-muted-foreground'>Current Progress</div>

      <div className='relative'>
        <div className='absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-muted -z-10'>
          <div
            className='h-full bg-primary transition-all duration-500 ease-in-out'
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className='grid grid-cols-4 w-full'>
          {steps.map((step, index) => {
            const isActive = index <= currentIndex
            const isCurrent = index === currentIndex
            const Icon = step.icon

            return (
              <div
                key={step.status}
                className='flex flex-col items-center text-center group'
              >
                <div
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 rounded-full border-2 transition-all duration-300 bg-background
                    ${
                      isActive
                        ? 'border-primary text-primary shadow-sm shadow-primary/25'
                        : 'border-muted text-muted-foreground'
                    }
                    ${isCurrent ? 'scale-110 ring-4 ring-primary/10' : ''}
                  `}
                >
                  <Icon className='w-5 h-5' />
                </div>

                <div className='mt-3 space-y-0.5 px-1'>
                  <p
                    className={`text-xs font-semibold transition-colors duration-300 ${
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className='text-[10px] text-muted-foreground/80 leading-tight hidden sm:block'>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
