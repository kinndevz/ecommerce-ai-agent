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
            'fixed bottom-4 right-4 z-50',
            'h-14 w-14 rounded-full shadow-2xl',
            'bg-primary hover:bg-primary/90',
            'transition-all duration-300',
            'hover:scale-110',
            'group'
          )}
        >
          <MessageCircle className='w-6 h-6 text-primary-foreground transition-transform group-hover:scale-110' />

          {unreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-6 min-w-6 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-background shadow-lg animate-pulse'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}

          <span className='absolute inset-0 rounded-full bg-primary opacity-75 animate-ping' />
        </Button>
      )}
    </>
  )
}
