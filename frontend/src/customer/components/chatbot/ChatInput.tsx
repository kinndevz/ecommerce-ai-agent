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
      className='border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'
    >
      <div className='max-w-4xl mx-auto p-4'>
        <div
          className={cn(
            'flex items-end gap-2 p-2 rounded-2xl border-2 border-border transition-all duration-200',
            'bg-muted/30',
            'focus-within:border-primary focus-within:bg-background focus-within:shadow-lg focus-within:shadow-primary/10'
          )}
        >
          {/* Attachment Button */}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-9 w-9 shrink-0 hover:bg-accent hover:text-accent-foreground'
            disabled={disabled}
          >
            <Paperclip className='w-4 h-4' />
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
              'px-0 py-2',
              'placeholder:text-muted-foreground/50'
            )}
            rows={1}
          />

          {/* Emoji Button */}
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-9 w-9 shrink-0 hover:bg-accent hover:text-accent-foreground'
            disabled={disabled}
          >
            <Smile className='w-4 h-4' />
          </Button>

          {/* Send Button */}
          <Button
            type='submit'
            size='icon'
            disabled={disabled || !message.trim()}
            className={cn(
              'h-9 w-9 shrink-0 rounded-xl transition-all duration-200',
              'hover:scale-110',
              message.trim()
                ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className='w-4 h-4' />
          </Button>
        </div>

        {/* Helper Text */}
        <p className='text-[10px] text-muted-foreground text-center mt-2'>
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </form>
  )
}
