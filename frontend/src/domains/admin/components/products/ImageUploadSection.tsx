import { useState, useRef } from 'react'
import { Upload, X, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { mediaAPI } from '@/api/media.api'
import type { ProductImageInput } from '@/api/product.api'

interface ImageUploadSectionProps {
  images: ProductImageInput[]
  onChange: (images: ProductImageInput[]) => void
}

export function ImageUploadSection({
  images,
  onChange,
}: ImageUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload files using presigned URLs
  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const maxImages = 10
    const remaining = maxImages - images.length
    if (remaining <= 0) {
      toast.error('Maximum 10 images allowed')
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)

    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return
      }
    }

    setUploading(true)

    try {
      // Step 1: Get presigned URLs for all files
      const fileConfigs = filesToUpload.map((file) => ({
        filename: file.name,
        filesize: file.size,
      }))

      const presignedResponse = await mediaAPI.getPresignedUrls({
        files: fileConfigs,
      })

      if (!presignedResponse.success || !presignedResponse.data) {
        throw new Error('Failed to get presigned URLs')
      }

      // Step 2: Upload each file to S3 using presigned URL
      const uploadPromises = presignedResponse.data.map(
        async (presignedData, index) => {
          const file = filesToUpload[index]
          const { presigned_url, url } = presignedData

          try {
            // Upload to S3
            const uploadResponse = await fetch(presigned_url, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            })

            if (!uploadResponse.ok) {
              throw new Error(`Failed to upload ${file.name}`)
            }

            // Update progress
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 100,
            }))

            return {
              image_url: url,
              alt_text: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              is_primary: images.length === 0 && index === 0,
              display_order: images.length + index,
            }
          } catch (error) {
            console.error(`Upload error for ${file.name}:`, error)
            throw error
          }
        }
      )

      // Wait for all uploads to complete
      const uploadedImages = await Promise.all(uploadPromises)

      // Step 3: Update form with new images
      onChange([...images, ...uploadedImages])
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`)

      // Clear progress
      setUploadProgress({})
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.message || 'Failed to upload images')
      setUploadProgress({})
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]

    // Optional: Delete from S3
    try {
      await mediaAPI.deleteFile(imageToRemove.image_url)
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
    }

    const newImages = images.filter((_, i) => i !== index)

    // Reset is_primary if removing primary image
    if (imageToRemove.is_primary && newImages.length > 0) {
      newImages[0].is_primary = true
    }

    // Update display_order
    newImages.forEach((img, i) => {
      img.display_order = i
    })

    onChange(newImages)
  }

  const setPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }))
    onChange(newImages)
  }

  const updateAltText = (index: number, alt: string) => {
    const newImages = [...images]
    newImages[index].alt_text = alt
    onChange(newImages)
  }

  return (
    <div className='space-y-4'>
      {/* Upload Zone */}
      {images.length < 10 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
            uploading && 'opacity-50 cursor-not-allowed',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className='w-12 h-12 mx-auto text-primary mb-4 animate-spin' />
              <p className='text-sm font-medium text-muted-foreground mb-2'>
                Uploading to AWS S3...
              </p>
              {Object.entries(uploadProgress).length > 0 && (
                <div className='space-y-1'>
                  {Object.entries(uploadProgress).map(
                    ([filename, progress]) => (
                      <div
                        key={filename}
                        className='flex items-center gap-2 justify-center'
                      >
                        <p className='text-xs text-muted-foreground truncate max-w-50'>
                          {filename}
                        </p>
                        <span className='text-xs text-primary font-medium'>
                          {progress}%
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
              <p className='text-sm font-medium mb-1'>
                Click to upload or drag and drop
              </p>
              <p className='text-xs text-muted-foreground'>
                PNG, JPG, WEBP up to 5MB (max 10 images)
              </p>
              <p className='text-xs text-muted-foreground/60 mt-2'>
                Using AWS S3 presigned URLs
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        multiple
        onChange={handleFileSelect}
        disabled={uploading}
        className='hidden'
      />

      {/* Image List */}
      {images.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium'>
              Uploaded Images ({images.length}/10)
            </Label>
            {images.some((img) => img.is_primary) && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Star className='w-3 h-3 fill-primary text-primary' />
                Primary image set
              </div>
            )}
          </div>

          <div className='space-y-3'>
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                  image.is_primary
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                {/* Preview */}
                <div className='relative w-20 h-20 shrink-0'>
                  <img
                    src={image.image_url}
                    alt={image.alt_text || `Image ${index + 1}`}
                    className='w-full h-full object-cover rounded-lg'
                  />
                  {image.is_primary && (
                    <div className='absolute -top-2 -right-2'>
                      <div className='bg-primary text-primary-foreground rounded-full p-1'>
                        <Star className='w-3 h-3 fill-current' />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Label
                      htmlFor={`alt-${index}`}
                      className='text-xs text-muted-foreground'
                    >
                      Alt Text
                    </Label>
                    {image.is_primary && (
                      <span className='text-xs font-medium text-primary'>
                        Primary Image
                      </span>
                    )}
                  </div>
                  <Input
                    id={`alt-${index}`}
                    value={image.alt_text || ''}
                    onChange={(e) => updateAltText(index, e.target.value)}
                    placeholder='Describe this image...'
                    className='text-sm'
                  />
                  <p
                    className='text-xs text-muted-foreground truncate max-w-full break-all'
                    title={image.image_url}
                  >
                    {image.image_url.length > 60
                      ? `${image.image_url.substring(
                          0,
                          30
                        )}...${image.image_url.substring(
                          image.image_url.length - 20
                        )}`
                      : image.image_url}
                  </p>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2'>
                  {!image.is_primary && (
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => setPrimary(index)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    type='button'
                    size='icon'
                    variant='ghost'
                    onClick={() => removeImage(index)}
                    className='text-destructive hover:text-destructive hover:bg-destructive/10'
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className='text-center p-6 bg-muted/50 rounded-lg border border-dashed'>
          <p className='text-sm text-muted-foreground'>
            No images uploaded yet
          </p>
          <p className='text-xs text-muted-foreground/80 mt-1'>
            Add at least one product image
          </p>
        </div>
      )}
    </div>
  )
}
