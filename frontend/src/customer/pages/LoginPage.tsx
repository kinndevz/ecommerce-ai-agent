import { useState, useEffect } from 'react'

import { ModeToggle } from '@/shared/components/mode-toggle'
import { Button } from '@/shared/components/ui/button'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/shared/components/ui/avatar'
import { Sparkles, ShoppingBag, Star, Zap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'

const ROUTES = {
  home: '/home',
} as const

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [particles, setParticles] = useState<
    Array<{
      id: number
      left: string
      delay: string
      duration: string
      size: number
    }>
  >([])

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 10}s`,
      size: 2 + Math.random() * 4,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-primary/5 to-secondary/5 p-4 sm:p-6 lg:p-8 relative overflow-hidden'>
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className='particle bg-primary/20'
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      {/* Large Decorative Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Gradient Orbs */}
        <div className='absolute -top-40 -left-40 w-96 h-96 bg-linear-to-br from-primary/30 to-transparent rounded-full blur-3xl animate-float' />
        <div className='absolute -bottom-40 -right-40 w-96 h-96 bg-linear-to-tl from-secondary/30 to-transparent rounded-full blur-3xl animate-float-slow' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-linear-to-r from-accent/20 to-transparent rounded-full blur-3xl animate-rotate-slow' />

        {/* Grid Pattern */}
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Mode Toggle - Fixed Position */}
      <div className='fixed top-4 right-4 sm:top-6 sm:right-6 z-50'>
        <div className='animate-bounce-subtle'>
          <ModeToggle />
        </div>
      </div>

      {/* Back to Shop Button - Fixed Position (elegant, non-aggressive) */}
      <div className='fixed top-4 left-4 sm:top-6 sm:left-6 z-50'>
        <Button
          asChild
          variant='default'
          size='sm'
          className='rounded-2xl px-4 h-10 backdrop-blur-md'
        >
          <NavLink
            to={ROUTES.home}
            aria-label='Back to shop'
            className='inline-flex items-center gap-2'
          >
            <ShoppingBag className='w-4 h-4 text-muted-foreground' />
            <span className='hidden sm:inline font-medium'>Back to Shop</span>
          </NavLink>
        </Button>
      </div>

      {/* Main Content - Glassmorphism Container */}
      <div className='w-full max-w-350 mx-auto relative z-10'>
        {/* Glass Container wrapping both sides */}
        <div className='glass-effect rounded-4xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/10'>
          <div className='grid lg:grid-cols-[1.2fr_1fr] min-h-150'>
            {/* Left Side - Branding (Hidden on mobile) */}
            <div className='hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 relative overflow-hidden'>
              {/* Decorative Elements */}
              <div className='absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-primary/20 to-transparent rounded-full blur-3xl' />
              <div className='absolute bottom-0 left-0 w-64 h-64 bg-linear-to-tr from-secondary/20 to-transparent rounded-full blur-3xl' />

              <div className='relative z-10 space-y-8 animate-slide-in-left'>
                {/* Logo & Brand */}
                <div className='space-y-6'>
                  <div className='inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-linear-to-r from-primary/15 to-primary/10 border-2 border-primary/30 backdrop-blur shadow-md hover:shadow-lg hover:scale-102 transition-all duration-300'>
                    <Sparkles className='w-4 h-4 text-primary animate-pulse' />
                    <span className='text-sm font-extrabold text-primary tracking-wider uppercase'>
                      Premium Beauty
                    </span>
                  </div>

                  <h1 className='text-5xl xl:text-6xl 2xl:text-7xl font-serif font-bold leading-[1.1] tracking-tight'>
                    <span className='text-foreground'>Your Beauty,</span>
                    <br />
                    <span className='gradient-text'>Our Passion</span>
                  </h1>

                  <p className='text-base text-muted-foreground max-w-lg leading-relaxed'>
                    Join thousands who trust us for authentic, premium
                    cosmetics. Experience luxury beauty delivered with care.
                  </p>
                </div>

                {/* Features Grid */}
                <div className='grid grid-cols-2 gap-4 max-w-lg'>
                  {[
                    {
                      icon: Sparkles,
                      label: 'Authentic',
                      value: '100%',
                      color: 'text-primary',
                    },
                    {
                      icon: Star,
                      label: 'Reviews',
                      value: '4.9 ★',
                      color: 'text-yellow-500',
                    },
                    {
                      icon: Zap,
                      label: 'Fast Ship',
                      value: '24h',
                      color: 'text-secondary',
                    },
                    {
                      icon: ShoppingBag,
                      label: 'Products',
                      value: '1000+',
                      color: 'text-accent',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className='group p-5 rounded-xl bg-card/40 backdrop-blur border border-border/60 hover:border-primary/40 hover:bg-card/50 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer'
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <item.icon
                        className={`w-6 h-6 ${item.color} mb-3 group-hover:scale-110 transition-transform duration-300`}
                      />
                      <div className='text-2xl font-bold text-foreground mb-1 leading-none'>
                        {item.value}
                      </div>
                      <div className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className='mt-3 relative z-10 max-w-lg'>
                <div className='p-6 rounded-xl bg-card/50 backdrop-blur border border-border/60 shadow-md hover:border-primary/30 hover:shadow-lg transition-all duration-300'>
                  <div className='flex items-start gap-4'>
                    <Avatar className='w-12 h-12 shrink-0 shadow-sm border-2 border-primary/20'>
                      <AvatarImage
                        src='/src/assets/male-avatar.png'
                        alt='Le Hoang'
                      />
                      <AvatarFallback className='bg-linear-to-br from-primary via-secondary to-accent text-white font-bold'>
                        LH
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <p className='text-sm text-foreground/90 italic mb-3 leading-relaxed'>
                        "Absolutely love this platform! Genuine products, fast
                        delivery, and amazing customer service. My go-to for all
                        beauty needs! ✨"
                      </p>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-bold text-foreground'>
                          Le Hoang
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          • Premium Member
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className='flex items-center p-8 sm:p-10 lg:p-12 bg-card/40 backdrop-blur-sm'>
              <div className='w-full max-w-md mx-auto animate-slide-in-right'>
                {/* Mobile Logo (Visible only on mobile) */}
                <div className='lg:hidden text-center mb-10'>
                  <div className='inline-flex items-center gap-3 mb-3'>
                    <div className='w-11 h-11 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-md'>
                      <Sparkles className='w-6 h-6 text-white' />
                    </div>
                    <h2 className='text-3xl font-serif font-bold gradient-text'>
                      Lumière
                    </h2>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Premium Beauty Delivered
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className='flex p-1.5 bg-muted/50 backdrop-blur-sm rounded-2xl mb-8 border border-border/50'>
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isLogin
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      !isLogin
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form Content */}
                <div className='space-y-6'>
                  {isLogin ? (
                    <LoginForm key='login' />
                  ) : (
                    <RegisterForm
                      key='register'
                      onSwitchToLogin={() => setIsLogin(true)}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className='mt-8 pt-6 border-t border-border/50 text-center'>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    By continuing, you agree to our{' '}
                    <button className='text-primary hover:underline font-semibold transition-colors'>
                      Terms
                    </button>{' '}
                    and{' '}
                    <button className='text-primary hover:underline font-semibold transition-colors'>
                      Privacy Policy
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
