import { Mail, Sparkles, Gift } from 'lucide-react'
import { BenefitsList, NewsletterForm } from './newsletter'

export const NewsletterSection = () => (
  <section className='py-16 lg:py-24 relative overflow-hidden'>
    <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-secondary/10 to-accent/5' />

    <div className='absolute inset-0 pointer-events-none overflow-hidden'>
      <div className='absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl' />
      <div className='absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl' />
      <Mail className='absolute top-20 right-[15%] w-8 h-8 text-primary/20 animate-bounce' />
      <Sparkles
        className='absolute bottom-20 left-[10%] w-6 h-6 text-secondary/20 animate-bounce'
        style={{ animationDelay: '0.5s' }}
      />
      <Gift
        className='absolute top-1/3 left-[5%] w-10 h-10 text-accent/20 animate-bounce'
        style={{ animationDelay: '1s' }}
      />
    </div>

    <div className='relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl lg:rounded-4xl shadow-2xl overflow-hidden'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5' />

        <div className='relative p-6 sm:p-8 lg:p-12'>
          <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
            <div className='space-y-6 text-center lg:text-left'>
              <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full'>
                <Mail className='w-3.5 h-3.5 text-primary' />
                <span className='text-xs font-semibold text-primary uppercase tracking-wider'>
                  Newsletter
                </span>
              </div>

              <div className='space-y-3'>
                <h2 className='text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight'>
                  Stay in the{' '}
                  <span className='bg-linear-to-r from-primary via-rose-500 to-violet-500 bg-clip-text text-transparent'>
                    Loop
                  </span>
                </h2>
                <p className='text-muted-foreground max-w-md mx-auto lg:mx-0'>
                  Subscribe to our newsletter and never miss out on exclusive deals,
                  new arrivals, and expert beauty tips.
                </p>
              </div>

              <BenefitsList />
            </div>

            <NewsletterForm />
          </div>
        </div>
      </div>
    </div>
  </section>
)
