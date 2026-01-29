import { Beaker, ShieldCheck, Leaf, HeartHandshake } from 'lucide-react'

export function TrustBadges() {
  const badges = [
    { icon: Beaker, label: 'Safe & Non-toxic' },
    { icon: ShieldCheck, label: 'Dermatologist Created' },
    { icon: Leaf, label: 'Biodegradable Ingredients' },
    { icon: HeartHandshake, label: 'Vegan & Cruelty-free' },
  ]

  return (
    <div className='grid grid-cols-4 gap-4 py-6'>
      {badges.map((badge, index) => (
        <div
          key={index}
          className='flex flex-col items-center text-center gap-3'
        >
          <div className='p-3 rounded-full bg-secondary/50'>
            <badge.icon
              size={20}
              className='text-foreground'
              strokeWidth={1.5}
            />
          </div>
          <span className='text-[10px] sm:text-xs leading-tight font-medium text-muted-foreground'>
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  )
}
