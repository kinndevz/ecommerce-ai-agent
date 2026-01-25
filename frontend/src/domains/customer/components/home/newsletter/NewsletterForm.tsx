import { useState } from 'react'
import { Mail, Send, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SUBSCRIBER_AVATARS } from './newsletter.data'

export const NewsletterForm = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('Successfully subscribed!', {
      description: 'Check your inbox for your 15% discount code',
    })

    setEmail('')
    setIsSubscribed(true)
    setIsSubmitting(false)
  }

  if (isSubscribed) {
    return (
      <div className='text-center py-8 space-y-4'>
        <div className='w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center'>
          <Check className='w-10 h-10 text-emerald-500' />
        </div>
        <div className='space-y-2'>
          <h3 className='text-2xl font-bold'>You're In!</h3>
          <p className='text-muted-foreground'>
            Check your inbox for your welcome discount code.
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => setIsSubscribed(false)}
          className='rounded-full'
        >
          Subscribe Another Email
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='p-6 lg:p-8 rounded-2xl bg-linear-to-br from-muted/50 to-muted/30 border border-border/50'>
        <div className='space-y-4'>
          <div className='text-center mb-6'>
            <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3'>
              <Mail className='w-7 h-7 text-primary' />
            </div>
            <h3 className='text-lg font-semibold'>Join 50,000+ Beauty Lovers</h3>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='relative'>
              <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
              <Input
                type='email'
                placeholder='Enter your email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className='pl-12 h-14 rounded-xl bg-background/80 border-border/50 text-base focus:ring-2 focus:ring-primary/20'
              />
            </div>

            <Button
              type='submit'
              disabled={isSubmitting}
              className={cn(
                'w-full h-14 rounded-xl text-base font-semibold',
                'bg-linear-to-r from-primary via-rose-500 to-violet-500',
                'hover:opacity-90 transition-opacity',
                'shadow-lg shadow-primary/25'
              )}
            >
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  <span>Subscribing...</span>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <span>Get 15% Off</span>
                  <Send className='w-5 h-5' />
                </div>
              )}
            </Button>
          </form>

          <p className='text-xs text-center text-muted-foreground'>
            By subscribing, you agree to our{' '}
            <a href='/privacy' className='underline hover:text-foreground'>
              Privacy Policy
            </a>
            . Unsubscribe anytime.
          </p>
        </div>
      </div>

      <div className='flex items-center justify-center gap-3'>
        <div className='flex -space-x-2'>
          {SUBSCRIBER_AVATARS.map((src, i) => (
            <img
              key={i}
              src={src}
              alt='Subscriber'
              className='w-8 h-8 rounded-full border-2 border-background object-cover'
            />
          ))}
        </div>
        <p className='text-sm text-muted-foreground'>
          <span className='font-semibold text-foreground'>2,500+</span> joined this
          week
        </p>
      </div>
    </div>
  )
}
