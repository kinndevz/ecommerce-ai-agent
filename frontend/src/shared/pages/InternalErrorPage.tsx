import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, RefreshCw, AlertTriangle, Mail } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function InternalErrorPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-destructive/5 to-background p-4 relative overflow-hidden'>
      {/* Background Effect */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main Content */}
      <div className='relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-1000'>
        {/* Error Icon */}
        <div className='flex justify-center animate-in zoom-in duration-1000'>
          <div className='relative'>
            <div className='absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-pulse' />
            <div className='relative w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center border-4 border-destructive/30'>
              <AlertTriangle className='w-16 h-16 text-destructive animate-pulse' />
            </div>
          </div>
        </div>

        {/* Error Number */}
        <div className='animate-in slide-in-from-bottom duration-1000'>
          <h1 className='text-8xl md:text-9xl font-bold text-destructive/80'>
            500
          </h1>
        </div>

        {/* Text Content */}
        <div
          className='space-y-4 animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className='text-3xl md:text-4xl font-serif font-bold text-foreground'>
            Internal Server Error
          </h2>
          <p className='text-lg text-muted-foreground max-w-md mx-auto leading-relaxed'>
            Something went wrong on our end. We're working to fix it. The page
            will auto-refresh in{' '}
            <span className='font-bold text-destructive'>{countdown}</span>{' '}
            seconds.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className='flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.4s' }}
        >
          <Button
            size='lg'
            onClick={handleRefresh}
            className='group h-14 px-8 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
          >
            <RefreshCw className='w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500' />
            Refresh Now
          </Button>

          <Button
            size='lg'
            variant='outline'
            onClick={() => navigate('/')}
            className='group h-14 px-8 rounded-full border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300'
          >
            <Home className='w-5 h-5 mr-2 group-hover:scale-110 transition-transform' />
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <div
          className='pt-8 space-y-3 animate-in fade-in duration-1000'
          style={{ animationDelay: '0.6s' }}
        >
          <p className='text-sm text-muted-foreground'>
            If the problem persists, please contact support:
          </p>
          <Button
            variant='ghost'
            size='sm'
            className='text-primary hover:text-primary/80'
            onClick={() =>
              (window.location.href = 'mailto:support@beautyshop.com')
            }
          >
            <Mail className='w-4 h-4 mr-2' />
            support@beautyshop.com
          </Button>
        </div>
      </div>
    </div>
  )
}
