import { z } from "zod";
import { AuthTokenParam } from "./common.types";

// ============== USER PREFERENCE DATA STRUCTURE ==============

export interface UserPreference {
  skin_type?: string | null;
  skin_concerns?: string[] | null;
  favorite_brands?: string[] | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  preferred_categories?: string[] | null;
  allergies?: string[] | null;
}

// ============== TOOL INPUT SCHEMAS ==============

/**
 * Get Preferences Input
 * Fetches the current user's saved preferences for personalization.
 */
export const GetPreferencesInputSchema = z.object({
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type GetPreferencesInput = z.infer<typeof GetPreferencesInputSchema> &
  AuthTokenParam;

/**
 * Update Preferences Input
 * 
 * Use this tool to persist user preferences for future sessions.
 * Call this whenever the user mentions:
 * - Their skin type (da dầu, da khô, etc.)
 * - Skin concerns (mụn, thâm nám, lão hóa, etc.)
 * - Favorite brands
 * - Budget/price range
 * - Allergies or ingredients to avoid
 * 
 * All values should be stored in Vietnamese as the user states them.
 */
export const UpdatePreferencesInputSchema = z.object({
  skin_type: z
    .string()
    .nullable()
    .optional()
    .describe(
      "User's skin type in Vietnamese. " +
      "Examples: 'da dầu', 'da khô', 'da hỗn hợp', 'da nhạy cảm', 'da thường'"
    ),
  skin_concerns: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "User's skin concerns in Vietnamese. " +
      "Examples: 'mụn', 'thâm nám', 'lão hóa', 'khô da', 'lỗ chân lông'"
    ),
  favorite_brands: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("User's favorite cosmetics brands"),
  price_range_min: z
    .number()
    .nullable()
    .optional()
    .describe("Minimum budget in VND"),
  price_range_max: z
    .number()
    .nullable()
    .optional()
    .describe("Maximum budget in VND"),
  preferred_categories: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("Preferred product categories in Vietnamese (sữa rửa mặt, toner, serum, etc.)"),
  allergies: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("Ingredients or substances to avoid"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type UpdatePreferencesInput = z.infer<
  typeof UpdatePreferencesInputSchema
> &
  AuthTokenParam;

// TOOL OUTPUT SCHEMA
const UserPreferenceSchema = z
  .object({
    skin_type: z.string().nullable().optional(),
    skin_concerns: z.array(z.string()).nullable().optional(),
    favorite_brands: z.array(z.string()).nullable().optional(),
    price_range_min: z.coerce.number().nullable().optional(),
    price_range_max: z.coerce.number().nullable().optional(),
    preferred_categories: z.array(z.string()).nullable().optional(),
    allergies: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

export const UserPreferenceAPIResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: UserPreferenceSchema.nullable().optional(),
  meta: z.any().nullable().optional(),
});

export type UserPreferenceAPIResponse = z.infer<
  typeof UserPreferenceAPIResponseSchema
>;
