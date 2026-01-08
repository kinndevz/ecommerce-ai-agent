import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Plus,
  Trash2,
  Edit,
  Star,
  StarOff,
  Image as ImageIcon,
  Loader2,
  Save,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
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
import {
  useAddProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
} from '@/hooks/useProducts'
import type { ProductDetail } from '@/api/product.api'

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

  const handleDeleteImage = (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    deleteImage.mutate({ productId: product.id, imageId })
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
            <Card key={image.id} className='overflow-hidden'>
              <div className='relative aspect-square bg-muted'>
                <img
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                  className='w-full h-full object-cover'
                />
                {image.is_primary && (
                  <Badge
                    className='absolute top-2 left-2 gap-1'
                    variant='default'
                  >
                    <Star className='w-3 h-3 fill-current' />
                    Primary
                  </Badge>
                )}
                <div className='absolute top-2 right-2 flex gap-2'>
                  <Button
                    size='icon'
                    variant='secondary'
                    className='h-8 w-8 bg-background/80 backdrop-blur'
                    onClick={() => openEditDialog(image)}
                  >
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='destructive'
                    className='h-8 w-8 bg-background/80 backdrop-blur hover:bg-destructive hover:text-destructive-foreground'
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </div>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {image.alt_text || 'No alt text'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Order: {image.display_order}
                    </p>
                  </div>
                </div>
              </CardContent>
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
        <DialogContent className='sm:max-w-125'>
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
              <FormField
                control={form.control}
                name='image_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/image.jpg'
                        {...field}
                      />
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
                    <FormDescription>
                      Alternative text for accessibility
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
                    <FormDescription>
                      Lower numbers appear first
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
                        Set as the main product image
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

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingImage(null)
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
                    deleteImage.isPending
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
    </>
  )
}
