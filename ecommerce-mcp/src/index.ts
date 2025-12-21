import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import axios from "axios";
import { z } from "zod";
import { createToolDescription } from "./utils/helper";
import {
  CartAPIResponse,
  FlatProductListOutput,
  RichProductListOutput,
} from "./types";

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
            .default(7)
            .describe("Days range to consider new"),
          limit: z
            .number()
            .optional()
            .default(3)
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

    // Cart
    this.server.registerTool(
      "add_to_cart",
      {
        title: "Add product to cart",
        description: createToolDescription(
          {
            agent: "order",
            category: "cart",
            requires_auth: true,
          },
          "Add a specific product to the shopping cart. Requires Product ID."
        ),
        inputSchema: {
          product_id: z.string().describe("Product ID"),

          variant_id: z
            .string()
            .optional()
            .describe("Variant ID (if applicable, e.g. size/color)"),

          quantity: z
            .number()
            .int()
            .min(1)
            .max(100)
            .default(1)
            .describe("Quantity to add (1-100)"),

          token: z
            .string()
            .optional()
            .describe("Auth token injected by client"),
        },
        outputSchema: CartAPIResponse,
      },
      async (args) => {
        try {
          console.log(
            `[MCP] Adding to cart: ${args.product_id}, qty: ${args.quantity}`
          );

          // 1. Cấu hình Headers (Auth)
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          if (args.token) {
            headers["Authorization"] = `Bearer ${args.token}`;
          }

          // 2. Chuẩn bị Body
          const requestBody = {
            product_id: args.product_id,
            variant_id: args.variant_id,
            quantity: args.quantity,
          };

          // 3. Gọi API (POST)
          const response = await axios.post(
            "https://ecommerce-ai-agent-b2lc.onrender.com/cart/items",
            requestBody,
            {
              headers: headers,
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
              ? `API Error ${error.response.status}: ${JSON.stringify(
                  error.response.data
                )}`
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
