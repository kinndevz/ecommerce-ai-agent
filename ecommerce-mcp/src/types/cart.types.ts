import { z } from "zod";
import { AuthTokenParam } from "./common.types";
import { success } from "zod/v4";

// CART DATA STRUCTURES

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price: number;

  // Product details (denormalized for display)
  product_name: string;
  product_slug: string;
  product_image: string | null;
  variant_name: string | null;

  // Computed
  subtotal: number;

  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];

  // Summary
  total_items: number;
  subtotal: number;

  created_at: string;
  updated_at: string;
}

// TOOL INPUT SCHEMAS

// View Cart Input (no parameters needed, uses auth token)
export const ViewCartInputSchema = z.object({
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type ViewCartInput = z.infer<typeof ViewCartInputSchema> &
  AuthTokenParam;

// Add to Cart Input
export const AddToCartInputSchema = z.object({
  product_id: z.string().describe("Product ID"),
  variant_id: z.string().optional().describe("Variant ID (if applicable)"),
  quantity: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(1)
    .describe("Quantity to add"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type AddToCartInput = z.infer<typeof AddToCartInputSchema> &
  AuthTokenParam;

// Update Cart Item Input
export const UpdateCartItemInputSchema = z.object({
  item_id: z.string().describe("Cart Item ID to update"),
  quantity: z.number().int().min(1).max(100).describe("New quantity"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemInputSchema> &
  AuthTokenParam;

// Remove Cart Item Input
export const RemoveCartItemInputSchema = z.object({
  item_id: z.string().describe("Cart Item ID to remove"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type RemoveCartItemInput = z.infer<typeof RemoveCartItemInputSchema> &
  AuthTokenParam;

// Clear Cart Input
export const ClearCartInputSchema = z.object({
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type ClearCartInput = z.infer<typeof ClearCartInputSchema> &
  AuthTokenParam;

// TOOL OUTPUT SCHEMA

// Cart API Response (unified for all cart operations)
export const CartAPIResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.object({
    id: z.string(),
    user_id: z.string(),
    items: z.array(
      z.object({
        id: z.string(),
        product_id: z.string(),
        variant_id: z.string().nullable(),
        quantity: z.number(),
        price: z.coerce.number(),
        product_name: z.string(),
        product_slug: z.string(),
        product_image: z.string().nullable(),
        variant_name: z.string().nullable(),
        subtotal: z.coerce.number(),
        created_at: z.string(),
        updated_at: z.string(),
      })
    ),
    total_items: z.number(),
    subtotal: z.coerce.number(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  meta: z.any().nullable().optional(),
});

export type CartAPIResponse = z.infer<typeof CartAPIResponseSchema>;
