import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'
import { useAuth } from '@/hooks/useAuth'
import { PopupHeader } from './PopupHeader'
import { PopupMessageList } from './PopupMessageList'
import { PopupFAB } from './PopupFAB'
import { PopupInput } from './PopupInput'
import { ChatLayoutProvider } from '@/context/ChatLayoutContext'

export function ChatPopup() {
  const { isOpen, setIsOpen, initChat } = useChatStore()
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) initChat()
  }, [isOpen, initChat])

  return (
    <ChatLayoutProvider layout='compact'>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 sm:hidden'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-20 right-4 z-50',
          'w-[calc(100vw-2rem)] sm:w-100',
          'h-[70vh] sm:h-145 max-h-170',
          'flex flex-col overflow-hidden',
          'bg-background border border-border/50',
          'rounded-2xl shadow-2xl shadow-black/15',
          'transition-all duration-300 ease-out origin-bottom-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        )}
      >
        <PopupHeader />
        <PopupMessageList userAvatar={user?.avatar || ''} />
        <PopupInput />
      </div>

      <PopupFAB />
    </ChatLayoutProvider>
  )
}
