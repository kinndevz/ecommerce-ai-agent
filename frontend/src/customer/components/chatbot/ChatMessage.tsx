import { Check, CheckCheck } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AiFillTwitch } from 'react-icons/ai'
import { FaUserGraduate } from 'react-icons/fa'
import DOMPurify from 'dompurify'
export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date | string
  status?: 'sending' | 'sent' | 'read'
}

interface ChatMessageProps {
  message: Message
  showAvatar?: boolean
  showTimestamp?: boolean
  userAvatar?: string | null
}

export const ChatMessage = ({
  message,
  showAvatar = true,
  showTimestamp = false,
  userAvatar,
}: ChatMessageProps) => {
  const isUser = message.sender === 'user'
  const isAI = message.sender === 'ai'

  const formatTime = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput)
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date)
    } catch (e) {
      return ''
    }
  }

  const renderContent = () => {
    if (isUser) {
      return (
        <p
          className={cn(
            'text-sm leading-relaxed whitespace-pre-wrap wrap-break-word font-medium',
            'text-primary-foreground'
          )}
        >
          {message.content}
        </p>
      )
    }

    const cleanHtml = DOMPurify.sanitize(message.content, {
      ADD_ATTR: ['target', 'class', 'src', 'alt', 'loading'],
      ADD_TAGS: ['img', 'div', 'span', 'p', 'h4', 'ul', 'li', 'b', 'strong'],
    })

    return (
      <div
        className={cn(
          'text-sm text-foreground leading-relaxed',
          '[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4',
          '[&_a]:text-primary [&_a]:underline',
          '[&_b]:font-bold [&_strong]:font-bold'
        )}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex gap-3 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-400',
        isUser && 'flex-row-reverse'
      )}
    >
      {showAvatar && (
        <Avatar className='w-9 h-9 shrink-0 ring-2 ring-background shadow-sm'>
          {isUser ? (
            <>
              <AvatarImage
                src={userAvatar || undefined}
                alt='User Avatar'
                className='object-cover'
              />
              <AvatarFallback className='bg-primary text-primary-foreground'>
                <FaUserGraduate className='w-4 h-4' />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className='bg-accent text-accent-foreground'>
              <AiFillTwitch className='w-4 h-4' />
            </AvatarFallback>
          )}
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-1',
          isAI ? 'max-w-[85%]' : 'max-w-[75%]',
          isUser && 'items-end',
          !showAvatar && (isUser ? 'mr-11' : 'ml-11')
        )}
      >
        <div
          className={cn(
            'relative px-4 py-3 rounded-2xl',
            'transition-shadow duration-200',
            isUser &&
              cn(
                'bg-primary text-primary-foreground',
                'rounded-tr-md shadow-sm',
                'hover:shadow-md'
              ),
            isAI &&
              cn(
                'bg-background border border-border',
                'rounded-tl-md shadow-sm',
                'hover:shadow-md',
                'overflow-hidden'
              )
          )}
        >
          {renderContent()}
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 px-2',
            isUser && 'flex-row-reverse'
          )}
        >
          <span className='text-[10px] text-muted-foreground/70 font-medium'>
            {formatTime(message.timestamp)}
          </span>

          {isUser && message.status && (
            <div className='text-muted-foreground'>
              {message.status === 'sending' && <Check className='w-3 h-3' />}
              {message.status === 'sent' && <CheckCheck className='w-3 h-3' />}
              {message.status === 'read' && (
                <CheckCheck className='w-3 h-3 text-primary' />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TimestampSeparatorProps {
  timestamp: Date | string
}

export const TimestampSeparator = ({ timestamp }: TimestampSeparatorProps) => {
  const formatDate = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const isToday = date.toDateString() === today.toDateString()
      const isYesterday = date.toDateString() === yesterday.toDateString()

      if (isToday) {
        return 'Hôm nay'
      } else if (isYesterday) {
        return 'Hôm qua'
      } else {
        return new Intl.DateTimeFormat('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date)
      }
    } catch (e) {
      return ''
    }
  }

  return (
    <div className='flex items-center justify-center my-8 animate-in fade-in duration-500'>
      <div className='bg-muted/60 border border-border/50 rounded-full px-5 py-2 shadow-sm'>
        <span className='text-xs font-semibold text-muted-foreground/80'>
          {formatDate(timestamp)}
        </span>
      </div>
    </div>
  )
}
