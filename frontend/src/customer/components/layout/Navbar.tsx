import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  Heart,
  Settings,
  Package,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/shared/components/theme-provider'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/shared/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const { user, logout, isLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  // Prevent flash of "Sign In" button
  useEffect(() => {
    // Small delay to check auth status
    const timer = setTimeout(() => {
      setIsAuthLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [user])

  const categories = [
    { name: 'SKIN CARE', slug: 'skin-care' },
    { name: 'HAIR CARE', slug: 'hair-care' },
    { name: 'MAKEUP', slug: 'makeup' },
    { name: "MEN'S BODY", slug: 'mens-body' },
    { name: 'FRAGRANCE', slug: 'fragrance' },
    { name: 'CLEARANCE', slug: 'clearance' },
    { name: 'BRANDS', slug: 'brands' },
    { name: 'BLOG', slug: 'blog' },
    { name: 'TRENDING', slug: 'trending' },
    { name: 'WHOLESALE', slug: 'wholesale' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const cartItemsCount = 3

  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className='sticky top-0 z-50 w-full shadow-sm'>
      {/* Top Bar - Elegant announcement bar */}
      <div className='bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-b border-border/40'>
        <div className='max-w-7xl mx-auto px-6 h-10 flex items-center justify-between'>
          <div className='text-xs font-medium text-foreground/80 tracking-wide'>
            ✨ Free Shipping on Orders Over $50 | 🎁 New Arrivals Daily
          </div>

          <div className='flex items-center gap-4 text-xs font-medium'>
            <Link
              to='/help'
              className='text-foreground/70 hover:text-primary transition-colors hidden sm:inline'
            >
              Help & Support
            </Link>
            <Separator
              orientation='vertical'
              className='h-3.5 bg-border/60 hidden sm:block'
            />
            <Link
              to='/about'
              className='text-foreground/70 hover:text-primary transition-colors hidden sm:inline'
            >
              About Us
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar - Clean and professional */}
      <div className='bg-background/95 backdrop-blur-md border-b border-border/50'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link to='/' className='flex items-center gap-3'>
              <img
                src='/src/assets/company-logo.svg'
                alt='BeautyShop Logo'
                className='h-10 w-auto'
              />
              <span className='font-serif font-bold text-xl hidden sm:inline'>
                BeautyShop
              </span>
            </Link>

            {/* Search Bar - Desktop */}
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

            {/* Right Icons */}
            <div className='flex items-center gap-4'>
              {/* Theme Toggle */}
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

              {/* Cart Button - Refined */}
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

              {/* User Menu or Sign In - WITH LOADING SKELETON */}
              {isAuthLoading || isLoading ? (
                <div className='flex items-center gap-2'>
                  <Skeleton className='w-24 h-10 rounded-full' />
                </div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='soft'
                      className='gap-2.5 h-10 px-4 hover:bg-primary/10 rounded-full'
                    >
                      <Avatar className='w-7 h-7'>
                        <AvatarImage
                          src={user.avatar || ''}
                          alt={user.full_name}
                        />
                        <AvatarFallback className='bg-primary text-white text-xs'>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className='hidden sm:inline text-sm font-medium'>
                        {user.full_name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-56'>
                    <DropdownMenuLabel>
                      <div className='flex flex-col space-y-1'>
                        <p className='text-sm font-medium leading-none'>
                          {user.full_name}
                        </p>
                        <p className='text-xs leading-none text-muted-foreground'>
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className='w-4 h-4 mr-2' />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className='w-4 h-4 mr-2' />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className='w-4 h-4 mr-2' />
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className='w-4 h-4 mr-2' />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className='text-destructive focus:text-destructive'
                    >
                      <LogOut className='w-4 h-4 mr-2' />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  size='default'
                  className='animate-in fade-in duration-300 rounded-full px-6 font-medium shadow-sm'
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='md:hidden hover:bg-primary/10'
                  >
                    <Menu className='w-5 h-5' />
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-75 sm:w-100'>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className='h-[calc(100vh-8rem)] mt-6'>
                    <div className='mb-6'>
                      <form onSubmit={handleSearch} className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                          type='search'
                          placeholder='Search products...'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className='pl-9'
                        />
                      </form>
                    </div>
                    <Separator className='mb-4' />
                    <nav className='space-y-2'>
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          to={`/categories/${category.slug}`}
                          className='block py-2 text-sm font-medium hover:text-primary transition-colors'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </nav>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation - Elegant & Professional */}
      <div className='hidden md:block bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40 border-y border-border/30'>
        <div className='max-w-7xl mx-auto px-6'>
          <NavigationMenu className='max-w-full'>
            <NavigationMenuList className='flex-wrap justify-center gap-2 py-2'>
              {categories.map((category, index) => (
                <NavigationMenuItem key={category.slug}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={`/categories/${category.slug}`}
                      className={cn(
                        'inline-flex items-center justify-center px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] transition-all duration-200',
                        'text-foreground/70 hover:text-foreground',
                        'hover:bg-background/80 hover:shadow-sm bg-transparent'
                      )}
                    >
                      <span className='relative z-10'>{category.name}</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}
