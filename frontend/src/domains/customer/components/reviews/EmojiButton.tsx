import { useState } from 'react'
import { Smile } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react'

interface EmojiButtonProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiButton({ onEmojiSelect }: EmojiButtonProps) {
  const [open, setOpen] = useState(false)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2 hover:bg-primary/10'
        >
          <Smile className='h-4 w-4' />
          <span className='hidden sm:inline'>Thêm emoji</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 border-0 shadow-2xl'
        align='end'
        sideOffset={8}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={Theme.AUTO}
          searchPlaceholder='Tìm emoji...'
          width={350}
          height={400}
          previewConfig={{
            showPreview: false,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
