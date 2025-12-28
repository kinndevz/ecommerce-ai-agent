import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { useTheme } from '@/shared/components/theme-provider'
import { useChatStore } from '@/stores/useChatStore'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'
import { UserNav } from './UserNav'

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const { user, logout, isLoading: isUserLoading } = useAuth()
  const { categories, isLoading: isCategoriesLoading } = useCategories()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const resetChat = useChatStore((state) => state.reset)

  useEffect(() => {
    const timer = setTimeout(() => setIsAuthLoading(false), 300)
    return () => clearTimeout(timer)
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    resetChat()
    navigate('/login')
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const cartItemsCount = 3

  return (
    <header className='sticky top-0 z-50 w-full shadow-sm'>
      <div className='bg-linear-to-r from-primary/5 via-primary/10 to-secondary/5 border-b border-border/40 overflow-hidden relative'>
        <div className='h-10 flex items-center'>
          <div className='flex animate-marquee-seamless whitespace-nowrap'>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              ✨ Free Shipping on Orders Over $50
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              🎁 New Arrivals Daily - Shop Fresh Styles
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              💄 Premium Beauty Products From Top Brands
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              🌟 Up to 50% Off Selected Items
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              🎉 Sign Up for Exclusive Member Deals
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              💝 Beautiful Gift Sets Available Now
            </span>
            {/* Duplicate for seamless loop */}
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              ✨ Free Shipping on Orders Over $50
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              🎁 New Arrivals Daily - Shop Fresh Styles
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              💄 Premium Beauty Products From Top Brands
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              🌟 Up to 50% Off Selected Items
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              🎉 Sign Up for Exclusive Member Deals
            </span>
            <span className='text-xs font-medium text-foreground/80 tracking-wide px-8'>
              💝 Beautiful Gift Sets Available Now
            </span>
          </div>
        </div>
      </div>

      <div className='bg-background/95 backdrop-blur-md border-b border-border/50'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='flex items-center justify-between h-16'>
            <Link to='/' className='flex items-center gap-3'>
              <img
                src='/src/assets/company-logo.svg'
                alt='BeautyShop'
                className='h-10 w-auto'
              />
              <span className='font-serif font-bold text-xl hidden sm:inline'>
                BeautyShop
              </span>
            </Link>

            <div className='hidden md:flex flex-1 max-w-2xl mx-8'>
              <form onSubmit={handleSearch} className='relative w-full'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search products...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9 pr-4 h-10 w-full'
                />
              </form>
            </div>

            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={toggleTheme}
                className='hidden sm:flex hover:bg-primary/10 rounded-full'
              >
                {theme === 'dark' ? (
                  <Sun className='w-5 h-5' />
                ) : (
                  <Moon className='w-5 h-5' />
                )}
              </Button>

              <Button
                variant='soft'
                size='default'
                className='relative hover:bg-primary/10 rounded-full px-4 gap-2'
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className='w-5 h-5' />
                <span className='hidden sm:inline font-medium'>Cart</span>
                {cartItemsCount > 0 && (
                  <Badge className='ml-1 px-2 h-5 flex items-center justify-center text-xs bg-primary text-primary-foreground hover:bg-primary'>
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>

              <UserNav
                user={user}
                isLoading={isAuthLoading || isUserLoading}
                onLogout={handleLogout}
              />

              <MobileNav
                categories={categories}
                isLoading={isCategoriesLoading}
                isOpen={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <DesktopNav categories={categories} isLoading={isCategoriesLoading} />
    </header>
  )
}
