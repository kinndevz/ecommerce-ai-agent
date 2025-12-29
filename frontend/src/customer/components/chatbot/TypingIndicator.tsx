import { Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { AiFillTwitch } from 'react-icons/ai'

export const TypingIndicator = () => {
  return (
    <div className='flex gap-3 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-400'>
      {/* AI Avatar */}
      <Avatar className='w-9 h-9 shrink-0 ring-2 ring-background shadow-sm'>
        <AvatarFallback className='bg-accent text-accent-foreground'>
          <AiFillTwitch className='w-4 h-4' />
        </AvatarFallback>
      </Avatar>

      {/* Typing Bubble */}
      <div className='bg-muted/80 border border-border/50 rounded-2xl rounded-tl-md px-6 py-3.5 shadow-md'>
        <div className='flex items-center gap-2'>
          <div
            className='w-2.5 h-2.5 bg-foreground/50 rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          />
          <div
            className='w-2.5 h-2.5 bg-foreground/50 rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          />
          <div
            className='w-2.5 h-2.5 bg-foreground/50 rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <span className='text-xs text-muted-foreground ml-2'>
          Đang tìm kiếm...
        </span>
      </div>
    </div>
  )
}
