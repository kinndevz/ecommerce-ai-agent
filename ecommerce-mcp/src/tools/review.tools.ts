import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_METADATA } from "../config/constants";
import {
  GetProductReviewsInputSchema,
  GetReviewSummaryInputSchema,
  ProductReviewsOutput,
  ReviewSummaryOutput,
  GetProductReviewsInput,
  GetReviewSummaryInput,
} from "../types/review.types";
import {
  apiClient,
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/api";
import { createToolDescription, cleanParams } from "../utils/helper";

export function registerReviewTools(server: McpServer) {
  registerGetProductReviews(server);
  registerGetReviewSummary(server);
}

function registerGetProductReviews(server: McpServer) {
  server.registerTool(
    "get_product_reviews",
    {
      title: "Get Product Reviews",
      description: createToolDescription(
        TOOL_METADATA.PRODUCT_REVIEWS,
        "Get paginated list of customer reviews for a product by its slug. " +
          "Use when user wants to browse individual reviews, " +
          "not when they just want a summary (use get_product_review_summary for that)."
      ),
      inputSchema: GetProductReviewsInputSchema,
      outputSchema: ProductReviewsOutput,
    },
    async (args: GetProductReviewsInput) => {
      try {
        console.log(
          `[MCP] Fetching reviews for product: ${args.slug}, page: ${args.page}`
        );

        const params = cleanParams({ page: args.page, limit: args.limit });
        const response = await apiClient.get(
          `/products/slug/${args.slug}/reviews`,
          { params }
        );

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

function registerGetReviewSummary(server: McpServer) {
  server.registerTool(
    "get_product_review_summary",
    {
      title: "Get Product Review Summary",
      description: createToolDescription(
        TOOL_METADATA.PRODUCT_REVIEWS,
        "Get AI-generated summary of customer reviews for a product. " +
          "Returns pros, cons, and skin type suitability based on actual reviews. " +
          "Use when user asks about product quality, whether to buy, or what customers think."
      ),
      inputSchema: GetReviewSummaryInputSchema,
      outputSchema: ReviewSummaryOutput,
    },
    async (args: GetReviewSummaryInput) => {
      try {
        console.log(`[MCP] Fetching review summary for product: ${args.slug}`);

        const response = await apiClient.get(
          `/products/slug/${args.slug}/reviews/summary`
        );

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
