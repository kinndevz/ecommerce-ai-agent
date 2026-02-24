import { Check, Package, CreditCard, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutStepsProps {
  currentStep: number
}

const STEPS = [
  {
    number: 1,
    label: 'Thông tin giao hàng',
    subtitle: 'Đang thực hiện',
    icon: Package,
  },
  {
    number: 2,
    label: 'Phương thức thanh toán',
    subtitle: '',
    icon: CreditCard,
  },
  {
    number: 3,
    label: 'Xác nhận đơn hàng',
    subtitle: '',
    icon: ClipboardCheck,
  },
]

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const totalSteps = STEPS.length
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className='w-full py-8'>
      <div className='relative max-w-3xl mx-auto px-4'>
        <div className='relative flex items-start justify-between'>
          <div
            className='absolute top-6 h-0.5 z-0'
            style={{
              left: '50px',
              right: '50px',
            }}
          >
            <div className='absolute inset-0 bg-border rounded-full' />

            <div
              className='absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700 ease-in-out'
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps */}
          {STEPS.map((step) => {
            const isActive = currentStep >= step.number
            const isCompleted = currentStep > step.number
            const isCurrent = currentStep === step.number
            const Icon = step.icon

            return (
              <div
                key={step.number}
                className='flex flex-col items-center relative z-10'
              >
                <div className='relative mb-3'>
                  {isCurrent && (
                    <>
                      <div className='absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-md' />
                      <div
                        className='absolute -inset-2 rounded-full border-2 border-primary/20 animate-ping'
                        style={{ animationDuration: '2s' }}
                      />
                    </>
                  )}

                  <div
                    className={cn(
                      'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500',
                      isActive
                        ? 'bg-primary border-primary text-primary-foreground shadow-lg'
                        : 'bg-background border-border text-muted-foreground',
                      isCurrent && 'scale-110 ring-4 ring-primary/10'
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
                <div className='text-center max-w-35'>
                  <span
                    className={cn(
                      'text-sm font-medium block',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                  {isCurrent && step.subtitle && (
                    <span className='text-xs text-muted-foreground mt-1 block'>
                      {step.subtitle}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
