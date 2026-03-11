import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'
import { buildPageContext } from '@/domains/customer/helpers/artifacts'

export function PopupInput() {
  const [value, setValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const location = useLocation()

  const { isInitializing, streamingStatus, sendMessageStreaming } =
    useChatStore()

  const isDisabled = isTyping || isInitializing || !!streamingStatus
  const canSend = !!value.trim() && !isDisabled

  const handleSend = async () => {
    if (!canSend) return
    const msg = value.trim()
    setValue('')
    setIsTyping(true)
    try {
      await sendMessageStreaming(msg, {
        pageContext: buildPageContext(location.pathname),
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className='px-3 pb-3 pt-2 border-t border-border/40 shrink-0'>
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl px-3 py-2',
          'bg-muted/50 border border-transparent',
          'focus-within:border-primary/30 focus-within:bg-background',
          'transition-all duration-200'
        )}
      >
        <Input
          ref={inputRef as any}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Nhắn tin...'
          disabled={isDisabled}
          className='border-none shadow-none bg-transparent focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground/50 h-auto'
          autoComplete='off'
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size='icon'
          className={cn(
            'h-7 w-7 shrink-0 rounded-lg transition-all duration-200',
            canSend
              ? 'bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:scale-105'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          <Send className='w-3.5 h-3.5' />
        </Button>
      </div>
    </div>
  )
}
