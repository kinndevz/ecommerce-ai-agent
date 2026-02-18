import { Check, Package, CreditCard, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutStepsProps {
  currentStep: number
}

const STEPS = [
  {
    number: 1,
    label: 'Thông tin giao hàng',
    icon: Package,
  },
  {
    number: 2,
    label: 'Phương thức thanh toán',
    icon: CreditCard,
  },
  {
    number: 3,
    label: 'Xác nhận đơn hàng',
    icon: ClipboardCheck,
  },
]

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className='w-full py-8'>
      <div className='relative flex items-start max-w-3xl mx-auto px-4'>
        {STEPS.map((step, index) => {
          const isActive = currentStep >= step.number
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const Icon = step.icon

          return (
            <div
              key={step.number}
              className='flex flex-col items-center relative flex-1'
            >
              {/* Connecting Line - Fixed alignment */}
              {index < STEPS.length - 1 && (
                <div className='absolute left-[50%] top-6 w-full h-0.5 -z-10'>
                  {/* Background line */}
                  <div className='absolute inset-0 bg-border' />
                  {/* Progress line */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-primary transition-all duration-700 ease-out',
                      isActive ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}

              {/* Circle with Icon */}
              <div className='relative mb-3 z-10'>
                {isCurrent && (
                  <>
                    <div className='absolute inset-0 rounded-full bg-primary/20 blur-lg animate-pulse' />
                    <div
                      className='absolute -inset-1 rounded-full border-2 border-primary/30 animate-ping'
                      style={{ animationDuration: '2s' }}
                    />
                  </>
                )}

                <div
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 bg-background',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'border-2 border-border text-muted-foreground',
                    isCurrent && 'scale-110 ring-4 ring-primary/20'
                  )}
                >
                  {isCompleted ? (
                    <Check className='h-5 w-5' strokeWidth={3} />
                  ) : (
                    <Icon className='h-5 w-5' />
                  )}
                </div>
              </div>

              {/* Label */}
              <div className='text-center'>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors block',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className='text-xs text-primary font-medium mt-1 block animate-pulse'>
                    Đang thực hiện
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
