import { useState, useRef } from 'react'
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  Camera,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { mediaAPI } from '@/api/media.api'

interface CategoryImageUploadSectionProps {
  imageUrl?: string | null
  onChange: (url: string | null) => void
}

export function CategoryImageUploadSection({
  imageUrl,
  onChange,
}: CategoryImageUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (files: FileList | null) => {
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

      if (!uploadResponse.ok) throw new Error('Failed to upload image')

      onChange(url)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadImage(e.target.files)
  }

  const removeImage = async () => {
    if (!imageUrl) return

    try {
      await mediaAPI.deleteFile(imageUrl)
    } catch (error) {
      console.error('Failed to delete image from S3:', error)
    }

    onChange(null)
    toast.success('Image removed')
  }

  return (
    <div className='flex flex-col items-center gap-4'>
      <div
        className={cn(
          'relative group w-full aspect-video max-w-sm rounded-lg overflow-hidden transition-all duration-200 bg-muted/30',
          !imageUrl &&
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
          uploadImage(e.dataTransfer.files)
        }}
        onClick={() => !imageUrl && !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20'>
            <Loader2 className='w-8 h-8 text-primary animate-spin' />
          </div>
        ) : imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt='Category image'
              className='w-full h-full object-cover'
            />

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
                  removeImage()
                }}
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-muted-foreground gap-2'>
            <Upload className='w-10 h-10 opacity-50' />
            <span className='text-xs font-medium uppercase tracking-wider opacity-70'>
              Upload Image
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
