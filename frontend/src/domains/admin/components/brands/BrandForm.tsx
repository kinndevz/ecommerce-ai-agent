import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wand2, Globe, MapPin } from 'lucide-react'
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
import { LogoUploadSection } from './LogoUploadSection'
import type { Brand } from '@/api/brand.api'
import { BRAND_COUNTRIES, generateBrandSlug } from '../../helpers/brand.helpers'

// Validation Schema
const brandFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  country: z.string().nullable().optional(),
  website_url: z
    .url('Must be a valid URL')
    .nullable()
    .optional()
    .or(z.literal('')),
  description: z.string().nullable().optional(),
  logo_url: z
    .url('Must be a valid URL')
    .nullable()
    .optional()
    .or(z.literal('')),
  is_active: z.boolean(),
})

type BrandFormValues = z.infer<typeof brandFormSchema>

interface BrandFormProps {
  initialData?: Brand | null
  onSubmit: (data: BrandFormValues) => void
  isSubmitting: boolean
}

export function BrandForm({
  initialData,
  onSubmit,
  isSubmitting,
}: BrandFormProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialData?.logo_url || null
  )

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      country: initialData?.country || null,
      website_url: initialData?.website_url || null,
      description: initialData?.description || null,
      logo_url: initialData?.logo_url || null,
      is_active: initialData?.is_active ?? true,
    },
  })

  // Auto-generate slug from name
  const nameValue = form.watch('name')
  useEffect(() => {
    if (nameValue && !initialData && !form.getValues('slug')) {
      const slug = generateBrandSlug(nameValue)
      form.setValue('slug', slug, { shouldValidate: true })
    }
  }, [nameValue, form, initialData])

  // Manual slug generation
  const handleGenerateSlug = () => {
    const name = form.getValues('name')
    if (!name) {
      toast.error('Please enter brand name first')
      return
    }
    const slug = generateBrandSlug(name)
    form.setValue('slug', slug, { shouldValidate: true })
    toast.success('Slug generated!')
  }

  // Handle logo change
  const handleLogoChange = (url: string | null) => {
    setLogoUrl(url)
    form.setValue('logo_url', url)
  }

  // Handle form submission
  const handleSubmit = (data: BrandFormValues) => {
    // Clean up empty strings to null
    const cleanData: BrandFormValues = {
      ...data,
      country: data.country || null,
      website_url: data.website_url || null,
      description: data.description || null,
      logo_url: data.logo_url || null,
    }
    onSubmit(cleanData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Brand Name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder='e.g. La Roche-Posay'
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
                  <Input
                    {...field}
                    placeholder='la-roche-posay'
                    className='flex-1'
                  />
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
                /brands/<strong>{field.value || 'slug'}</strong>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? null : value)
                }
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select country'>
                      {field.value && (
                        <span className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4' />
                          {field.value}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {BRAND_COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website URL */}
        <FormField
          control={form.control}
          name='website_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    placeholder='https://www.brand-website.com'
                    className='pl-10'
                  />
                </div>
              </FormControl>
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
                  placeholder='Brief description of the brand, its history, and values...'
                  className='resize-none min-h-32'
                />
              </FormControl>
              <FormDescription>
                Write a brief overview of the brand (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo Upload */}
        <FormField
          control={form.control}
          name='logo_url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Logo</FormLabel>
              <FormControl>
                <LogoUploadSection
                  logoUrl={logoUrl}
                  onChange={handleLogoChange}
                />
              </FormControl>
              <FormDescription>
                Upload brand logo (PNG or JPG recommended, max 5MB)
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
                  Enable this brand to be visible on the website
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
              ? 'Update Brand'
              : 'Create Brand'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export { brandFormSchema }
export type { BrandFormValues }
