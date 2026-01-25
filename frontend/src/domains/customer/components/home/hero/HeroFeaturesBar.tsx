import { Truck, Shield, Gift, type LucideIcon } from 'lucide-react'

interface Feature {
  icon: LucideIcon
  label: string
  desc: string
}

const FEATURES: Feature[] = [
  { icon: Truck, label: 'Free Shipping', desc: 'On orders $50+' },
  { icon: Shield, label: '100% Authentic', desc: 'Genuine products' },
  { icon: Gift, label: 'Gift Wrapping', desc: 'Beautiful packaging' },
]

export const HeroFeaturesBar = () => (
  <div className='absolute bottom-0 left-0 right-0 border-t border-border/30 bg-background/60 backdrop-blur-md'>
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-3 divide-x divide-border/30'>
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className='flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4'
          >
            <feature.icon className='w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0' />
            <div className='hidden sm:block'>
              <p className='text-xs sm:text-sm font-semibold'>{feature.label}</p>
              <p className='text-[10px] sm:text-xs text-muted-foreground'>
                {feature.desc}
              </p>
            </div>
            <span className='sm:hidden text-xs font-medium'>{feature.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)
