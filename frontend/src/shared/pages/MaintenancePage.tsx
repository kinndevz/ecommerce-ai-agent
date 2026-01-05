import { useEffect, useState } from 'react'
import { Wrench, Clock, Mail, Twitter, Facebook, Instagram } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { toast } from 'sonner'

export default function MaintenancePage() {
  const [email, setEmail] = useState('')
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success("Thanks! We'll notify you when we're back.")
      setEmail('')
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-amber-500/5 to-background p-4 relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />

        {/* Floating Gears */}
        {[...Array(6)].map((_, i) => (
          <Wrench
            key={i}
            className='absolute text-amber-500/20'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              animation: `spin ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className='relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-1000'>
        {/* Icon */}
        <div className='flex justify-center animate-in zoom-in duration-1000'>
          <div className='relative'>
            <div className='absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse' />
            <div className='relative w-32 h-32 bg-amber-500/10 rounded-full flex items-center justify-center border-4 border-amber-500/30'>
              <Wrench className='w-16 h-16 text-amber-600 animate-spin-slow' />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div
          className='space-y-4 animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.2s' }}
        >
          <h1 className='text-4xl md:text-5xl font-serif font-bold text-foreground'>
            We'll Be Back Soon!
          </h1>
          <p className='text-lg text-muted-foreground max-w-md mx-auto leading-relaxed'>
            We're currently performing scheduled maintenance to improve your
            experience. Thanks for your patience!
          </p>
        </div>

        {/* Countdown Timer */}
        <div
          className='flex justify-center gap-4 animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.4s' }}
        >
          {[
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item, index) => (
            <div
              key={item.label}
              className='flex flex-col items-center p-4 bg-card/50 backdrop-blur-sm border border-border rounded-2xl min-w-25'
            >
              <div className='text-4xl md:text-5xl font-bold text-amber-600'>
                {String(item.value).padStart(2, '0')}
              </div>
              <div className='text-xs uppercase tracking-wider text-muted-foreground mt-2'>
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Notify Me Form */}
        <div
          className='max-w-md mx-auto space-y-3 animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.6s' }}
        >
          <p className='text-sm text-muted-foreground font-medium'>
            Get notified when we're back online:
          </p>
          <form onSubmit={handleNotifyMe} className='flex gap-2'>
            <Input
              type='email'
              placeholder='your@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='h-12 bg-card/50 backdrop-blur-sm border-2 border-border hover:border-amber-500/30 focus:border-amber-500/50 transition-all rounded-xl'
              required
            />
            <Button
              type='submit'
              size='lg'
              className='h-12 px-6 bg-amber-600 hover:bg-amber-700 rounded-xl'
            >
              Notify Me
            </Button>
          </form>
        </div>

        {/* Social Links */}
        <div
          className='space-y-3 animate-in fade-in duration-1000'
          style={{ animationDelay: '0.8s' }}
        >
          <p className='text-sm text-muted-foreground'>
            Stay connected with us:
          </p>
          <div className='flex justify-center gap-3'>
            {[
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Facebook, href: '#', label: 'Facebook' },
              { icon: Instagram, href: '#', label: 'Instagram' },
              {
                icon: Mail,
                href: 'mailto:support@beautyshop.com',
                label: 'Email',
              },
            ].map((social) => (
              <Button
                key={social.label}
                variant='outline'
                size='icon'
                className='h-12 w-12 rounded-full border-2 border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all'
                onClick={() => window.open(social.href, '_blank')}
                aria-label={social.label}
              >
                <social.icon className='w-5 h-5' />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
