import { z } from "zod";

const BaseProductFields = {
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.number().optional().nullable(),
  price: z.number(),
  is_available: z.boolean(),

  concerns: z.array(z.string()).optional(),
  skin_types: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),

  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  rating_average: z.number().nullable().optional(),
  review_count: z.number().optional(),
  primary_image: z.string().optional(),
};

// --- 2. Sub-schemas (Cho loại Rich Product) ---
export const TagSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string().optional(),
});

export const BrandSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string().optional(),
});

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string().optional(),
});

/**
 * FLAT Schema: Dành cho API Search
 */
export const FlatProductSchema = z.object({
  ...BaseProductFields,
  brand_name: z.string().optional(),
  category_name: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * RICH Schema: Dành cho API New Arrival (brand object, tags object[])
 */
export const RichProductSchema = z.object({
  ...BaseProductFields,
  brand: BrandSchema.optional().nullable(),
  category: CategorySchema.optional().nullable(),
  tags: z.array(TagSchema).optional(),
});

export const createPaginatedResponse = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    products: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
  });

export const FlatProductListOutput = createPaginatedResponse(FlatProductSchema);
export const RichProductListOutput = createPaginatedResponse(RichProductSchema);
