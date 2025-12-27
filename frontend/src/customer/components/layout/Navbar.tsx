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
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      {/* Top Bar */}
      <div className='border-b bg-muted/30'>
        <div className='max-w-7xl mx-auto px-6 h-9 flex items-center justify-between'>
          <div className='text-xs text-muted-foreground'>
            Welcome to BeautyShop!
          </div>

          {/* <div className='flex items-center gap-3'>
            <Link
              to='/login'
              className='text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              LOG IN
            </Link>
            <Separator orientation='vertical' className='h-3' />
            <Link
              to='/cart'
              className='text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              CART
            </Link>
          </div> */}
        </div>
      </div>

      {/* Main Navbar */}
      <div className='max-w-7xl mx-auto px-6'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-primary rounded-full flex items-center justify-center'>
              <span className='text-white font-bold text-xl'>B</span>
            </div>
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
          <div className='flex items-center gap-2'>
            {/* Theme Toggle */}
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleTheme}
              className='hidden sm:flex hover:bg-primary/10'
            >
              {theme === 'dark' ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
            </Button>

            {/* Cart */}
            <Button
              variant='ghost'
              size='icon'
              className='relative hover:bg-primary/10'
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className='w-5 h-5' />
              {cartItemsCount > 0 && (
                <Badge className='absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary hover:bg-primary'>
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* User Menu or Sign In - WITH LOADING SKELETON */}
            {isAuthLoading || isLoading ? (
              <div className='flex items-center gap-2'>
                <Skeleton className='w-8 h-8 rounded-full' />
                <Skeleton className='w-24 h-4 hidden sm:block' />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='gap-2 h-10 hover:bg-primary/10'
                  >
                    <Avatar className='w-8 h-8'>
                      <AvatarImage
                        src={user.avatar || ''}
                        alt={user.full_name}
                      />
                      <AvatarFallback className='bg-primary text-white text-sm'>
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
                size='sm'
                className='animate-in fade-in duration-300'
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

      {/* Categories Navigation */}
      <div className='hidden md:block border-t bg-primary text-primary-foreground'>
        <div className='max-w-7xl mx-auto px-6'>
          <NavigationMenu className='max-w-full'>
            <NavigationMenuList className='flex-wrap justify-start gap-0'>
              {categories.map((category, index) => (
                <NavigationMenuItem key={category.slug}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={`/categories/${category.slug}`}
                      className={cn(
                        'inline-flex items-center justify-center px-4 h-11 text-xs font-medium uppercase tracking-wide transition-colors',
                        'hover:bg-primary-foreground/10',
                        index === 0 && 'bg-primary-foreground/20 font-semibold'
                      )}
                    >
                      {category.name}
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
