import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Loader2, Save } from 'lucide-react'
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
import { useUpdateProduct } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCategories } from '@/hooks/useCategories'
import { SkinType, SkinConcern, ProductBenefit } from '@/api/services/enums'
import type { ProductDetail } from '@/api/product.api'
import { productFormSchema } from './product.schema'
import { ProfessionalEditor } from './RichTextEditor'

interface ProductBasicInfoTabProps {
  product: ProductDetail
}

export function ProductBasicInfoTab({ product }: ProductBasicInfoTabProps) {
  const navigate = useNavigate()
  const updateProduct = useUpdateProduct()

  const { brands, isLoading: loadingBrands } = useBrands()
  const { categories, isLoading: loadingCategories } = useCategories()

  const form = useForm({
    resolver: zodResolver(
      productFormSchema.omit({ images: true, variants: true })
    ),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      brand_id: '',
      category_id: '',
      price: 0,
      stock_quantity: 0,
      sale_price: null,
      is_featured: false,
      short_description: null,
      description: null,
      how_to_use: null,
      skin_types: null,
      concerns: null,
      benefits: null,
      tag_ids: null,
      ingredients: null,
    },
  })

  // Populate form
  useEffect(() => {
    form.reset({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand_id: product.brand_id,
      category_id: product.category_id,
      price: product.price,
      stock_quantity: product.stock_quantity,
      sale_price: product.sale_price,
      is_featured: product.is_featured,
      short_description: product.short_description,
      description: product.description,
      how_to_use: product.how_to_use,
      skin_types: product.skin_types,
      concerns: product.concerns,
      benefits: product.benefits,
      tag_ids: product.tags?.map((t) => t.id),
      ingredients: product.ingredients,
    })
  }, [product, form])

  const onSubmit = (data: any) => {
    updateProduct.mutate({ id: product.id, data })
  }

  const price = form.watch('price') || 0
  const salePrice = form.watch('sale_price') || 0
  const discount =
    salePrice && price > 0
      ? (((price - salePrice) / price) * 100).toFixed(1)
      : 0

  // Flatten categories
  const flattenCategories = (cats: any[], level = 0): any[] => {
    let result: any[] = []
    cats.forEach((cat) => {
      result.push({ ...cat, level })
      if (cat.children && cat.children.length > 0) {
        result = [...result, ...flattenCategories(cat.children, level + 1)]
      }
    })
    return result
  }

  const flatCategories = flattenCategories(categories)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Submit Button */}
        <div className='flex justify-end gap-3 pt-6 border-t'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={updateProduct.isPending}>
            {updateProduct.isPending ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                Updating...
              </>
            ) : (
              <>
                <Save className='w-4 h-4 mr-2' />
                Save Changes
              </>
            )}
          </Button>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* LEFT - 8 cols */}
          <div className='lg:col-span-8 space-y-6'>
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Basic product details</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='sku'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription className='text-xs'>
                          /products/<strong>{field.value}</strong>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='ingredients'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingredients (JSON)</FormLabel>
                      <FormControl>
                        <Textarea
                          className='resize-none h-32 font-mono text-xs'
                          placeholder='{"water": {}, "glycerin": {}}'
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - 4 cols */}
          <div className='lg:col-span-4 space-y-6'>
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='is_featured'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                      <div>
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
                          <SelectTrigger>
                            <SelectValue placeholder='Select brand' />
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
                          <SelectTrigger>
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flatCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <span
                                style={{ paddingLeft: `${cat.level * 12}px` }}
                              >
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
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(SkinType).map((type) => {
                    const current = (form.watch('skin_types') ||
                      []) as SkinType[]
                    const isSelected = current.includes(type)
                    return (
                      <Badge
                        key={type}
                        variant={isSelected ? 'default' : 'outline'}
                        className='cursor-pointer hover:opacity-80'
                        onClick={() => {
                          const newTypes = isSelected
                            ? current.filter((t) => t !== type)
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
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(SkinConcern).map((concern) => {
                    const current = (form.watch('concerns') ||
                      []) as SkinConcern[]
                    const isSelected = current.includes(concern)
                    return (
                      <Badge
                        key={concern}
                        variant={isSelected ? 'default' : 'outline'}
                        className='cursor-pointer hover:opacity-80'
                        onClick={() => {
                          const newConcerns = isSelected
                            ? current.filter((c) => c !== concern)
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
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {Object.values(ProductBenefit).map((benefit) => {
                    const current = (form.watch('benefits') ||
                      []) as ProductBenefit[]
                    const isSelected = current.includes(benefit)
                    return (
                      <Badge
                        key={benefit}
                        variant={isSelected ? 'default' : 'outline'}
                        className='cursor-pointer hover:opacity-80'
                        onClick={() => {
                          const newBenefits = isSelected
                            ? current.filter((b) => b !== benefit)
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
          </div>
        </div>
      </form>
    </Form>
  )
}
