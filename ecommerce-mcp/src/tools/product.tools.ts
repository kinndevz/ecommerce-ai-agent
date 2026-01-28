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
import { createToolDescription, cleanParams, serializeParams } from "../utils/helper";

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
 * 
 * Search for cosmetics products with structured filters.
 * 
 * IMPORTANT USAGE:
 * - Put product type ONLY in `search` (e.g., "sữa rửa mặt", "serum")
 * - Use `brand`, `skin_types`, `concerns`, `min_price`, `max_price` for filtering
 * - Do NOT combine everything into the search string
 * 
 * Example for "tìm sữa rửa mặt cerave cho da dầu giá dưới 300k":
 * - search: "sữa rửa mặt"
 * - brand: "cerave"
 * - skin_types: ["oily"]
 * - max_price: 300000
 */
function registerSearchProducts(server: McpServer) {
  server.registerTool(
    "search_products",
    {
      title: "Search Cosmetics Products",
      description: createToolDescription(
        TOOL_METADATA.PRODUCT_SEARCH,
        "Search for cosmetics products with keyword and structured filters. " +
        "Put product type in 'search', use dedicated filter fields for brand, skin type, concerns, and price."
      ),
      inputSchema: SearchProductsInputSchema,
      outputSchema: FlatProductListOutput,
    },
    async (args: SearchProductsInput) => {
      try {
        console.log(`[MCP] Searching products - search: "${args.search}", brand: ${args.brand}, skin_types: ${args.skin_types}`);

        const params = buildSearchParams(args);

        const response = await apiClient.get("/products/search", {
          params,
          paramsSerializer: serializeParams,
          timeout: API_CONFIG.SEARCH_TIMEOUT,
        });

        if (!response.success || !response.data) {
          throw new Error("Invalid API response structure");
        }

        return formatSuccessResponse(response);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}

/**
 * Build search params from tool input.
 * Separates concern from implementation detail.
 */
function buildSearchParams(args: SearchProductsInput): Record<string, any> {
  return cleanParams({
    q: args.search,
    brand: args.brand,
    category: args.category,
    skin_types: args.skin_types?.length ? args.skin_types : undefined,
    concerns: args.concerns?.length ? args.concerns : undefined,
    benefits: args.benefits?.length ? args.benefits : undefined,
    tags: args.tags?.length ? args.tags : undefined,
    min_price: args.min_price,
    max_price: args.max_price,
    is_available: args.is_available,
    page: args.page,
    limit: args.limit,
  });
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
