import { Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'

export const TypingIndicator = () => {
  return (
    <div className='flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom duration-300'>
      {/* AI Avatar */}
      <Avatar className='w-8 h-8 shrink-0'>
        <AvatarFallback className='bg-accent text-accent-foreground'>
          <Bot className='w-4 h-4' />
        </AvatarFallback>
      </Avatar>

      {/* Typing Bubble */}
      <div className='bg-muted border border-border rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm'>
        <div className='flex items-center gap-1.5'>
          <div
            className='w-2 h-2 bg-foreground/40 rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          />
          <div
            className='w-2 h-2 bg-foreground/40 rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          />
          <div
            className='w-2 h-2 bg-foreground/40 rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  )
}
