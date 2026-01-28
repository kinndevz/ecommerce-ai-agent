import { z } from "zod";

// PRODUCT DATA STRUCTURES (TypeScript Interfaces)
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  product_image: string | null;
  images?: string[];
  is_available: boolean;
  brand_name: string | null;
  category_name: string | null;
  rating_average: number | null;
  review_count?: number;
  concerns?: string[];
  skin_types?: string[];
  benefits?: string[];
  tags?: string[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  attributes: Record<string, any>;
  created_at: string;
}

// Simple (Brand, Category)
const SimpleEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable().optional(),
});

const ProductListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  price: z.number(),
  sale_price: z.number().nullable().optional(),
  stock_quantity: z.number(),
  is_available: z.boolean(),
  is_featured: z.boolean().optional(),
  rating_average: z.number().nullable().optional(),
  review_count: z.number().optional(),
  views_count: z.number().optional(),
  brand: SimpleEntitySchema.nullable().optional(),
  category: SimpleEntitySchema.nullable().optional(),
  product_image: z.string().nullable().optional(),
  tags: z.array(TagSchema).optional().default([]),
});

// ============== TOOL INPUT SCHEMAS ==============

/**
 * Search Products Input Schema
 * 
 * IMPORTANT USAGE RULES:
 * 1. `search` should contain ONLY the product type/category keywords
 *    Good: "sữa rửa mặt", "kem dưỡng", "serum"
 *    Bad: "sữa rửa mặt cerave da dầu giá dưới 300k" (use filters instead)
 * 
 * 2. Use structured filters for specific criteria:
 *    - brand: specific brand name
 *    - skin_types: user's skin type (e.g., "da dầu", "da khô")
 *    - concerns: skin concerns (e.g., "mụn", "thâm nám")
 *    - min_price/max_price: price range in VND
 * 
 * 3. Filters are combined with AND logic
 * 4. All filter values should be in Vietnamese as stored in the database
 */
export const SearchProductsInputSchema = z.object({
  search: z
    .string()
    .describe(
      "Product type or category keywords ONLY. " +
      "Example: 'sữa rửa mặt', 'kem chống nắng', 'serum vitamin c'. " +
      "DO NOT include brand, skin type, or price in this field - use dedicated filters."
    ),
  brand: z
    .string()
    .nullable()
    .optional()
    .describe("Brand name to filter by. Example: 'cerave', 'la roche-posay', 'innisfree'"),
  category: z
    .string()
    .nullable()
    .optional()
    .describe("Category name to filter by"),
  skin_types: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Skin types to filter by (Vietnamese). " +
      "Examples: 'da dầu', 'da khô', 'da hỗn hợp', 'da nhạy cảm', 'da thường'"
    ),
  concerns: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Skin concerns to filter by (Vietnamese). " +
      "Examples: 'mụn', 'thâm nám', 'lão hóa', 'khô da', 'lỗ chân lông'"
    ),
  benefits: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Product benefits to filter by (Vietnamese). " +
      "Examples: 'dưỡng ẩm', 'làm sáng da', 'chống lão hóa', 'trị mụn'"
    ),
  tags: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("Tags to filter by"),
  min_price: z
    .number()
    .nullable()
    .optional()
    .describe("Minimum price in VND"),
  max_price: z
    .number()
    .nullable()
    .optional()
    .describe("Maximum price in VND"),
  is_available: z
    .boolean()
    .nullable()
    .optional()
    .default(true)
    .describe("Filter by availability. Default: true"),
  page: z.number().nullable().default(1),
  limit: z.number().nullable().default(10),
});

export type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;

// New Arrivals Input
export const NewArrivalsInputSchema = z.object({
  days: z.number().optional().default(7).describe("Days range to consider new"),
  limit: z
    .number()
    .optional()
    .default(10)
    .describe("Number of products to return"),
  page: z.number().optional().default(1).describe("Page number"),
});

export type NewArrivalsInput = z.infer<typeof NewArrivalsInputSchema>;

// Get Product Variants Input
export const GetProductVariantsInputSchema = z.object({
  product_id: z.string().describe("Product ID to get variants for"),
});

export type GetProductVariantsInput = z.infer<
  typeof GetProductVariantsInputSchema
>;

// TOOL OUTPUT SCHEMAS
const ProductItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    sale_price: z.number().nullable().optional(),
    stock_quantity: z.number(),
    product_image: z.string().nullable().optional().or(z.literal("")),
    brand_name: z.string().nullable().optional(),
    category_name: z.string().nullable().optional(),
    rating_average: z.number().nullable().optional(),

    description: z.string().optional(),
    is_available: z.boolean().optional(),

    concerns: z.array(z.string()).optional(),
    skin_types: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

const MetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
});

export const FlatProductListOutput = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(ProductItemSchema),
  meta: MetaSchema,
});

export type FlatProductListOutputType = z.infer<typeof FlatProductListOutput>;

export const RichProductListOutput = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(ProductListItemSchema),
  meta: MetaSchema.optional(),
});

export type RichProductListOutputType = z.infer<typeof RichProductListOutput>;

// Product Variants Output
export const ProductVariantsOutput = z
  .object({
    success: z.boolean().optional(),
    data: z
      .array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            sku: z.string().nullable().optional(),
            price: z.number(),
            sale_price: z.number().nullable().optional(),
            stock_quantity: z.number(),
            attributes: z.record(z.any()).optional(),
          })
          .passthrough()
      )
      .optional(),
    product_id: z.string().optional(),
    product_name: z.string().optional(),
    variants: z.array(z.any()).optional(),
  })
  .passthrough();

export type ProductVariantsOutputType = z.infer<typeof ProductVariantsOutput>;
