import { useNavigate } from 'react-router-dom'
import { User, LogOut, Package, Heart, Settings, Bot } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/shared/components/ui/dropdown-menu'
import { Button } from '@/shared/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Skeleton } from '@/shared/components/ui/skeleton'

interface UserNavProps {
  user: any
  isLoading: boolean
  onLogout?: () => void
}

export const UserNav = ({ user, isLoading, onLogout }: UserNavProps) => {
  const navigate = useNavigate()

  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <Skeleton className='w-24 h-10 rounded-full' />
  }

  if (!user) {
    return (
      <Button
        onClick={() => navigate('/login')}
        size='default'
        className='animate-in fade-in duration-300 rounded-full px-6 font-medium shadow-sm'
      >
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='gap-2.5 h-10 px-4 hover:bg-primary/10 rounded-full'
        >
          <Avatar className='w-7 h-7'>
            <AvatarImage src={user.avatar || ''} alt={user.full_name} />
            <AvatarFallback className='bg-primary text-white text-xs'>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className='hidden sm:inline text-sm font-medium'>
            {user.full_name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64 p-2'>
        <DropdownMenuLabel className='p-3'>
          <div className='flex items-center gap-3'>
            <Avatar className='w-10 h-10 ring-2 ring-primary/10'>
              <AvatarImage src={user.avatar || ''} alt={user.full_name} />
              <AvatarFallback className='bg-linear-to-br from-primary to-primary/80 text-white text-sm font-semibold'>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col space-y-1 flex-1 min-w-0'>
              <p className='text-sm font-semibold leading-none truncate'>
                {user.full_name}
              </p>
              <p className='text-xs leading-none text-muted-foreground truncate'>
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='my-2' />
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className='gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all focus:bg-blue-500/15 dark:focus:bg-blue-900/40 hover:scale-[1.02] dark:focus:text-white'
        >
          <div className='w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center'>
            <User className='w-4 h-4 text-blue-600 dark:text-blue-400' />
          </div>
          <span className='font-medium'>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/orders')}
          className='gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all focus:bg-purple-500/15 dark:focus:bg-purple-900/40 hover:scale-[1.02] dark:focus:text-white'
        >
          <div className='w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center'>
            <Package className='w-4 h-4 text-purple-600 dark:text-purple-400' />
          </div>
          <span className='font-medium'>Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/wishlist')}
          className='gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all focus:bg-pink-500/15 dark:focus:bg-pink-900/40 hover:scale-[1.02] dark:focus:text-white'
        >
          <div className='w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center'>
            <Heart className='w-4 h-4 text-pink-600 dark:text-pink-400' />
          </div>
          <span className='font-medium'>Wishlist</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/conversations')}
          className='gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all focus:bg-green-500/15 dark:focus:bg-green-900/40 hover:scale-[1.02] dark:focus:text-white'
        >
          <div className='w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center'>
            <Bot className='w-4 h-4 text-green-600 dark:text-green-400' />
          </div>
          <span className='font-medium'>AI Agent</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className='gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all focus:bg-orange-500/15 dark:focus:bg-orange-900/40 hover:scale-[1.02] dark:focus:text-white'
        >
          <div className='w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center'>
            <Settings className='w-4 h-4 text-orange-600 dark:text-orange-400' />
          </div>
          <span className='font-medium'>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className='my-2' />
        <DropdownMenuItem
          onClick={onLogout}
          className='gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-red-600 dark:text-red-400 focus:bg-red-500/15 hover:scale-[1.02] dark:focus:bg-red-900/40 dark:focus:text-white'
        >
          <div className='w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center'>
            <LogOut className='w-4 h-4 text-red-600 dark:text-red-400' />
          </div>
          <span className='font-medium'>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
