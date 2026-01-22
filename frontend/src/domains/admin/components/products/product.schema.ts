import { ProductBenefit, SkinConcern, SkinType } from '@/api/services/enums'
import * as z from 'zod'

// Helper to get enum values
function getEnumValues<T extends Record<string, any>>(e: T) {
  return Object.values(e) as [string, ...string[]]
}

// Product Image Schema (matching ProductImageInput)
const productImageSchema = z.object({
  image_url: z.string(),
  alt_text: z.string().optional().nullable(),
  is_primary: z.boolean().optional().default(false),
  display_order: z.number().optional().default(0),
})

// Product Variant Schema (matching ProductVariantInput)
const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().int().min(0).default(0),
  size: z.string().optional().nullable(),
  size_unit: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  shade_name: z.string().optional().nullable(),
})

export const productFormSchema = z.object({
  // Required fields
  brand_id: z.string().min(1, 'Brand is required'),
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Invalid slug'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock_quantity: z.number().int().min(0).default(0),

  // Optional fields
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  how_to_use: z.string().optional().nullable(),
  sale_price: z.number().min(0).optional().nullable(),
  is_featured: z.boolean().optional().default(false),

  // Arrays
  skin_types: z
    .array(z.enum(getEnumValues(SkinType)))
    .optional()
    .nullable(),
  concerns: z
    .array(z.enum(getEnumValues(SkinConcern)))
    .optional()
    .nullable(),
  benefits: z
    .array(z.enum(getEnumValues(ProductBenefit)))
    .optional()
    .nullable(),
  tag_ids: z.array(z.string()).optional().nullable(),

  // Nested objects
  ingredients: z.record(z.string(), z.any()).optional().nullable(),
  images: z.array(productImageSchema).optional().nullable(),
  variants: z.array(productVariantSchema).optional().nullable(),
})

// Export type
export type ProductFormValues = z.infer<typeof productFormSchema>
