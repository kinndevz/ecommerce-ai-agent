import { useState, useRef } from 'react'
import { Upload, X, Loader2, User, Camera, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar'
import { mediaAPI } from '@/api/media.api'

interface AvatarUploadSectionProps {
  avatarUrl?: string | null
  onChange: (url: string | null) => void
}

export function AvatarUploadSection({
  avatarUrl,
  onChange,
}: AvatarUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadAvatar = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large (max 5MB)')
      return
    }

    setUploading(true)

    try {
      const presignedResponse = await mediaAPI.getPresignedUrls({
        files: [{ filename: file.name, filesize: file.size }],
      })

      if (!presignedResponse.success || !presignedResponse.data?.[0]) {
        throw new Error('Failed to get upload URL')
      }

      const { presigned_url, url } = presignedResponse.data[0]

      const uploadResponse = await fetch(presigned_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadResponse.ok) throw new Error('Failed to upload avatar')

      onChange(url)
      toast.success('Avatar uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadAvatar(e.target.files)
  }

  const removeAvatar = async () => {
    if (!avatarUrl) return

    try {
      await mediaAPI.deleteFile(avatarUrl)
    } catch (error) {
      console.error('Failed to delete avatar from S3:', error)
    }

    onChange(null)
    toast.success('Avatar removed')
  }

  return (
    <div className='flex flex-col items-center gap-4'>
      <div
        className={cn(
          'relative group w-32 h-32 rounded-full overflow-hidden transition-all duration-200',
          !avatarUrl &&
            'border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 cursor-pointer',
          isDragging && 'border-primary bg-primary/10'
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          uploadAvatar(e.dataTransfer.files)
        }}
        onClick={() =>
          !avatarUrl && !uploading && fileInputRef.current?.click()
        }
      >
        {uploading ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20'>
            <Loader2 className='w-8 h-8 text-primary animate-spin' />
          </div>
        ) : avatarUrl ? (
          <>
            <Avatar className='w-full h-full'>
              <AvatarImage src={avatarUrl} className='object-cover' />
              <AvatarFallback className='bg-muted'>
                <User className='w-12 h-12 text-muted-foreground' />
              </AvatarFallback>
            </Avatar>

            {/* Hover Actions Overlay */}
            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10 backdrop-blur-[1px]'>
              <Button
                type='button'
                variant='secondary'
                size='icon'
                className='h-8 w-8 rounded-full shadow-md'
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                <Camera className='w-4 h-4' />
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='h-8 w-8 rounded-full shadow-md'
                onClick={(e) => {
                  e.stopPropagation()
                  removeAvatar()
                }}
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-muted-foreground gap-1'>
            <Upload className='w-8 h-8 opacity-50' />
            <span className='text-[10px] font-medium uppercase tracking-wider opacity-70'>
              Upload
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        disabled={uploading}
        className='hidden'
      />

      <div className='text-center space-y-1'>
        <p className='text-xs text-muted-foreground'>
          Allowed *.jpeg, *.jpg, *.png, *.webp
        </p>
        <p className='text-[10px] text-muted-foreground/60'>Max size of 5 MB</p>
      </div>
    </div>
  )
}
