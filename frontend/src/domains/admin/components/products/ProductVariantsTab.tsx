import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Plus,
  Trash2,
  Save,
  Wand2,
  X,
  Loader2,
  Edit,
  Copy,
  MoreHorizontal,
  Box,
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
import { Separator } from '@/shared/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import {
  useAddProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
} from '@/hooks/useProducts'
import { ColorPicker } from './ColorPicker'
import type { ProductDetail } from '@/api/product.api'
import { toast } from 'sonner'

// --- SCHEMA & TYPE (Giữ nguyên) ---
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

  const VariantForm = ({
    onSubmit,
    isPending,
    mode,
  }: {
    onSubmit: (data: VariantFormData) => void
    isPending: boolean
    mode: 'create' | 'edit'
  }) => (
    <Card className='overflow-hidden border-2 border-primary/20 shadow-sm transition-all'>
      <CardHeader className='pb-4 border-b bg-muted/5'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <div
              className={`p-1.5 rounded-md ${
                mode === 'create'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              {mode === 'create' ? (
                <Plus className='w-4 h-4' />
              ) : (
                <Edit className='w-4 h-4' />
              )}
            </div>
            {mode === 'create' ? 'Add New Variant' : 'Edit Variant Details'}
          </CardTitle>
          <Button
            variant='ghost'
            size='icon'
            onClick={cancelForm}
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
          >
            <X className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='pt-6 bg-card'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Group 1: Identity */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Variant Name <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Medium Size, Red Color'
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
                    <FormLabel>
                      SKU <span className='text-destructive'>*</span>
                    </FormLabel>
                    <div className='flex gap-2'>
                      <FormControl>
                        <Input
                          placeholder='VAR-...'
                          {...field}
                          className='font-mono'
                        />
                      </FormControl>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              onClick={generateSKU}
                            >
                              <Wand2 className='w-4 h-4 text-primary' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Generate random SKU</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className='bg-border/60' />

            {/* Group 2: Pricing & Stock */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Price <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type='number'
                          {...field}
                          className='pl-3 pr-12 font-medium'
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
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
                    <FormLabel>Sale Price</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type='number'
                          {...field}
                          value={field.value || ''}
                          className='pl-3 pr-12 font-medium'
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(val ? parseFloat(val) : null)
                          }}
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium'>
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
                name='stock_quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Stock <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
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
            </div>

            <Separator className='bg-border/60' />

            {/* Group 3: Attributes */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='md:col-span-2 grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='size'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. 50'
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
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. ml'
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='color'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Red'
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
                        label='Shade (Hex)'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-3 pt-2'>
              <Button type='button' variant='outline' onClick={cancelForm}>
                Cancel
              </Button>
              <Button type='submit' disabled={isPending} className='min-w-30'>
                {isPending ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    {mode === 'create' ? 'Create Variant' : 'Save Changes'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )

  // --- RENDER ---
  return (
    <div className='space-y-6'>
      {/* Header Section */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold tracking-tight'>
            Product Variants
          </h2>
          <p className='text-sm text-muted-foreground'>
            Manage stock, pricing, and attributes for this product.
          </p>
        </div>
        {!isAdding && !editingVariantId && (
          <Button onClick={startAdding} className='gap-2 shadow-sm'>
            <Plus className='w-4 h-4' />
            Add Variant
          </Button>
        )}
      </div>

      {/* Add Form Area */}
      {isAdding && (
        <div className='animate-in fade-in slide-in-from-top-4 duration-300'>
          <VariantForm
            onSubmit={handleAddVariant}
            isPending={addVariant.isPending}
            mode='create'
          />
        </div>
      )}

      {/* Variants List */}
      <div className='grid gap-4'>
        {!product.variants || product.variants.length === 0
          ? !isAdding && (
              <div className='flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/5 text-center'>
                <div className='p-4 rounded-full bg-muted/30 mb-4'>
                  <Box className='w-8 h-8 text-muted-foreground' />
                </div>
                <h3 className='text-base font-medium mb-1'>
                  No variants created
                </h3>
                <p className='text-sm text-muted-foreground max-w-sm mb-6'>
                  This product has no variants yet. Add variants to manage
                  different sizes or colors.
                </p>
                <Button
                  onClick={startAdding}
                  variant='outline'
                  className='gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Create First Variant
                </Button>
              </div>
            )
          : product.variants.map((variant, index) => {
              // Render Edit Form
              if (editingVariantId === variant.id) {
                return (
                  <div
                    key={variant.id}
                    className='animate-in fade-in zoom-in-95 duration-200'
                  >
                    <VariantForm
                      onSubmit={handleUpdateVariant}
                      isPending={updateVariant.isPending}
                      mode='edit'
                    />
                  </div>
                )
              }

              // Render Display Card (Redesigned UI)
              const isAvailable = variant.stock_quantity > 0
              return (
                <Card
                  key={variant.id}
                  className='group overflow-hidden border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md'
                >
                  <CardContent className='p-0'>
                    {/* --- HEADER --- */}
                    <div className='flex items-start justify-between p-5 pb-4'>
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-3'>
                          <h4 className='font-semibold text-lg text-foreground'>
                            {variant.name || `Variant #${index + 1}`}
                          </h4>
                          <Badge
                            variant={isAvailable ? 'default' : 'secondary'}
                            className={`
                            px-2.5 py-0.5 text-xs font-medium border-0
                            ${
                              isAvailable
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-600/20'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 ring-1 ring-zinc-500/20'
                            }
                          `}
                          >
                            {isAvailable ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground font-mono flex items-center gap-1.5'>
                          <span className='opacity-70'>ID:</span> {variant.id}
                        </p>
                      </div>

                      <div className='flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => startEditing(variant)}
                                className='h-8 w-8 text-muted-foreground hover:text-primary'
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Variant</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => setDeletingVariantId(variant.id)}
                                className='h-8 w-8 text-muted-foreground hover:text-destructive'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Variant</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <Separator />

                    {/* --- DETAILS GRID --- */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-6 p-5 bg-muted/5'>
                      {/* SKU */}
                      <div className='space-y-1'>
                        <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider'>
                          SKU
                        </span>
                        <div className='flex items-center gap-2 font-mono text-sm font-medium text-foreground'>
                          {variant.sku}
                          <Copy className='w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground transition-colors' />
                        </div>
                      </div>

                      {/* Price */}
                      <div className='space-y-1'>
                        <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider'>
                          Price
                        </span>
                        <div className='flex flex-col'>
                          <span className='font-bold text-emerald-600 dark:text-emerald-400 text-base'>
                            {formatCurrency(
                              variant.sale_price || variant.price
                            )}
                          </span>
                          {variant.sale_price &&
                            variant.sale_price < variant.price && (
                              <span className='text-xs text-muted-foreground line-through decoration-muted-foreground/60'>
                                {formatCurrency(variant.price)}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Stock */}
                      <div className='space-y-1'>
                        <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider'>
                          Stock
                        </span>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`font-medium ${
                              variant.stock_quantity < 10
                                ? 'text-orange-600'
                                : 'text-foreground'
                            }`}
                          >
                            {variant.stock_quantity}{' '}
                            <span className='text-xs text-muted-foreground font-normal'>
                              units
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Options (Size/Color) */}
                      <div className='space-y-1'>
                        <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider'>
                          Properties
                        </span>
                        <div className='flex items-center flex-wrap gap-2'>
                          {/* Size Badge */}
                          {(variant.size || variant.size_unit) && (
                            <Badge
                              variant='outline'
                              className='bg-background border-border/60 text-xs font-normal'
                            >
                              {variant.size}
                              {variant.size_unit}
                            </Badge>
                          )}

                          {/* Shade Circle */}
                          {variant.shade_name && (
                            <div
                              className='h-5 w-5 rounded-full border border-border shadow-sm ring-1 ring-background'
                              style={{ backgroundColor: variant.shade_name }}
                              title={`Shade: ${variant.shade_name}`}
                            />
                          )}

                          {/* Color Name */}
                          {variant.color && !variant.shade_name && (
                            <Badge
                              variant='outline'
                              className='bg-background border-border/60 text-xs font-normal'
                            >
                              {variant.color}
                            </Badge>
                          )}

                          {!variant.size &&
                            !variant.color &&
                            !variant.shade_name && (
                              <span className='text-sm text-muted-foreground'>
                                -
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

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
    </div>
  )
}
