import { z } from "zod";
import { AuthTokenParam } from "./common.types";

// ORDER DATA STRUCTURES (TypeScript Interfaces)
export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  district?: string | null;
  ward?: string | null;
  country?: string | null;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  shipping_address: ShippingAddress;
  notes?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  total_items: number;
  created_at: string;
}

// TOOL INPUT SCHEMAS
const ShippingAddressSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    district: z.string().nullable().optional(),
    ward: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  })
  .passthrough();

const PaymentMethodSchema = z.enum([
  "cod",
  "bank_transfer",
  "vnpay",
  "momo",
  "credit_card",
]);

export const CreateOrderInputSchema = z.object({
  shipping_address: ShippingAddressSchema.describe("Shipping address payload"),
  payment_method: PaymentMethodSchema.describe("Payment method"),
  notes: z.string().nullable().optional().describe("Optional order notes"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema> &
  AuthTokenParam;

export const GetMyOrdersInputSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).optional().default(20),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type GetMyOrdersInput = z.infer<typeof GetMyOrdersInputSchema> &
  AuthTokenParam;

export const GetOrderDetailInputSchema = z.object({
  order_id: z.string().describe("Order ID"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type GetOrderDetailInput = z.infer<typeof GetOrderDetailInputSchema> &
  AuthTokenParam;

export const CancelOrderInputSchema = z.object({
  order_id: z.string().describe("Order ID to cancel"),
  __auth_token: z.string().optional().describe("Internal Auth Token"),
});

export type CancelOrderInput = z.infer<typeof CancelOrderInputSchema> &
  AuthTokenParam;

// TOOL OUTPUT SCHEMAS
const OrderItemSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable().optional(),
  product_name: z.string(),
  variant_name: z.string().nullable().optional(),
  quantity: z.number(),
  unit_price: z.coerce.number(),
  subtotal: z.coerce.number(),
});

const OrderSchema = z.object({
  id: z.string(),
  order_number: z.string(),
  user_id: z.string(),
  status: z.string(),
  payment_status: z.string(),
  payment_method: z.string().nullable().optional(),
  subtotal: z.coerce.number(),
  discount: z.coerce.number(),
  shipping_fee: z.coerce.number(),
  total: z.coerce.number(),
  shipping_address: ShippingAddressSchema,
  notes: z.string().nullable().optional(),
  items: z.array(OrderItemSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

const OrderListItemSchema = z.object({
  id: z.string(),
  order_number: z.string(),
  status: z.string(),
  payment_status: z.string(),
  total: z.coerce.number(),
  total_items: z.number(),
  created_at: z.string(),
});

const MetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
});

export const OrderAPIResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: OrderSchema,
  meta: MetaSchema.optional().nullable(),
});

export type OrderAPIResponse = z.infer<typeof OrderAPIResponseSchema>;

export const OrderListAPIResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.array(OrderListItemSchema),
  meta: MetaSchema.optional().nullable(),
});

export type OrderListAPIResponse = z.infer<typeof OrderListAPIResponseSchema>;
