import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { API_CONFIG, TOOL_METADATA } from "../config/constants";
import {
  SearchProductsInputSchema,
  NewArrivalsInputSchema,
  GetProductVariantsInputSchema,
  FlatProductListOutput,
  RichProductListOutput,
  ProductVariantsOutput,
  SearchProductsInput,
  NewArrivalsInput,
  GetProductVariantsInput,
} from "../types";
import {
  apiClient,
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/api";
import { createToolDescription, cleanParams } from "../utils/helper";

/**
 * Register all product-related tools
 */
export function registerProductTools(server: McpServer) {
  registerSearchProducts(server);
  registerSearchNewArrivals(server);
  registerGetProductVariants(server);
}

/**
 * Tool: search_products
 * Search for cosmetics products with filters
 */
function registerSearchProducts(server: McpServer) {
  server.registerTool(
    "search_products",
    {
      title: "Search products (AI Powered)",
      description: createToolDescription(
        TOOL_METADATA.PRODUCT_SEARCH,
        "Search for cosmetics products with keyword, price range, and pagination"
      ),
      inputSchema: SearchProductsInputSchema,
      outputSchema: FlatProductListOutput,
    },
    async (args: SearchProductsInput) => {
      try {
        console.log(`[MCP] Searching products: ${args.search}`);

        // Clean parameters (remove null/undefined)
        const params = cleanParams({
          q: args.search,
          min_price: args.min_price,
          max_price: args.max_price,
          page: args.page,
          limit: args.limit,
        });

        const response = await apiClient.get("/products/search", {
          params,
          timeout: API_CONFIG.SEARCH_TIMEOUT,
        });
        console.log(">>>>>> response", response);

        if (!response.success || !response.data) {
          throw new Error("Invalid API response structure");
        }

        console.log(">>>> formatResponse", formatSuccessResponse(response));

        return formatSuccessResponse(response);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: search_product_new_arrival
 * Get recently added products
 */
function registerSearchNewArrivals(server: McpServer) {
  server.registerTool(
    "search_product_new_arrival",
    {
      title: "Search Product New Arrival",
      description: createToolDescription(
        TOOL_METADATA.PRODUCT_SEARCH,
        "Get recently added cosmetics products (new arrivals)"
      ),
      inputSchema: NewArrivalsInputSchema,
      outputSchema: RichProductListOutput,
    },
    async (args: NewArrivalsInput) => {
      try {
        console.log(
          `[MCP] Fetching New Arrivals: limit=${args.limit}, days=${args.days}, page=${args.page}`
        );

        const params = cleanParams({
          days: args.days,
          page: args.page,
          limit: args.limit,
        });

        const response = await apiClient.get("/products/new-arrivals", {
          params,
          timeout: API_CONFIG.SEARCH_TIMEOUT,
        });

        console.log(">>>>>> response new arrival", response);

        if (!response.success || !response.data) {
          throw new Error("Invalid API response structure");
        }

        console.log(
          ">>>> formatResponse new arrival",
          formatSuccessResponse(response)
        );

        return formatSuccessResponse(response);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Tool: get_product_variants
 * Get all variants of a specific product
 */
function registerGetProductVariants(server: McpServer) {
  server.registerTool(
    "get_product_variants",
    {
      title: "Get Product Variants",
      description: createToolDescription(
        { agent: "product", category: "info", requires_auth: false },
        "Get all available variants (sizes, colors, etc.) for a specific product"
      ),
      inputSchema: GetProductVariantsInputSchema,
      outputSchema: ProductVariantsOutput,
    },
    async (args: GetProductVariantsInput) => {
      try {
        console.log(`[MCP] Fetching variants for product: ${args.product_id}`);

        const response = await apiClient.get(
          `/products/${args.product_id}/variants`
        );

        if (!response.success || !response.data) {
          throw new Error("Product not found or has no variants");
        }

        return formatSuccessResponse(response);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}
