import { z } from "zod";

// ─── Tool Input Schemas ───────────────────────────────────────────────────────

export const GetProductReviewsInputSchema = z.object({
  slug: z
    .string()
    .describe(
      "Product slug. Example: 'sua-rua-mat-cerave', 'kem-chong-nang-la-roche-posay'"
    ),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

export type GetProductReviewsInput = z.infer<
  typeof GetProductReviewsInputSchema
>;

export const GetReviewSummaryInputSchema = z.object({
  slug: z
    .string()
    .describe(
      "Product slug to get AI-generated review summary for. " +
        "Use when user asks 'sản phẩm này review thế nào', 'có nên mua không', " +
        "'khách hàng nói gì về sản phẩm này'"
    ),
});

export type GetReviewSummaryInput = z.infer<typeof GetReviewSummaryInputSchema>;

// ─── Tool Output Schemas ──────────────────────────────────────────────────────

const ReviewItemSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  user_id: z.string(),
  rating: z.number(),
  title: z.string().nullable().optional(),
  content: z.string(),
  verified_purchase: z.boolean(),
  helpful_count: z.number(),
  skin_type: z.string().nullable().optional(),
  age_range: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  user_name: z.string().nullable().optional(),
  user_avatar: z.string().nullable().optional(),
});

const MetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
});

export const ProductReviewsOutput = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(ReviewItemSchema),
  meta: MetaSchema,
});

export type ProductReviewsOutputType = z.infer<typeof ProductReviewsOutput>;

export const ReviewSummaryOutput = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.object({
    slug: z.string(),
    summary: z.string().nullable(),
    average_rating: z.number(),
    review_count: z.number(),
    source: z.string(), // "cache" | "generated"
  }),
  meta: z.any().nullable().optional(),
});

export type ReviewSummaryOutputType = z.infer<typeof ReviewSummaryOutput>;
