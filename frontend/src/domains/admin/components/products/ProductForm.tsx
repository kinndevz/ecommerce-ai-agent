import { useEffect, useMemo } from 'react'
import { type UseFormReturn, useFieldArray } from 'react-hook-form'
import {
  Plus,
  Trash2,
  RefreshCw,
  Wand2,
  Package,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
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
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { SkinType, SkinConcern, ProductBenefit } from '@/api/services/enums'
import { ProfessionalEditor } from './RichTextEditor'
import { ImageUploadSection } from './ImageUploadSection'
import { ColorPicker } from './ColorPicker'
import { useTags } from '@/hooks/useTags'
import {
  flattenCategoryOptions,
  generateProductSlug,
  generateProductSku,
} from '@/domains/admin/helpers/product.helpers'

interface ProductFormProps {
  form: UseFormReturn<any>
  onSubmit: (data: any) => void
  isSubmitting?: boolean
  brands: any[]
  categories: any[]
  loadingBrands?: boolean
  loadingCategories?: boolean
  mode: 'create' | 'edit'
}

export function ProductForm({
  form,
  onSubmit,
  isSubmitting,
  brands,
  categories,
  loadingBrands,
  loadingCategories,
  mode,
}: ProductFormProps) {
  // Load tags - use .data from UseQueryResult
  const { data: tagsData, isLoading: loadingTags } = useTags()
  const tags = tagsData?.tags || []

  // Variants array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  // Auto-generate slug from name (only in create mode)
  const nameValue = form.watch('name')
  useEffect(() => {
    if (mode === 'create' && nameValue && !form.getValues('slug')) {
      const slug = generateProductSlug(nameValue)
      form.setValue('slug', slug, { shouldValidate: true })
    }
  }, [nameValue, form, mode])

  // Manual slug generation
  const handleGenerateSlug = () => {
    const name = form.getValues('name')
    if (!name) {
      toast.error('Please enter product name first')
      return
    }
    const slug = generateProductSlug(name)
    form.setValue('slug', slug, { shouldValidate: true })
    toast.success('Slug generated!')
  }

  // Manual SKU generation
  const handleGenerateSKU = () => {
    const sku = generateProductSku()
    form.setValue('sku', sku, { shouldValidate: true })
    toast.success('SKU generated!')
  }

  const price = form.watch('price') || 0
  const salePrice = form.watch('sale_price') || 0
  const discount =
    salePrice && price > 0
      ? (((price - salePrice) / price) * 100).toFixed(1)
      : 0

  const flatCategories = useMemo(
    () => flattenCategoryOptions(categories),
    [categories]
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* LEFT CONTENT (8/12) */}
          <div className='lg:col-span-8 space-y-6'>
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic product details and descriptions
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='e.g. Vitamin C Brightening Serum'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SKU AND SLUG */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='sku'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input
                              placeholder='PRD-123456-ABC'
                              {...field}
                              className='flex-1'
                            />
                          </FormControl>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={handleGenerateSKU}
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

                  <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                      <FormItem className='mt-5'>
                        <FormLabel>URL Slug *</FormLabel>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input
                              {...field}
                              className='flex-1'
                              placeholder='product-url-slug'
                            />
                          </FormControl>
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={handleGenerateSlug}
                            title='Generate Slug'
                            className='shrink-0'
                          >
                            <RefreshCw className='w-4 h-4' />
                          </Button>
                        </div>
                        <FormDescription className='text-xs'>
                          /products/<strong>{field.value || 'slug'}</strong>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='short_description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className='resize-none h-20'
                          placeholder='A brief, compelling product summary (1-2 sentences)...'
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
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <ProfessionalEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          minHeight={250}
                          placeholder='Write a detailed product description...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='how_to_use'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How to Use</FormLabel>
                      <FormControl>
                        <ProfessionalEditor
                          value={field.value || ''}
                          onChange={field.onChange}
                          minHeight={200}
                          placeholder='Explain step-by-step instructions...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ingredients - JSON Object */}
                <FormField
                  control={form.control}
                  name='ingredients'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredients (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='resize-none h-32 font-mono text-xs'
                          placeholder='{"water": {}, "glycerin": {}, "niacinamide": {}}'
                          {...field}
                          value={
                            field.value
                              ? JSON.stringify(field.value, null, 2)
                              : ''
                          }
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value)
                              field.onChange(parsed)
                            } catch {
                              field.onChange(e.target.value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription className='text-xs'>
                        Enter valid JSON object for ingredients
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload high-quality product photos (up to 10 images)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='images'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploadSection
                          images={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Different sizes, colors, or shades
                    </CardDescription>
                  </div>
                  <Button
                    type='button'
                    variant='default'
                    size='sm'
                    onClick={() =>
                      append({
                        name: '',
                        sku: '',
                        price: 0,
                        stock_quantity: 0,
                        sale_price: null,
                        size: null,
                        size_unit: null,
                        color: null,
                        shade_name: null,
                      })
                    }
                    className='gap-2'
                  >
                    <Plus className='w-4 h-4' />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className='text-center py-12 border-2 border-dashed rounded-lg bg-muted/20'>
                    <Package className='w-12 h-12 mx-auto text-muted-foreground mb-3' />
                    <p className='text-sm font-medium text-muted-foreground mb-1'>
                      No variants added yet
                    </p>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        append({
                          name: '',
                          sku: '',
                          price: 0,
                          stock_quantity: 0,
                          sale_price: null,
                          size: null,
                          size_unit: null,
                          color: null,
                          shade_name: null,
                        })
                      }
                      className='gap-2'
                    >
                      <Plus className='w-4 h-4' />
                      Add First Variant
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {fields.map((field, index) => (
                      <Card
                        key={field.id}
                        className='border-2 border-border/50'
                      >
                        <CardHeader className='pb-3 bg-muted/30'>
                          <div className='flex items-center justify-between'>
                            <CardTitle className='text-base flex items-center gap-2'>
                              <Badge variant='outline'>#{index + 1}</Badge>
                              Variant {index + 1}
                            </CardTitle>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='text-destructive hover:text-destructive hover:bg-destructive/10'
                              onClick={() => remove(index)}
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className='space-y-4 pt-4'>
                          {/* Row 1: Name & SKU */}
                          <div className='grid grid-cols-2 gap-4'>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.name`}
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
                              name={`variants.${index}.sku`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-sm'>
                                    Variant SKU *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VAR-SKU-001'
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Row 2: Price & Sale Price */}
                          <div className='grid grid-cols-2 gap-4'>
                            <FormField
                              control={form.control}
                              name={`variants.${index}.price`}
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
                              name={`variants.${index}.sale_price`}
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
                              name={`variants.${index}.stock_quantity`}
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
                              name={`variants.${index}.color`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-sm'>
                                    Color
                                  </FormLabel>
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
                              name={`variants.${index}.size`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-sm'>
                                    Size
                                  </FormLabel>
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
                              name={`variants.${index}.size_unit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-sm'>
                                    Unit
                                  </FormLabel>
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
                              name={`variants.${index}.shade_name`}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR (4/12) */}
          <div className='lg:col-span-4 space-y-6'>
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='is_featured'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-sm font-medium'>
                          Featured Product
                        </FormLabel>
                        <FormDescription className='text-xs'>
                          Display in featured section
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Brand and category</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='brand_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingBrands}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue
                              placeholder={
                                loadingBrands
                                  ? 'Loading brands...'
                                  : 'Select brand'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='category_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue
                              placeholder={
                                loadingCategories
                                  ? 'Loading categories...'
                                  : 'Select category'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flatCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <span style={{ paddingLeft: `${cat.level * 12}px` }}>
                                {cat.level > 0 && '└─ '}
                                {cat.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Product pricing in VND</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
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
                      <FormLabel>Sale Price</FormLabel>
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

                {Number(discount) > 0 && (
                  <div className='p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800'>
                    <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                      💰 Discount: {discount}% OFF
                    </p>
                  </div>
                )}

                <Separator />

                <FormField
                  control={form.control}
                  name='stock_quantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
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
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Skin Types</CardTitle>
                <CardDescription>Select applicable skin types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(SkinType).map((type) => {
                    const current = form.watch('skin_types') || []
                    const isSelected = current.includes(type)
                    return (
                      <Badge
                        key={type}
                        variant={isSelected ? 'default' : 'outline'}
                        className='cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => {
                          const newTypes = isSelected
                            ? current.filter((t: SkinType) => t !== type)
                            : [...current, type]
                          form.setValue(
                            'skin_types',
                            newTypes.length > 0 ? newTypes : null
                          )
                        }}
                      >
                        {type.toUpperCase().replace('_', ' ')}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skin Concerns</CardTitle>
                <CardDescription>Target skin concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(SkinConcern).map((concern) => {
                    const current = form.watch('concerns') || []
                    const isSelected = current.includes(concern)
                    return (
                      <Badge
                        key={concern}
                        variant={isSelected ? 'default' : 'outline'}
                        className='cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => {
                          const newConcerns = isSelected
                            ? current.filter((c: SkinConcern) => c !== concern)
                            : [...current, concern]
                          form.setValue(
                            'concerns',
                            newConcerns.length > 0 ? newConcerns : null
                          )
                        }}
                      >
                        {concern.toUpperCase().replace('_', ' ')}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Benefits</CardTitle>
                <CardDescription>Key benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(ProductBenefit).map((benefit) => {
                    const current = form.watch('benefits') || []
                    const isSelected = current.includes(benefit)
                    return (
                      <Badge
                        key={benefit}
                        variant={isSelected ? 'default' : 'outline'}
                        className='cursor-pointer hover:opacity-80 transition-opacity'
                        onClick={() => {
                          const newBenefits = isSelected
                            ? current.filter(
                                (b: ProductBenefit) => b !== benefit
                              )
                            : [...current, benefit]
                          form.setValue(
                            'benefits',
                            newBenefits.length > 0 ? newBenefits : null
                          )
                        }}
                      >
                        {benefit.toUpperCase().replace('_', ' ')}
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  {loadingTags
                    ? 'Loading tags...'
                    : `Select tags for this product (${tags.length} available)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='tag_ids'
                  render={({ field }) => {
                    const selectedTagIds = (field.value as string[]) || []

                    return (
                      <FormItem>
                        {/* Selected Tags Display */}
                        {selectedTagIds.length > 0 && (
                          <div className='flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg mb-3'>
                            {selectedTagIds.map((tagId) => {
                              const tag = tags.find((t) => t.id === tagId)
                              if (!tag) return null

                              return (
                                <Badge
                                  key={tagId}
                                  variant='default'
                                  className='gap-1 pr-1 cursor-pointer hover:opacity-80'
                                >
                                  {tag.name}
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const newTagIds = selectedTagIds.filter(
                                        (id) => id !== tagId
                                      )
                                      field.onChange(
                                        newTagIds.length > 0 ? newTagIds : null
                                      )
                                    }}
                                    className='ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5'
                                  >
                                    <X className='w-3 h-3' />
                                  </button>
                                </Badge>
                              )
                            })}
                          </div>
                        )}

                        {/* Available Tags */}
                        <div className='flex flex-wrap gap-2'>
                          {loadingTags ? (
                            <p className='text-sm text-muted-foreground'>
                              Loading tags...
                            </p>
                          ) : tags.length > 0 ? (
                            tags.map((tag) => {
                              const isSelected = selectedTagIds.includes(tag.id)

                              return (
                                <Badge
                                  key={tag.id}
                                  variant={isSelected ? 'secondary' : 'outline'}
                                  className='cursor-pointer hover:opacity-80 transition-opacity'
                                  onClick={() => {
                                    const newTagIds = isSelected
                                      ? selectedTagIds.filter(
                                          (id) => id !== tag.id
                                        )
                                      : [...selectedTagIds, tag.id]
                                    field.onChange(
                                      newTagIds.length > 0 ? newTagIds : null
                                    )
                                  }}
                                >
                                  {tag.name}
                                  {tag.usage_count !== undefined && (
                                    <span className='ml-1 text-xs opacity-60'>
                                      ({tag.usage_count})
                                    </span>
                                  )}
                                </Badge>
                              )
                            })
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              No tags available
                            </p>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
