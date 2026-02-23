import { z } from "zod";

//  Tool Input Schemas
export const SearchFAQInputSchema = z.object({
  query: z
    .string()
    .describe(
      "User question in natural language. " +
        "Examples: 'chính sách đổi trả như thế nào', 'sản phẩm này dùng được cho da nhạy cảm không'"
    ),
  limit: z
    .number()
    .optional()
    .default(3)
    .describe("Number of relevant chunks to retrieve. Default: 3"),
});

export type SearchFAQInput = z.infer<typeof SearchFAQInputSchema>;

//  Tool Output Schemas

const FAQResultItemSchema = z.object({
  content: z.string(),
  document_title: z.string(),
  version: z.number(),
  similarity: z.number(),
});

export const FAQSearchOutput = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(FAQResultItemSchema),
});

export type FAQSearchOutputType = z.infer<typeof FAQSearchOutput>;
