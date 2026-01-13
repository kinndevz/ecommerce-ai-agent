/**
 * Cart Tools - Shopping cart management tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_METADATA, ERROR_MESSAGES } from "../config/constants";
import {
  ViewCartInputSchema,
  AddToCartInputSchema,
  UpdateCartItemInputSchema,
  RemoveCartItemInputSchema,
  ClearCartInputSchema,
  CartAPIResponseSchema,
  ViewCartInput,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveCartItemInput,
  ClearCartInput,
  Cart,
} from "../types";
import {
  apiClient,
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/api";
import { createToolDescription, validateAuthToken } from "../utils/helper";

/**
 * Register all cart-related tools
 */
export function registerCartTools(server: McpServer) {
  registerViewCart(server);
  registerAddToCart(server);
  registerUpdateCartItem(server);
  registerRemoveCartItem(server);
  registerClearCart(server);
}

/**
 * Tool: view_cart
 * View current cart state
 */
function registerViewCart(server: McpServer) {
  server.registerTool(
    "view_cart",
    {
      title: "View Shopping Cart",
      description: createToolDescription(
        TOOL_METADATA.CART_MANAGEMENT,
        "View the current shopping cart with all items, quantities, and total"
      ),
      inputSchema: ViewCartInputSchema,
      outputSchema: CartAPIResponseSchema,
    },
    async (args: ViewCartInput) => {
      try {
        console.log(`[MCP] Viewing cart`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        // Call backend API
        const response = await apiClient.get<Cart>("/cart", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.success || !response.data) {
          throw new Error("Failed to fetch cart");
        }

        // Parse response
        const cartData = CartAPIResponseSchema.parse(response.data);

        return formatSuccessResponse(cartData);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: add_to_cart
 * Add product to shopping cart (incremental behavior)
 */
function registerAddToCart(server: McpServer) {
  server.registerTool(
    "add_to_cart",
    {
      title: "Add product to cart",
      description: createToolDescription(
        TOOL_METADATA.CART_MANAGEMENT,
        "Add a product to cart. If product already exists in cart, INCREASES quantity by specified amount. If new product, adds with specified quantity."
      ),
      inputSchema: AddToCartInputSchema,
      outputSchema: CartAPIResponseSchema,
    },
    async (args: AddToCartInput) => {
      try {
        console.log(`[MCP] Adding to cart: ${args.product_id}`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        // Call backend API
        const response = await apiClient.post<Cart>(
          "/cart/items",
          {
            product_id: args.product_id,
            variant_id: args.variant_id,
            quantity: args.quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success || !response.data) {
          throw new Error("Failed to add item to cart");
        }

        // Parse response
        const cartData = CartAPIResponseSchema.parse(response.data);

        // Format success message
        const result = {
          status: "success",
          message: "Item added to cart successfully",
          added_item: {
            product_id: args.product_id,
            variant_id: args.variant_id,
            quantity: args.quantity,
          },
          current_cart_state: cartData,
        };

        return formatSuccessResponse(result);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: update_cart_item
 * Update quantity of an existing cart item
 */
function registerUpdateCartItem(server: McpServer) {
  server.registerTool(
    "update_cart_item",
    {
      title: "Update Cart Item Quantity",
      description: createToolDescription(
        TOOL_METADATA.CART_MANAGEMENT,
        "Update the quantity of an existing item in the shopping cart"
      ),
      inputSchema: UpdateCartItemInputSchema,
      outputSchema: CartAPIResponseSchema,
    },
    async (args: UpdateCartItemInput) => {
      try {
        console.log(
          `[MCP] Updating cart item ${args.item_id} to quantity ${args.quantity}`
        );

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        // Call backend API
        const response = await apiClient.put<Cart>(
          `/cart/items/${args.item_id}`,
          {
            quantity: args.quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success || !response.data) {
          throw new Error("Failed to update cart item");
        }

        // Parse response
        const cartData = CartAPIResponseSchema.parse(response.data);

        // Format success message
        const result = {
          status: "success",
          message: "Cart item updated successfully",
          updated_item: {
            item_id: args.item_id,
            new_quantity: args.quantity,
          },
          current_cart_state: cartData,
        };

        return formatSuccessResponse(result);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: remove_cart_item
 * Remove an item from the shopping cart
 */
function registerRemoveCartItem(server: McpServer) {
  server.registerTool(
    "remove_cart_item",
    {
      title: "Remove Item from Cart",
      description: createToolDescription(
        TOOL_METADATA.CART_MANAGEMENT,
        "Remove a specific item from the shopping cart"
      ),
      inputSchema: RemoveCartItemInputSchema,
      outputSchema: CartAPIResponseSchema,
    },
    async (args: RemoveCartItemInput) => {
      try {
        console.log(`[MCP] Removing cart item: ${args.item_id}`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        // Call backend API
        const response = await apiClient.delete<Cart>(
          `/cart/items/${args.item_id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.success || !response.data) {
          throw new Error("Failed to remove cart item");
        }

        // Parse response
        const cartData = CartAPIResponseSchema.parse(response.data);

        // Format success message
        const result = {
          status: "success",
          message: "Item removed from cart successfully",
          removed_item_id: args.item_id,
          current_cart_state: cartData,
        };

        return formatSuccessResponse(result);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: clear_cart
 * Clear all items from the shopping cart
 */
function registerClearCart(server: McpServer) {
  server.registerTool(
    "clear_cart",
    {
      title: "Clear Shopping Cart",
      description: createToolDescription(
        TOOL_METADATA.CART_MANAGEMENT,
        "Remove all items from the shopping cart (empty the cart)"
      ),
      inputSchema: ClearCartInputSchema,
      outputSchema: CartAPIResponseSchema,
    },
    async (args: ClearCartInput) => {
      try {
        console.log(`[MCP] Clearing cart`);

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        // Call backend API
        const response = await apiClient.delete<Cart>("/cart", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.success || !response.data) {
          throw new Error("Failed to clear cart");
        }

        // Parse response
        const cartData = CartAPIResponseSchema.parse(response.data);

        // Format success message
        const result = {
          status: "success",
          message: "Cart cleared successfully",
          current_cart_state: cartData,
        };

        return formatSuccessResponse(result);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}
