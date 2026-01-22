import { useRef, useEffect, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Undo,
  Redo,
  Quote,
  Minus,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Separator } from '@/shared/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { mediaAPI } from '@/api/media.api'

interface ProfessionalEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

export function ProfessionalEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = 200,
}: ProfessionalEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formatState, setFormatState] = useState('p')
  const savedSelection = useRef<Range | null>(null)

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedSelection.current = sel.getRangeAt(0)
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedSelection.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelection.current)
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleFormatChange = (val: string) => {
    setFormatState(val)
    execCommand('formatBlock', val)
  }

  const handleInput = () => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File is not an image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)')
      return
    }

    setIsUploading(true)

    try {
      const res = await mediaAPI.getPresignedUrl({
        filename: file.name,
        filesize: file.size,
      })

      if (!res.success || !res.data) throw new Error('Failed to get URL')

      await fetch(res.data.presigned_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      restoreSelection()
      if (editorRef.current) editorRef.current.focus()
      document.execCommand('insertImage', false, res.data.url)
      handleInput()
      toast.success('Image inserted')
    } catch (error) {
      console.error(error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (editorRef.current) {
      const isActive = document.activeElement === editorRef.current
      const currentHTML = editorRef.current.innerHTML
      if (value !== currentHTML && !isActive) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value])

  const toolbarGroups = [
    {
      buttons: [
        { icon: Undo, command: 'undo', label: 'Undo' },
        { icon: Redo, command: 'redo', label: 'Redo' },
      ],
    },
    {
      buttons: [
        { icon: Bold, command: 'bold', label: 'Bold' },
        { icon: Italic, command: 'italic', label: 'Italic' },
        { icon: Underline, command: 'underline', label: 'Underline' },
        {
          icon: Strikethrough,
          command: 'strikeThrough',
          label: 'Strikethrough',
        },
      ],
    },
    {
      buttons: [
        { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
        {
          icon: ListOrdered,
          command: 'insertOrderedList',
          label: 'Numbered List',
        },
      ],
    },
    {
      buttons: [
        { icon: Link, command: 'createLink', label: 'Link' },
        {
          icon: Quote,
          command: 'formatBlock',
          value: 'blockquote',
          label: 'Quote',
        },
        {
          icon: isUploading ? Loader2 : ImageIcon,
          command: 'image',
          label: 'Image',
          custom: true,
        },
        { icon: Minus, command: 'insertHorizontalRule', label: 'Line' },
      ],
    },
    {
      buttons: [
        { icon: AlignLeft, command: 'justifyLeft', label: 'Left' },
        { icon: AlignCenter, command: 'justifyCenter', label: 'Center' },
        { icon: AlignRight, command: 'justifyRight', label: 'Right' },
      ],
    },
  ]

  return (
    <div
      className={cn(
        'rounded-md overflow-hidden transition-colors bg-background border',
        isFocused ? 'border-foreground/30 shadow-sm' : 'border-input'
      )}
    >
      <div className='flex items-center gap-1 p-1.5 bg-muted/40 border-b border-border flex-wrap'>
        <Select value={formatState} onValueChange={handleFormatChange}>
          <SelectTrigger className='w-28 h-8 text-xs bg-background border-input/50 focus:ring-0 focus:ring-offset-0'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='p'>Paragraph</SelectItem>
            <SelectItem value='h2'>Heading 2</SelectItem>
            <SelectItem value='h3'>Heading 3</SelectItem>
            <SelectItem value='pre'>Code Block</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation='vertical' className='h-5 mx-1' />

        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className='flex items-center gap-0.5'>
            {group.buttons.map((button, buttonIndex) => {
              const Icon = button.icon
              return (
                <button
                  key={buttonIndex}
                  type='button'
                  disabled={button.custom && isUploading}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (button.command === 'image') {
                      saveSelection()
                      fileInputRef.current?.click()
                    } else if (button.command === 'createLink') {
                      const url = prompt('Enter URL:')
                      if (url) execCommand(button.command, url)
                    } else if (button.value) {
                      execCommand(button.command, button.value)
                    } else {
                      execCommand(button.command)
                    }
                  }}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors',
                    button.custom &&
                      isUploading &&
                      'animate-spin opacity-50 cursor-not-allowed'
                  )}
                  title={button.label}
                >
                  <Icon className='w-4 h-4' />
                </button>
              )
            })}
            {groupIndex < toolbarGroups.length - 1 && (
              <Separator orientation='vertical' className='h-5 mx-1' />
            )}
          </div>
        ))}
      </div>

      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='image/*'
        onChange={handleImageUpload}
      />

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertText', false, text)
        }}
        className={cn(
          'p-4 outline-none overflow-y-auto max-w-none text-sm',
          '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3',
          '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3',
          '[&_li]:marker:text-muted-foreground [&_li]:my-1',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5',
          '[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4',
          '[&_img]:rounded-md [&_img]:border [&_img]:my-4 [&_img]:max-w-full',
          '[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-4',
          '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:pointer-events-none'
        )}
        style={{ minHeight: `${minHeight}px` }}
        data-placeholder={placeholder}
      />

      <div className='px-3 py-1 bg-muted/20 border-t border-border flex justify-between text-[10px] text-muted-foreground'>
        <span>{isUploading ? 'Uploading...' : 'Rich Text'}</span>
        <span>{value?.length || 0} chars</span>
      </div>
    </div>
  )
}
