import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import axios from "axios";
import { z } from "zod";
import { createToolDescription } from "./utils/helper";
import { FlatProductListOutput, RichProductListOutput } from "./types";

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  sku: z.string().optional(),
  brand_name: z.string().optional(),
  category_name: z.string().optional(),
  stock_quantity: z.number().optional().nullable(),
  price: z.number(),
  is_available: z.boolean(),
  concerns: z.array(z.string()).optional(),
  skin_types: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),

  description: z.string().nullable().optional(),
  rating_average: z.number().nullable().optional(),
});

const ProductListOutputSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  total_pages: z.number(),
});

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Ecommerce MCP",
    version: "1.0.0",
  });

  async init() {
    this.server.registerTool(
      "search_products",
      {
        title: "Search products (AI Powered)",
        description: createToolDescription(
          { agent: "product", category: "search", requires_auth: false },
          "Search for cosmetics products..."
        ),
        inputSchema: {
          search: z
            .string()
            .describe(
              "Keywords like 'kem chống nắng laroche' or 'trị mụn da dầu'"
            ),
          min_price: z.number().nullable().optional(),
          max_price: z.number().nullable().optional(),
          page: z.number().nullable().default(1),
          limit: z.number().nullable().default(10),
        },
        outputSchema: FlatProductListOutput,
      },
      async (args) => {
        try {
          console.log(`[MCP] Searching: ${args.search}`);

          const requestParams = {
            q: args.search,
            min_price: args.min_price,
            max_price: args.max_price,
            page: args.page,
            limit: args.limit,
          };

          const cleanParams = Object.fromEntries(
            Object.entries(requestParams).filter(([_, v]) => v != null)
          );

          const response = await axios.get(
            "https://ecommerce-ai-agent-b2lc.onrender.com/products/search",
            {
              params: cleanParams,
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 5000,
            }
          );

          const apiResponse = response.data;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(apiResponse.data, null, 2),
              },
            ],
            structuredContent: apiResponse.data,
          };
        } catch (error: any) {
          let errorMessage = "Unknown error";
          if (axios.isAxiosError(error)) {
            errorMessage = error.response
              ? `API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
              : `Network Error: ${error.message}`;
          } else {
            errorMessage = error.message;
          }

          return {
            content: [{ type: "text", text: errorMessage }],
            isError: true,
          };
        }
      }
    );
    this.server.registerTool(
      "search_product_new_arrival",
      {
        title: "Search Product New Arrival",
        description: createToolDescription(
          { agent: "product", category: "search", requires_auth: false },
          "Search for cosmetics products new arrival"
        ),
        inputSchema: {
          days: z
            .number()
            .optional()
            .default(30)
            .describe("Days range to consider new"),
          limit: z
            .number()
            .optional()
            .default(10)
            .describe("Number of products to return"),
        },
        outputSchema: RichProductListOutput.omit({
          page: true,
          limit: true,
          total_pages: true,
        }),
      },
      async (args) => {
        try {
          console.log(
            `[MCP] Fetching New Arrivals: limit=${args.limit}, days=${args.days}`
          );

          const response = await axios.get(
            "https://ecommerce-ai-agent-b2lc.onrender.com/products/new-arrivals",
            {
              params: {
                days: args.days,
                limit: args.limit,
              },
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 5000,
            }
          );

          const apiResponse = response.data;

          if (!apiResponse.success || !apiResponse.data) {
            throw new Error("Invalid API response structure");
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(apiResponse.data, null, 2),
              },
            ],
            structuredContent: apiResponse.data,
          };
        } catch (error: any) {
          let errorMessage = "Unknown error";
          if (axios.isAxiosError(error)) {
            errorMessage = error.response
              ? `API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
              : `Network Error: ${error.message}`;
            console.error(`[MCP Error] ${errorMessage}`);
          } else {
            errorMessage = error.message;
            console.error(`[MCP Error] ${errorMessage}`);
          }

          return {
            content: [{ type: "text", text: errorMessage }],
            isError: true,
          };
        }
      }
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
