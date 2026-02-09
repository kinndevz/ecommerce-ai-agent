/**
 * Order Tools - Customer order management tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_METADATA } from "../config/constants";
import {
  CreateOrderInputSchema,
  GetMyOrdersInputSchema,
  GetOrderDetailInputSchema,
  CancelOrderInputSchema,
  OrderAPIResponseSchema,
  OrderListAPIResponseSchema,
  CreateOrderInput,
  GetMyOrdersInput,
  GetOrderDetailInput,
  CancelOrderInput,
  Order,
  OrderListItem,
} from "../types";
import {
  apiClient,
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/api";
import {
  createToolDescription,
  validateAuthToken,
  cleanParams,
} from "../utils/helper";

/**
 * Register all order-related tools
 */
export function registerOrderTools(server: McpServer) {
  registerCreateOrder(server);
  registerGetMyOrders(server);
  registerGetOrderDetail(server);
  registerCancelOrder(server);
}

/**
 * Tool: create_order
 * Create a new order from the current cart
 */
function registerCreateOrder(server: McpServer) {
  server.registerTool(
    "create_order",
    {
      title: "Create Order",
      description: createToolDescription(
        TOOL_METADATA.ORDER_MANAGEMENT,
        "Create a new order from the current cart with shipping address and payment method"
      ),
      inputSchema: CreateOrderInputSchema,
      outputSchema: OrderAPIResponseSchema,
    },
    async (args: CreateOrderInput) => {
      try {
        console.log(`[MCP] Creating order`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const response = await apiClient.post<Order>(
          "/orders",
          {
            shipping_address: args.shipping_address,
            payment_method: args.payment_method,
            notes: args.notes,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success || !response.data) {
          throw new Error("Failed to create order");
        }

        const orderData = OrderAPIResponseSchema.parse(response);

        console.log(">>> create_order", orderData);

        return formatSuccessResponse(orderData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: get_my_orders
 * Get orders for the current user (paginated)
 */
function registerGetMyOrders(server: McpServer) {
  server.registerTool(
    "get_my_orders",
    {
      title: "Get My Orders",
      description: createToolDescription(
        TOOL_METADATA.ORDER_MANAGEMENT,
        "Fetch the current user's orders with pagination"
      ),
      inputSchema: GetMyOrdersInputSchema,
      outputSchema: OrderListAPIResponseSchema,
    },
    async (args: GetMyOrdersInput) => {
      try {
        console.log(
          `[MCP] Fetching my orders: page=${args.page}, limit=${args.limit}`
        );

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const params = cleanParams({
          page: args.page,
          limit: args.limit,
        });

        const response = await apiClient.get<OrderListItem[]>("/orders", {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.success || !response.data) {
          throw new Error("Failed to fetch orders");
        }

        const ordersData = OrderListAPIResponseSchema.parse(response);

        console.log(">>> get_my_orders", ordersData);

        return formatSuccessResponse(ordersData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: get_order_detail
 * Get order detail by order id
 */
function registerGetOrderDetail(server: McpServer) {
  server.registerTool(
    "get_order_detail",
    {
      title: "Get Order Detail",
      description: createToolDescription(
        TOOL_METADATA.ORDER_MANAGEMENT,
        "Get full detail for a specific order by ID"
      ),
      inputSchema: GetOrderDetailInputSchema,
      outputSchema: OrderAPIResponseSchema,
    },
    async (args: GetOrderDetailInput) => {
      try {
        console.log(`[MCP] Fetching order detail: ${args.order_id}`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const response = await apiClient.get<Order>(
          `/orders/${args.order_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success || !response.data) {
          throw new Error("Failed to fetch order detail");
        }

        console.log(">>>>>order detail: ", response);

        const orderData = OrderAPIResponseSchema.parse(response);

        console.log(">>>>>get_order_detail: ", orderData);

        return formatSuccessResponse(orderData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: cancel_order
 * Cancel an order by id (pending/processing only)
 */
function registerCancelOrder(server: McpServer) {
  server.registerTool(
    "cancel_order",
    {
      title: "Cancel Order",
      description: createToolDescription(
        TOOL_METADATA.ORDER_MANAGEMENT,
        "Cancel an order that is still pending or processing"
      ),
      inputSchema: CancelOrderInputSchema,
      outputSchema: OrderAPIResponseSchema,
    },
    async (args: CancelOrderInput) => {
      try {
        console.log(`[MCP] Cancelling order: ${args.order_id}`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const response = await apiClient.patch<Order>(
          `/orders/${args.order_id}/cancel`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success || !response.data) {
          throw new Error("Failed to cancel order");
        }

        const orderData = OrderAPIResponseSchema.parse(response);
        console.log(">>>> >cancel_order: ", orderData);

        return formatSuccessResponse(orderData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}
