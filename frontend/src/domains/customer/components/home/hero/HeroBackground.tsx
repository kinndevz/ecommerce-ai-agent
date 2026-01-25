import { cn } from '@/lib/utils'

export const SLIDE_BACKGROUNDS = [
  'from-rose-100/80 via-pink-50/60 to-purple-100/80 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-purple-950/40',
  'from-amber-100/80 via-orange-50/60 to-rose-100/80 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/40',
  'from-emerald-100/80 via-teal-50/60 to-cyan-100/80 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/40',
  'from-blue-100/80 via-indigo-50/60 to-violet-100/80 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-violet-950/40',
]

interface HeroBackgroundProps {
  currentSlide: number
  mousePosition: { x: number; y: number }
}

export const HeroBackground = ({ currentSlide, mousePosition }: HeroBackgroundProps) => {
  return (
    <>
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-br transition-all duration-1000',
          SLIDE_BACKGROUNDS[currentSlide % SLIDE_BACKGROUNDS.length]
        )}
      />

      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse'
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className='absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-secondary/15 blur-3xl animate-pulse'
          style={{
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className='absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/10 blur-2xl animate-pulse'
          style={{ animationDelay: '2s' }}
        />

        <div className='absolute top-20 left-20 w-4 h-4 bg-primary/30 rounded-full animate-bounce' />
        <div
          className='absolute top-40 right-40 w-6 h-6 bg-secondary/30 rotate-45 animate-bounce'
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className='absolute bottom-40 left-1/3 w-3 h-3 bg-accent/40 rounded-full animate-bounce'
          style={{ animationDelay: '1s' }}
        />

        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
    </>
  )
}
