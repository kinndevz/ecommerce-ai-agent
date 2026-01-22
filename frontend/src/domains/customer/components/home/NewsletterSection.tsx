import { useState } from 'react'
import { Mail, Send, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'

export const NewsletterSection = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success('Successfully subscribed!', {
      description: 'Check your inbox for exclusive offers',
    })

    setEmail('')
    setIsSubmitting(false)
  }

  return (
    <section className='py-16 bg-linear-to-br from-primary/10 via-secondary/10 to-primary/10'>
      <div className='max-w-4xl mx-auto px-6'>
        <div className='relative bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12 overflow-hidden'>
          {/* Background Decoration */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl' />

          {/* Content */}
          <div className='relative text-center space-y-6'>
            {/* Icon */}
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4'>
              <Mail className='w-8 h-8 text-primary' />
            </div>

            {/* Heading */}
            <div className='space-y-2'>
              <div className='flex items-center justify-center gap-2'>
                <h2 className='text-3xl md:text-4xl font-serif font-bold text-foreground'>
                  Get Exclusive Offers
                </h2>
                <Sparkles className='w-6 h-6 text-primary' />
              </div>
              <p className='text-muted-foreground max-w-2xl mx-auto'>
                Subscribe to our newsletter and get 15% off your first order! Be
                the first to know about new arrivals, special promotions, and
                beauty tips.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='max-w-md mx-auto'>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                  <Input
                    type='email'
                    placeholder='Enter your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className='pl-10 h-12 bg-background/50'
                  />
                </div>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='h-12 px-6 bg-primary hover:bg-primary/90'
                >
                  {isSubmitting ? (
                    'Subscribing...'
                  ) : (
                    <>
                      Subscribe
                      <Send className='w-4 h-4 ml-2' />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Privacy Note */}
            <p className='text-xs text-muted-foreground'>
              We respect your privacy. Unsubscribe at any time.
            </p>

            {/* Benefits */}
            <div className='grid md:grid-cols-3 gap-4 pt-6'>
              <Benefit
                title='15% Off First Order'
                description='Exclusive welcome discount'
              />
              <Benefit
                title='Early Access'
                description='Be first to shop new arrivals'
              />
              <Benefit
                title='Beauty Tips'
                description='Expert skincare advice'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Benefit Sub-component
interface BenefitProps {
  title: string
  description: string
}

const Benefit = ({ title, description }: BenefitProps) => {
  return (
    <div className='text-center'>
      <p className='font-semibold text-sm text-foreground mb-1'>{title}</p>
      <p className='text-xs text-muted-foreground'>{description}</p>
    </div>
  )
}
