import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_METADATA } from "../config/constants";
import {
  RecommendFromHistoryInputSchema,
  RecommendFromHistoryOutput,
  type RecommendFromHistoryInput,
} from "../types/recommendation.types";
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
 * Register recommendation tools
 */
export function registerRecommendationTools(server: McpServer) {
  registerRecommendFromHistory(server);
}

/**
 * Tool: recommend_from_history
 *
 * Single-call replacement for the Flow G multi-step chain:
 *   get_my_orders → get_order_detail × N → get_related_products × N
 *
 * Backend handles all the heavy lifting — returns deduplicated,
 * sorted product recommendations in one API call.
 *
 * Use when user says:
 * - "gợi ý sản phẩm cho tôi"
 * - "tôi nên mua gì tiếp theo"
 * - "có gì phù hợp với tôi không"
 * - "recommend cho tôi đi"
 */
function registerRecommendFromHistory(server: McpServer) {
  server.registerTool(
    "recommend_from_history",
    {
      title: "Recommend Products From Order History",
      description: createToolDescription(
        { ...TOOL_METADATA.PRODUCT_SEARCH, requires_auth: true },
        "Recommend products based on the user's recent order history. " +
          "Use when user asks for open-ended recommendations: " +
          "'gợi ý sản phẩm cho tôi', 'tôi nên mua gì tiếp theo', " +
          "'có gì phù hợp với tôi không', 'recommend cho tôi đi'. " +
          "Returns related products from the same categories/concerns as recently purchased items."
      ),
      inputSchema: RecommendFromHistoryInputSchema,
      outputSchema: RecommendFromHistoryOutput,
    },
    async (args: RecommendFromHistoryInput) => {
      try {
        console.log(
          `[MCP] recommend_from_history | order_limit=${args.order_limit}, max_results=${args.max_results}`
        );

        const authToken = args.__auth_token;
        validateAuthToken(authToken);

        const params = cleanParams({
          order_limit: args.order_limit,
          max_results: args.max_results,
        });

        const response = await apiClient.get("/recommendations/from-history", {
          params,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.success || !response.data) {
          throw new Error("No recommendations available");
        }

        console.log("[MCP] recommend_from_history response:", response);

        return formatSuccessResponse(response);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}
