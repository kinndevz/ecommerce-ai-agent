import { MessageCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ChatInterface } from './ChatInterface'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'

interface FloatingChatButtonProps {
  unreadCount?: number
}

export const FloatingChatButton = ({
  unreadCount = 0,
}: FloatingChatButtonProps) => {
  const { isOpen, setIsOpen } = useChatStore()

  return (
    <>
      {isOpen && <ChatInterface />}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'h-16 w-16 rounded-full shadow-2xl',
            'bg-primary hover:bg-primary/90',
            'transition-all duration-300',
            'hover:scale-110 active:scale-95',
            'group',
            'ring-4 ring-primary/10'
          )}
        >
          <MessageCircle className='w-7 h-7 text-primary-foreground transition-transform group-hover:scale-110' />

          {unreadCount > 0 && (
            <Badge className='absolute -top-2 -right-2 h-7 min-w-7 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background shadow-xl animate-pulse font-bold text-xs'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}

          <span className='absolute inset-0 rounded-full bg-primary opacity-60 animate-ping [animation-duration:2s]' />
        </Button>
      )}
    </>
  )
}
