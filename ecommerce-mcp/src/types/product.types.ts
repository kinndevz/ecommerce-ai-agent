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

// TOOL INPUT SCHEMAS
// Search Products Input
export const SearchProductsInputSchema = z.object({
  search: z
    .string()
    .describe("Keywords like 'kem chống nắng laroche' or 'trị mụn da dầu'"),
  min_price: z.number().nullable().optional(),
  max_price: z.number().nullable().optional(),
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
