import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Plus,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
  Wand2,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import {
  useAddProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '@/hooks/useProducts'
import { ColorPicker } from './ColorPicker'
import type { ProductDetail } from '@/api/product.api'
import { toast } from 'sonner'

const variantFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().min(0, 'Stock must be positive'),
  size: z.string().optional().nullable(),
  size_unit: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  shade_name: z.string().optional().nullable(),
})

type VariantFormData = z.infer<typeof variantFormSchema>

interface ProductVariantsTabProps {
  product: ProductDetail
}

export function ProductVariantsTab({ product }: ProductVariantsTabProps) {
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  )

  const addVariant = useAddProductVariant()
  const updateVariant = useUpdateProductVariant()
  const deleteVariant = useDeleteProductVariant()

  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      sale_price: null,
      stock_quantity: 0,
      size: null,
      size_unit: null,
      color: null,
      shade_name: null,
    },
  })

  // Generate SKU
  const generateSKU = () => {
    const prefix = 'VAR'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const sku = `${prefix}-${timestamp}-${random}`
    form.setValue('sku', sku, { shouldValidate: true })
    toast.success('SKU generated!')
  }

  const handleAddVariant = (data: VariantFormData) => {
    addVariant.mutate(
      { productId: product.id, variantData: data },
      {
        onSuccess: () => {
          setIsAdding(false)
          form.reset({
            name: '',
            sku: '',
            price: 0,
            sale_price: null,
            stock_quantity: 0,
            size: null,
            size_unit: null,
            color: null,
            shade_name: null,
          })
        },
      }
    )
  }

  const handleUpdateVariant = (data: VariantFormData) => {
    if (!editingVariantId) return
    updateVariant.mutate(
      {
        productId: product.id,
        variantId: editingVariantId,
        variantData: data,
      },
      {
        onSuccess: () => {
          setEditingVariantId(null)
          form.reset()
        },
      }
    )
  }

  const handleDeleteVariant = () => {
    if (!deletingVariantId) return
    deleteVariant.mutate(
      { productId: product.id, variantId: deletingVariantId },
      {
        onSuccess: () => {
          setDeletingVariantId(null)
        },
      }
    )
  }

  const startAdding = () => {
    setIsAdding(true)
    setEditingVariantId(null)
    form.reset({
      name: '',
      sku: '',
      price: 0,
      sale_price: null,
      stock_quantity: 0,
      size: null,
      size_unit: null,
      color: null,
      shade_name: null,
    })
  }

  const startEditing = (variant: any) => {
    setEditingVariantId(variant.id)
    setIsAdding(false)
    form.reset({
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      sale_price: variant.sale_price,
      stock_quantity: variant.stock_quantity,
      size: variant.size,
      size_unit: variant.size_unit,
      color: variant.color,
      shade_name: variant.shade_name,
    })
  }

  const cancelForm = () => {
    setEditingVariantId(null)
    setIsAdding(false)
    form.reset()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-lg font-semibold'>Product Variants</h2>
          <p className='text-sm text-muted-foreground'>
            Manage existing product variants
          </p>
        </div>
        {!isAdding && !editingVariantId && (
          <Button onClick={startAdding} className='gap-2'>
            <Plus className='w-4 h-4' />
            Add Variant
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className='mb-6 border-2 border-primary'>
          <CardHeader className='pb-3 bg-primary/5'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Badge variant='outline'>New</Badge>
                Add New Variant
              </CardTitle>
              <Button
                variant='ghost'
                size='icon'
                onClick={cancelForm}
                className='h-8 w-8'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='pt-4'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleAddVariant)}
                className='space-y-4'
              >
                {/* Form Fields - Same as Edit */}
                {/* Row 1: Name & SKU with Generator */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>
                          Variant Name *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder='e.g. Medium, 50ml' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sku'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>Variant SKU *</FormLabel>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input
                              placeholder='VAR-123456-ABC'
                              {...field}
                              className='flex-1'
                            />
                          </FormControl>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={generateSKU}
                            title='Generate SKU'
                            className='shrink-0'
                          >
                            <Wand2 className='w-4 h-4' />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Price & Sale Price */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>Price *</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type='number'
                              step='1000'
                              className='pr-14'
                              placeholder='299000'
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                            <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                              VND
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='sale_price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>Sale Price</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type='number'
                              step='1000'
                              className='pr-14'
                              placeholder='249000'
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => {
                                const val = e.target.value
                                field.onChange(val ? parseFloat(val) : null)
                              }}
                            />
                            <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                              VND
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Stock & Color */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='stock_quantity'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>
                          Stock Quantity *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='100'
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='color'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>Color</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g. White, Blue'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: Size, Unit & Shade */}
                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='size'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>Size</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='50'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='size_unit'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-sm'>Unit</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='ml, g, oz'
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='shade_name'
                    render={({ field }) => (
                      <FormItem>
                        <ColorPicker
                          value={field.value}
                          onChange={field.onChange}
                          label='Shade'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className='flex justify-end gap-3 pt-2'>
                  <Button type='button' variant='outline' onClick={cancelForm}>
                    Cancel
                  </Button>
                  <Button type='submit' disabled={addVariant.isPending}>
                    {addVariant.isPending ? (
                      <>
                        <Save className='w-4 h-4 mr-2 animate-spin' />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className='w-4 h-4 mr-2' />
                        Add Variant
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Variants List */}
      {!product.variants || product.variants.length === 0 ? (
        <div className='text-center py-12 border-2 border-dashed rounded-lg bg-muted/20'>
          <p className='text-sm font-medium text-muted-foreground mb-1'>
            No variants yet
          </p>
          <p className='text-xs text-muted-foreground mb-4'>
            Add your first variant to get started
          </p>
          {!isAdding && (
            <Button
              onClick={startAdding}
              variant='outline'
              size='sm'
              className='gap-2'
            >
              <Plus className='w-4 h-4' />
              Add First Variant
            </Button>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          {product.variants.map((variant, index) => {
            const isEditing = editingVariantId === variant.id

            // Show edit form
            if (isEditing) {
              return (
                <Card key={variant.id} className='border-2 border-primary'>
                  <CardHeader className='pb-3 bg-primary/5'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base flex items-center gap-2'>
                        <Badge variant='outline'>#{index + 1}</Badge>
                        Edit Variant
                      </CardTitle>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={cancelForm}
                        className='h-8 w-8'
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleUpdateVariant)}
                        className='space-y-4'
                      >
                        {/* Row 1: Name & SKU with Generator */}
                        <div className='grid grid-cols-2 gap-4'>
                          <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>
                                  Variant Name *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='e.g. Medium, 50ml'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='sku'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>
                                  Variant SKU *
                                </FormLabel>
                                <div className='flex gap-2'>
                                  <FormControl>
                                    <Input
                                      placeholder='VAR-123456-ABC'
                                      {...field}
                                      className='flex-1'
                                    />
                                  </FormControl>
                                  <Button
                                    type='button'
                                    variant='outline'
                                    size='icon'
                                    onClick={generateSKU}
                                    title='Generate SKU'
                                    className='shrink-0'
                                  >
                                    <Wand2 className='w-4 h-4' />
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Row 2: Price & Sale Price */}
                        <div className='grid grid-cols-2 gap-4'>
                          <FormField
                            control={form.control}
                            name='price'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>
                                  Price *
                                </FormLabel>
                                <FormControl>
                                  <div className='relative'>
                                    <Input
                                      type='number'
                                      step='1000'
                                      className='pr-14'
                                      placeholder='299000'
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                                      VND
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='sale_price'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>
                                  Sale Price
                                </FormLabel>
                                <FormControl>
                                  <div className='relative'>
                                    <Input
                                      type='number'
                                      step='1000'
                                      className='pr-14'
                                      placeholder='249000'
                                      {...field}
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        field.onChange(
                                          val ? parseFloat(val) : null
                                        )
                                      }}
                                    />
                                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                                      VND
                                    </span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Row 3: Stock & Color */}
                        <div className='grid grid-cols-2 gap-4'>
                          <FormField
                            control={form.control}
                            name='stock_quantity'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>
                                  Stock Quantity *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='100'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='color'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>Color</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='e.g. White, Blue'
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Row 4: Size, Unit & Shade */}
                        <div className='grid grid-cols-3 gap-4'>
                          <FormField
                            control={form.control}
                            name='size'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>Size</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='50'
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='size_unit'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-sm'>Unit</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='ml, g, oz'
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name='shade_name'
                            render={({ field }) => (
                              <FormItem>
                                <ColorPicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  label='Shade'
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className='flex justify-end gap-3 pt-2'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={cancelForm}
                          >
                            Cancel
                          </Button>
                          <Button
                            type='submit'
                            disabled={updateVariant.isPending}
                          >
                            {updateVariant.isPending ? (
                              <>
                                <Save className='w-4 h-4 mr-2 animate-spin' />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Save className='w-4 h-4 mr-2' />
                                Update Variant
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )
            }

            // Show variant card
            return (
              <Card key={variant.id}>
                <CardHeader className='pb-3 bg-muted/30'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Badge variant='outline'>#{index + 1}</Badge>
                      <h3 className='text-base font-semibold'>
                        {variant.name}
                      </h3>
                      {variant.is_available ? (
                        <Badge variant='default' className='gap-1'>
                          <CheckCircle className='w-3 h-3' />
                          Available
                        </Badge>
                      ) : (
                        <Badge variant='secondary' className='gap-1'>
                          <XCircle className='w-3 h-3' />
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => startEditing(variant)}
                        disabled={!!editingVariantId || isAdding}
                      >
                        <Wand2 className='w-4 h-4 mr-2' />
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => setDeletingVariantId(variant.id)}
                        disabled={!!editingVariantId || isAdding}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-4'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>SKU</p>
                      <p className='text-sm font-mono font-medium'>
                        {variant.sku}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Price
                      </p>
                      <p className='text-sm font-semibold text-emerald-600'>
                        {formatCurrency(variant.price)}
                      </p>
                      {variant.sale_price && (
                        <p className='text-xs line-through text-muted-foreground'>
                          {formatCurrency(variant.sale_price)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Stock
                      </p>
                      <p className='text-sm font-medium'>
                        {variant.stock_quantity} units
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Size/Color
                      </p>
                      <div className='flex items-center gap-2'>
                        {variant.size && variant.size_unit && (
                          <Badge variant='secondary'>
                            {variant.size}
                            {variant.size_unit}
                          </Badge>
                        )}
                        {variant.shade_name && (
                          <div
                            className='w-5 h-5 rounded-full border'
                            style={{ backgroundColor: variant.shade_name }}
                            title={variant.shade_name}
                          />
                        )}
                        {variant.color && !variant.shade_name && (
                          <Badge variant='outline'>{variant.color}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingVariantId}
        onOpenChange={(open) => !open && setDeletingVariantId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this variant? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVariant}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteVariant.isPending ? (
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
