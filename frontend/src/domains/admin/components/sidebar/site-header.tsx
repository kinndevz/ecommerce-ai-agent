import { useAuth } from '@/hooks/useAuth'
import { ModeToggle } from '@/shared/components/mode-toggle'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { Separator } from '@/shared/components/ui/separator'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { useEffect, useState } from 'react'

export function SiteHeader() {
  const { user } = useAuth()
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  useEffect(() => {
    const timer = setTimeout(() => setIsAuthLoading(false), 300)
    return () => clearTimeout(timer)
  }, [user])
  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <div className='ml-auto flex items-center gap-2 p-3'>
          <ModeToggle />
          <Separator
            orientation='vertical'
            className='mx-2 data-[orientation=vertical]:h-6'
          />
          <Avatar className='w-9 h-9'>
            <AvatarImage src={user?.avatar || ''} alt={user?.full_name} />
            <AvatarFallback className='bg-primary text-white text-xs'>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
