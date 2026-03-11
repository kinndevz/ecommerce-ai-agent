import { X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'

export function PopupFAB() {
  const { isOpen, setIsOpen, currentConversation } = useChatStore()
  const hasMessages = (currentConversation?.messages?.length ?? 0) > 0

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'w-12 h-12 rounded-full',
        'bg-primary text-primary-foreground',
        'flex items-center justify-center',
        'shadow-lg shadow-primary/25',
        'hover:scale-110 active:scale-95',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2'
      )}
      aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
    >
      <div
        className={cn(
          'transition-transform duration-300',
          isOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'
        )}
      >
        {isOpen ? (
          <X className='w-5 h-5' />
        ) : (
          <MessageCircle className='w-5 h-5' />
        )}
      </div>

      {!isOpen && hasMessages && (
        <span className='absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background' />
      )}
    </button>
  )
}
