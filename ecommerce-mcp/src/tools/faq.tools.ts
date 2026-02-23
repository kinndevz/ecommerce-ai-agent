import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TOOL_METADATA } from "../config/constants";
import {
  SearchFAQInputSchema,
  FAQSearchOutput,
  SearchFAQInput,
} from "../types/faq.types";
import {
  apiClient,
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/api";
import { createToolDescription } from "../utils/helper";

/**
 * Register all FAQ-related tools
 */
export function registerFAQTools(server: McpServer) {
  registerSearchFAQ(server);
}

/**
 * Tool: search_faq
 *
 * Semantic search over internal knowledge base documents.
 *
 * USE THIS TOOL when user asks about:
 * - Return / exchange / shipping policies
 * - How to use a product
 * - Ingredient information
 * - Brand background or story
 * - Any general FAQ-style question not related to product search
 *
 */
function registerSearchFAQ(server: McpServer) {
  server.registerTool(
    "search_faq",
    {
      title: "Search FAQ & Knowledge Base",
      description: createToolDescription(
        TOOL_METADATA.FAQ_SEARCH,
        "Search internal FAQ, product guides, and policy documents using semantic search. " +
          "Use when user asks about policies, how-to-use, ingredients, brand info, " +
          "or any general cosmetics question not related to browsing/buying products."
      ),
      inputSchema: SearchFAQInputSchema,
      outputSchema: FAQSearchOutput,
    },
    async (args: SearchFAQInput) => {
      try {
        console.log(
          `[MCP] Searching FAQ - query: "${args.query}", limit: ${args.limit}`
        );

        const response = await apiClient.post("/documents/search", {
          query: args.query,
          limit: args.limit,
        });

        if (!response.success || !response.data) {
          throw new Error("Invalid API response structure");
        }

        console.log(">>>> search_faq response:", response);

        return formatSuccessResponse(response);
      } catch (error: any) {
        return formatErrorResponse(error.message);
      }
    }
  );
}
