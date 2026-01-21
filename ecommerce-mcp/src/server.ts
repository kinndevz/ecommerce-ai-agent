import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import {
  registerProductTools,
  registerCartTools,
  registerOrderTools,
} from "./tools";

/**
 * Main MCP Agent Class
 */
export class EcommerceMCP extends McpAgent {
  server = new McpServer({
    name: "Ecommerce MCP",
    version: "1.0.0",
  });

  /**
   * Initialize all tools
   */
  async init() {
    console.log("🚀 Initializing Ecommerce MCP Server...");

    // Register Product Tools
    registerProductTools(this.server);
    console.log("✅ Product tools registered (3 tools)");

    // Register Cart Tools
    registerCartTools(this.server);
    console.log("✅ Cart tools registered (5 tools)");

    // Register Order Tools
    registerOrderTools(this.server);
    console.log("✅ Order tools registered (4 tools)");

    console.log("🎉 Ecommerce MCP Server ready!");
  }
}
