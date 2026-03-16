import { z } from "zod";

// ─── Input ────────────────────────────────────────────────────────────────────

export const RecommendFromHistoryInputSchema = z.object({
  order_limit: z
    .number()
    .optional()
    .default(2)
    .describe("Number of recent orders to scan (default: 2)"),
  max_results: z
    .number()
    .optional()
    .default(10)
    .describe("Maximum number of recommended products to return (default: 10)"),
  __auth_token: z.string().describe("Internal Auth Token"),
});

export type RecommendFromHistoryInput = z.infer<
  typeof RecommendFromHistoryInputSchema
>;

// ─── Output ───────────────────────────────────────────────────────────────────

const RecommendedProductSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    sale_price: z.number().nullable().optional(),
    stock_quantity: z.number(),
    product_image: z.string().nullable().optional(),
    brand_name: z.string().nullable().optional(),
    category_name: z.string().nullable().optional(),
    rating_average: z.number().nullable().optional(),
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

export const RecommendFromHistoryOutput = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(RecommendedProductSchema),
  meta: MetaSchema.nullable().optional(),
});

export type RecommendFromHistoryOutputType = z.infer<
  typeof RecommendFromHistoryOutput
>;
