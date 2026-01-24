import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wand2 } from 'lucide-react'
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
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { toast } from 'sonner'
import { CategoryImageUploadSection } from './CategoryImageUploadSection'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/api/category.api'
import {
  flattenCategoryTree,
  generateCategorySlug,
  getSuggestedDisplayOrder,
} from '../../helpers/category.helpers'

// Validation Schema
const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  parent_id: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  display_order: z.number().int().min(0),
  is_active: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormProps {
  initialData?: Category | null
  onSubmit: (data: CategoryFormValues) => void
  isSubmitting: boolean
}

export function CategoryForm({
  initialData,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url || null
  )

  const { categories: categoryTreeData } = useCategories()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      parent_id: initialData?.parent_id || null,
      description: initialData?.description || null,
      image_url: initialData?.image_url || null,
      display_order: initialData?.display_order || 0,
      is_active: initialData?.is_active ?? true,
    },
  })

  const categoryTree = useMemo(() => categoryTreeData, [categoryTreeData])

  // Manual slug generation
  const handleGenerateSlug = () => {
    const name = form.getValues('name')
    if (!name) {
      toast.error('Please enter category name first')
      return
    }
    const slug = generateCategorySlug(name)
    form.setValue('slug', slug, { shouldValidate: true })
    toast.success('Slug generated!')
  }

  // Handle image change
  const handleImageChange = (url: string | null) => {
    setImageUrl(url)
    form.setValue('image_url', url)
  }

  // Handle form submission
  const handleSubmit = (data: CategoryFormValues) => {
    const cleanData: CategoryFormValues = {
      ...data,
      parent_id: data.parent_id || null,
      description: data.description || null,
      image_url: data.image_url || null,
    }
    onSubmit(cleanData)
  }

  const parentOptions = useMemo(
    () => flattenCategoryTree(categoryTree, 0, initialData?.id),
    [categoryTree, initialData?.id]
  )

  const nameValue = form.watch('name')
  const selectedParentId = form.watch('parent_id')

  useEffect(() => {
    if (nameValue && !initialData && !form.getValues('slug')) {
      const slug = generateCategorySlug(nameValue)
      form.setValue('slug', slug, { shouldValidate: true })
    }
  }, [nameValue, form, initialData])

  const suggestedOrder = useMemo(
    () => getSuggestedDisplayOrder(categoryTree, selectedParentId),
    [categoryTree, selectedParentId]
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Category Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g. Skincare'
                  {...field}
                  className='text-base'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL Slug */}
        <FormField
          control={form.control}
          name='slug'
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug *</FormLabel>
              <div className='flex gap-2'>
                <FormControl>
                  <Input {...field} placeholder='skincare' className='flex-1' />
                </FormControl>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={handleGenerateSlug}
                  title='Generate Slug'
                >
                  <Wand2 className='w-4 h-4' />
                </Button>
              </div>
              <FormDescription className='text-xs'>
                /categories/<strong>{field.value || 'slug'}</strong>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category */}
        <FormField
          control={form.control}
          name='parent_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? null : value)
                }
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select parent category' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>
                    None (Top Level) • {categoryTree.length} categories
                  </SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {'—'.repeat(option.level)} {option.name}
                      {option.childrenCount > 0 &&
                        ` • ${option.childrenCount} children`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {selectedParentId
                  ? 'This category will be a subcategory'
                  : 'This will be a top-level category'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  placeholder='Brief description of the category...'
                  className='resize-none min-h-32'
                />
              </FormControl>
              <FormDescription>
                Write a brief overview of the category (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Image */}
        <FormField
          control={form.control}
          name='image_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <CategoryImageUploadSection
                  imageUrl={imageUrl}
                  onChange={handleImageChange}
                />
              </FormControl>
              <FormDescription>
                Upload category image (PNG or JPG recommended, max 5MB)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Order */}
        <FormField
          control={form.control}
          name='display_order'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <div className='flex gap-2'>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    min={0}
                    placeholder={`Suggested: ${suggestedOrder}`}
                  />
                </FormControl>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => form.setValue('display_order', suggestedOrder)}
                  className='whitespace-nowrap'
                >
                  Use {suggestedOrder}
                </Button>
              </div>
              <FormDescription>
                {selectedParentId ? (
                  <>
                    Currently {suggestedOrder} subcategories in selected parent.
                    Lower numbers appear first.
                  </>
                ) : (
                  <>
                    Currently {suggestedOrder} top-level categories. Lower
                    numbers appear first.
                  </>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status */}
        <FormField
          control={form.control}
          name='is_active'
          render={({ field }) => (
            <FormItem className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base font-medium'>
                  Active Status
                </FormLabel>
                <FormDescription>
                  Enable this category to be visible on the website
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

        {/* Submit Button */}
        <div className='flex justify-end gap-3 pt-6 border-t'>
          <Button type='submit' disabled={isSubmitting} className='min-w-32'>
            {isSubmitting
              ? initialData
                ? 'Updating...'
                : 'Creating...'
              : initialData
              ? 'Update Category'
              : 'Create Category'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { categoryFormSchema }
export type { CategoryFormValues }
