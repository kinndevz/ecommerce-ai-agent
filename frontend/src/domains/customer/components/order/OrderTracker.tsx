import { Check, Truck, Package, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ORDER_STATUS } from '@/api/services/order.constants'

interface OrderTrackerProps {
  status: string
}

const STEPS = [
  { id: ORDER_STATUS.PENDING, label: 'Đã đặt hàng', icon: Clock },
  { id: ORDER_STATUS.PROCESSING, label: 'Đang xử lý', icon: Package },
  { id: ORDER_STATUS.SHIPPED, label: 'Đang vận chuyển', icon: Truck },
  { id: ORDER_STATUS.DELIVERED, label: 'Đã giao', icon: Check },
]

export function OrderTracker({ status }: OrderTrackerProps) {
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <div className='rounded-lg border-2 border-destructive/20 bg-destructive/5 p-6 text-center'>
        <div className='mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
          <XCircle className='h-8 w-8 text-destructive' />
        </div>
        <h3 className='text-lg font-semibold text-destructive mb-1'>
          Đơn hàng đã bị hủy
        </h3>
        <p className='text-sm text-muted-foreground'>
          Đơn hàng này đã bị hủy và quy trình giao hàng đã dừng lại.
        </p>
      </div>
    )
  }

  const currentStepIndex = STEPS.findIndex((step) => step.id === status)
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex

  const stepCount = STEPS.length
  const halfStepPercent = 100 / (stepCount * 2)
  const lineWidthPercent = 100 - 100 / stepCount

  return (
    <div className='w-full py-4'>
      <div className='relative flex flex-col md:flex-row w-full gap-2 md:gap-0'>
        {/* Progress Line */}
        <div
          className='absolute top-8 hidden h-1.5 -translate-y-1/2 md:block z-0 rounded-full overflow-hidden'
          style={{
            left: `${halfStepPercent}%`,
            width: `${lineWidthPercent}%`,
          }}
        >
          <div className='absolute inset-0 bg-muted h-full w-full' />
          <div
            className='absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-out'
            style={{ width: `${(activeIndex / (stepCount - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, index) => {
          const isActive = index <= activeIndex
          const isCompleted = index < activeIndex
          const isCurrent = index === activeIndex
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className='relative z-10 flex-1 flex flex-row md:flex-col items-center gap-3 md:gap-3'
            >
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-500',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg border-4 border-background'
                    : 'border-2 border-border bg-background text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className='h-6 w-6' strokeWidth={2.5} />
                ) : (
                  <Icon className='h-6 w-6' strokeWidth={2} />
                )}
              </div>

              <div className='flex flex-col md:items-center md:text-center'>
                <span
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>

                {isCurrent && (
                  <span className='text-xs text-primary font-medium mt-0.5'>
                    Đang tiến hành
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
