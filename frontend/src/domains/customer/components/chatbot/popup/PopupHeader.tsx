import { X, Plus } from 'lucide-react'
import { Avatar, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { useChatStore } from '@/stores/useChatStore'
import { COMPANY_LOGO_SRC } from '../ChatMessage'

export function PopupHeader() {
  const { streamingStatus, currentToolCall, setIsOpen, startNewConversation } =
    useChatStore()

  const statusText = currentToolCall || streamingStatus || 'Online'

  return (
    <div className='flex items-center gap-3 px-4 py-3 border-b border-border/40 rounded-t-2xl shrink-0 bg-background'>
      <div className='relative'>
        <Avatar className='w-8 h-8'>
          <AvatarImage src={COMPANY_LOGO_SRC} className='object-cover' />
        </Avatar>
        <span className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background' />
      </div>

      <div className='flex-1 min-w-0'>
        <p className='text-sm font-semibold leading-none text-foreground'>
          Beauty AI
        </p>
        <p className='text-xs text-muted-foreground mt-0.5 truncate'>
          {statusText}
        </p>
      </div>

      <div className='flex items-center gap-0.5'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-muted-foreground hover:text-foreground'
          onClick={startNewConversation}
          title='New conversation'
        >
          <Plus className='w-3.5 h-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-muted-foreground hover:text-foreground'
          onClick={() => setIsOpen(false)}
        >
          <X className='w-3.5 h-3.5' />
        </Button>
      </div>
    </div>
  )
}
