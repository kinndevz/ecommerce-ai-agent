import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Plus,
  Trash2,
  Edit,
  Star,
  Image as ImageIcon,
  Loader2,
  Save,
  X,
  Upload,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Badge } from '@/shared/components/ui/badge'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/lib/utils'
import {
  useAddProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
} from '@/hooks/useProducts'
import { mediaAPI } from '@/api/media.api'
import type { ProductDetail } from '@/api/product.api'
import { toast } from 'sonner'

const imageFormSchema = z.object({
  image_url: z.string().url('Must be a valid URL'),
  alt_text: z.string().optional().nullable(),
  is_primary: z.boolean(),
  display_order: z.number().min(0),
})

type ImageFormData = z.infer<typeof imageFormSchema>

interface ProductImagesTabProps {
  product: ProductDetail
}

export function ProductImagesTab({ product }: ProductImagesTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<any>(null)
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addImage = useAddProductImage()
  const updateImage = useUpdateProductImage()
  const deleteImage = useDeleteProductImage()

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageFormSchema),
    defaultValues: {
      image_url: '',
      alt_text: null,
      is_primary: false,
      display_order: 0,
    },
  })

  // Upload file using presigned URL
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setUploadedImageUrl(null)

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await mediaAPI.getPresignedUrls({
        files: [
          {
            filename: file.name,
            filesize: file.size,
          },
        ],
      })

      if (!presignedResponse.success || !presignedResponse.data) {
        throw new Error('Failed to get presigned URL')
      }

      const { presigned_url, url } = presignedResponse.data[0]

      // Step 2: Upload to S3
      const uploadResponse = await fetch(presigned_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3')
      }

      // Step 3: Set uploaded URL and preview
      setUploadedImageUrl(url)
      form.setValue('image_url', url)
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleAddImage = (data: ImageFormData) => {
    addImage.mutate(
      { productId: product.id, imageData: data },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false)
          form.reset()
        },
      }
    )
  }

  const handleEditImage = (data: ImageFormData) => {
    if (!editingImage) return
    updateImage.mutate(
      {
        productId: product.id,
        imageId: editingImage.id,
        imageData: data,
      },
      {
        onSuccess: () => {
          setEditingImage(null)
          form.reset()
        },
      }
    )
  }

  const handleDeleteImage = () => {
    if (!deletingImageId) return
    deleteImage.mutate(
      { productId: product.id, imageId: deletingImageId },
      {
        onSuccess: () => {
          setDeletingImageId(null)
        },
      }
    )
  }

  const openEditDialog = (image: any) => {
    setEditingImage(image)
    form.reset({
      image_url: image.image_url,
      alt_text: image.alt_text,
      is_primary: image.is_primary,
      display_order: image.display_order,
    })
  }

  const openAddDialog = () => {
    setEditingImage(null)
    setUploadedImageUrl(null)
    form.reset({
      image_url: '',
      alt_text: null,
      is_primary: false,
      display_order: product.images?.length || 0,
    })
    setIsAddDialogOpen(true)
  }

  const sortedImages = [...(product.images || [])].sort(
    (a, b) => a.display_order - b.display_order
  )

  return (
    <>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-lg font-semibold'>Product Images</h2>
          <p className='text-sm text-muted-foreground'>
            Manage product images and set primary image
          </p>
        </div>
        <Button onClick={openAddDialog} className='gap-2'>
          <Plus className='w-4 h-4' />
          Add Image
        </Button>
      </div>

      {/* Images Grid */}
      {sortedImages.length === 0 ? (
        <div className='text-center py-12 border-2 border-dashed rounded-lg bg-muted/20'>
          <ImageIcon className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
          <p className='text-sm font-medium text-muted-foreground mb-1'>
            No images added yet
          </p>
          <p className='text-xs text-muted-foreground mb-4'>
            Add your first product image to get started
          </p>
          <Button
            onClick={openAddDialog}
            variant='outline'
            size='sm'
            className='gap-2'
          >
            <Plus className='w-4 h-4' />
            Add First Image
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {sortedImages.map((image) => (
            <Card
              key={image.id}
              className='group overflow-hidden hover:shadow-lg transition-all border-0'
            >
              <div className='relative aspect-square overflow-hidden'>
                <img
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                  className='w-full h-full object-cover transition-transform group-hover:scale-105'
                />

                {/* Dark overlay on hover for better button visibility */}
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors' />

                {/* Primary Badge - Always visible */}
                {image.is_primary && (
                  <Badge className='absolute top-3 left-3 gap-1 shadow-lg z-10'>
                    <Star className='w-3 h-3 fill-current' />
                    Primary
                  </Badge>
                )}

                {/* Action Buttons - Show on hover */}
                <div className='absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
                  <Button
                    size='icon'
                    className='h-9 w-9 bg-white hover:bg-white/90 text-gray-900 shadow-lg'
                    onClick={() => openEditDialog(image)}
                  >
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='destructive'
                    className='h-9 w-9 shadow-lg'
                    onClick={() => setDeletingImageId(image.id)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>

                {/* Bottom Info Overlay */}
                <div className='absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 via-black/50 to-transparent p-4 pt-8'>
                  <p className='text-sm font-medium text-white truncate mb-1'>
                    {image.alt_text || (
                      <span className='italic opacity-70'>No description</span>
                    )}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-white/70'>
                      Display order: {image.display_order}
                    </span>
                    {image.is_primary && (
                      <Badge
                        variant='secondary'
                        className='text-xs gap-1 bg-white/20 text-white border-0'
                      >
                        <Star className='w-3 h-3 fill-white' />
                        Main
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingImage}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setEditingImage(null)
            form.reset()
          }
        }}
      >
        <DialogContent className='sm:max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingImage ? 'Edit Image' : 'Add New Image'}
            </DialogTitle>
            <DialogDescription>
              {editingImage
                ? 'Update image information'
                : 'Add a new image to this product'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                editingImage ? handleEditImage : handleAddImage
              )}
              className='space-y-4'
            >
              <div className='grid grid-cols-2 gap-4'>
                {/* LEFT: Upload Section */}
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='image_url'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Image *</FormLabel>
                        <FormControl>
                          <div>
                            {/* Upload Button */}
                            <div
                              onClick={() =>
                                !uploading && fileInputRef.current?.click()
                              }
                              className={cn(
                                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
                                uploading && 'opacity-50 cursor-not-allowed',
                                'hover:border-primary hover:bg-muted/50'
                              )}
                            >
                              {uploading ? (
                                <>
                                  <Loader2 className='w-10 h-10 mx-auto text-primary mb-3 animate-spin' />
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Uploading to S3...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Upload className='w-10 h-10 mx-auto text-muted-foreground mb-3' />
                                  <p className='text-sm font-medium mb-1'>
                                    Click to upload
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    PNG, JPG up to 5MB
                                  </p>
                                </>
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
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='alt_text'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alt Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Describe the image'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          For accessibility
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='display_order'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          Lower numbers first
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='is_primary'
                    render={({ field }) => (
                      <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-sm font-medium'>
                            Primary Image
                          </FormLabel>
                          <FormDescription className='text-xs'>
                            Set as main image
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* RIGHT: Preview */}
                <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Preview</Label>
                  <div className='border-2 border-dashed rounded-lg p-4 h-100 flex items-center justify-center bg-muted/20'>
                    {uploadedImageUrl || editingImage?.image_url ? (
                      <div className='relative w-full h-full'>
                        <img
                          src={uploadedImageUrl || editingImage?.image_url}
                          alt='Preview'
                          className='w-full h-full object-contain rounded'
                        />
                        {form.watch('is_primary') && (
                          <Badge className='absolute top-2 left-2 gap-1'>
                            <Star className='w-3 h-3 fill-current' />
                            Primary
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className='text-center'>
                        <ImageIcon className='w-16 h-16 mx-auto text-muted-foreground/40 mb-2' />
                        <p className='text-sm text-muted-foreground'>
                          No image uploaded
                        </p>
                        <p className='text-xs text-muted-foreground/60'>
                          Upload an image to see preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingImage(null)
                    setUploadedImageUrl(null)
                    form.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={
                    addImage.isPending ||
                    updateImage.isPending ||
                    uploading ||
                    !form.watch('image_url')
                  }
                >
                  {addImage.isPending || updateImage.isPending ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4 mr-2' />
                      {editingImage ? 'Update' : 'Add'} Image
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingImageId}
        onOpenChange={(open) => !open && setDeletingImageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteImage.isPending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
