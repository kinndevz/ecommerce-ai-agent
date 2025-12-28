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
  onLogout: () => void
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
          variant='soft'
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
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user.full_name}</p>
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
        <DropdownMenuItem onClick={() => navigate('/conversations')}>
          <Bot className='w-4 h-4 mr-2' />
          AI Agent
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className='w-4 h-4 mr-2' />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className='text-destructive focus:text-destructive'
        >
          <LogOut className='w-4 h-4 mr-2' />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
