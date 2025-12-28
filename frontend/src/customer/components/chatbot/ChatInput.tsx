import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export const ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='border-t border-border bg-background'
    >
      <div className='max-w-4xl mx-auto p-4'>
        <div
          className={cn(
            'flex items-end gap-2.5 p-3 rounded-2xl border border-border transition-colors duration-200',
            'bg-muted/40',
            'focus-within:border-primary focus-within:bg-background'
          )}
        >
          {/* Attachment Button */}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-10 w-10 shrink-0 hover:bg-accent/50 hover:text-accent-foreground transition-all hover:scale-110'
            disabled={disabled}
          >
            <Paperclip className='w-5 h-5' />
          </Button>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-h-10 bg-transparent! border-0 shadow-none max-h-50 resize-none',
              'border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              'px-0 py-2.5 text-[15px]',
              'placeholder:text-muted-foreground/60 placeholder:font-normal'
            )}
            rows={1}
          />

          {/* Emoji Button */}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-10 w-10 shrink-0 hover:bg-accent/50 hover:text-accent-foreground transition-all hover:scale-110'
            disabled={disabled}
          >
            <Smile className='w-5 h-5' />
          </Button>

          {/* Send Button */}
          <Button
            type='submit'
            size='icon'
            disabled={disabled || !message.trim()}
            className={cn(
              'h-10 w-10 shrink-0 rounded-xl transition-all duration-200',
              'hover:scale-105 active:scale-95',
              message.trim()
                ? 'bg-primary hover:bg-primary/90 shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <Send className='w-5 h-5' />
          </Button>
        </div>

        {/* Helper Text */}
        <p className='text-[11px] text-muted-foreground/60 text-center mt-2.5 font-medium'>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </form>
  )
}
