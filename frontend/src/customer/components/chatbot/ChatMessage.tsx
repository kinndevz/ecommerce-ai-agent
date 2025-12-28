import { Check, CheckCheck } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { cn } from '@/lib/utils'
import { AiFillTwitch } from 'react-icons/ai'
import { FaUserGraduate } from 'react-icons/fa'

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

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom duration-300',
        isUser && 'flex-row-reverse'
      )}
    >
      {showAvatar && (
        <Avatar className='w-8 h-8 shrink-0'>
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
          'flex flex-col gap-1 max-w-[75%]',
          isUser && 'items-end',
          !showAvatar && (isUser ? 'mr-11' : 'ml-11')
        )}
      >
        <div
          className={cn(
            'relative px-4 py-2.5 rounded-2xl shadow-sm',
            'transition-all duration-200',
            isUser &&
              cn(
                'bg-primary text-primary-foreground',
                'rounded-tr-sm',
                'hover:shadow-md'
              ),
            isAI &&
              cn(
                'bg-muted border border-border',
                'rounded-tl-sm',
                'hover:bg-muted/80'
              )
          )}
        >
          <p
            className={cn(
              'text-sm leading-relaxed whitespace-pre-wrap wrap-break-word',
              isUser ? 'text-primary-foreground' : 'text-foreground'
            )}
          >
            {message.content}
          </p>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 px-2',
            isUser && 'flex-row-reverse'
          )}
        >
          <span className='text-[10px] text-muted-foreground'>
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
  }

  return (
    <div className='flex items-center justify-center my-6 animate-in fade-in duration-500'>
      <div className='bg-muted/50 border border-border rounded-full px-4 py-1.5 shadow-sm'>
        <span className='text-xs font-medium text-muted-foreground'>
          {formatDate(timestamp)}
        </span>
      </div>
    </div>
  )
}
