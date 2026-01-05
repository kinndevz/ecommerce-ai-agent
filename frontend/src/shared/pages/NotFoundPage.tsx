import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-primary/5 to-secondary/5 p-4 relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Gradient Orbs */}
        <div
          className='absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse'
          style={{
            transform: `translate(${mousePosition.x * 2}px, ${
              mousePosition.y * 2
            }px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />
        <div
          className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse'
          style={{
            animationDelay: '1s',
            transform: `translate(${-mousePosition.x * 2}px, ${
              -mousePosition.y * 2
            }px)`,
            transition: 'transform 0.3s ease-out',
          }}
        />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className='absolute w-2 h-2 bg-primary/30 rounded-full'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${15 + Math.random() * 10}s infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className='relative z-10 max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-1000'>
        {/* 404 Number - Giant & Elegant */}
        <div className='relative'>
          <h1
            className='text-[180px] md:text-[240px] font-bold leading-none bg-linear-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent'
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              transition: 'transform 0.5s ease-out',
            }}
          >
            404
          </h1>
          {/* Sparkle Effect */}
          <Sparkles
            className='absolute top-8 right-1/4 w-12 h-12 text-primary animate-pulse'
            style={{ animationDelay: '0.5s' }}
          />
          <Sparkles
            className='absolute bottom-8 left-1/4 w-8 h-8 text-secondary animate-pulse'
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Text Content */}
        <div
          className='space-y-4 animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.2s' }}
        >
          <h2 className='text-3xl md:text-4xl font-serif font-bold text-foreground'>
            Oops! Page Not Found
          </h2>
          <p className='text-lg text-muted-foreground max-w-md mx-auto leading-relaxed'>
            The page you're looking for seems to have vanished into thin air.
            Let's get you back on track.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className='max-w-md mx-auto animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.4s' }}
        >
          <div className='relative group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
            <Input
              type='text'
              placeholder='Search for products...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-12 h-14 bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/30 focus:border-primary/50 transition-all rounded-2xl shadow-lg'
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div
          className='flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom duration-1000'
          style={{ animationDelay: '0.6s' }}
        >
          <Button
            size='lg'
            onClick={() => navigate('/')}
            className='group h-14 px-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
          >
            <Home className='w-5 h-5 mr-2 group-hover:scale-110 transition-transform' />
            Back to Home
          </Button>

          <Button
            size='lg'
            variant='outline'
            onClick={handleGoBack}
            className='group h-14 px-8 rounded-full border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300'
          >
            <ArrowLeft className='w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform' />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div
          className='pt-8 space-y-3 animate-in fade-in duration-1000'
          style={{ animationDelay: '0.8s' }}
        >
          <p className='text-sm text-muted-foreground font-medium'>
            Or explore these pages:
          </p>
          <div className='flex flex-wrap gap-3 justify-center'>
            {[
              { label: 'Shop', path: '/products' },
              { label: 'Brands', path: '/brands' },
              { label: 'Categories', path: '/categories' },
              { label: 'Contact', path: '/contact' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className='px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card border border-border rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md'
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-40px) translateX(-10px);
            opacity: 0.4;
          }
          75% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}
