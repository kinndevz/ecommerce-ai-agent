import { EcommerceMCP } from "./server";
export { EcommerceMCP as MyMCP } from "./server";

/**
 * Cloudflare Workers Entry Point
 */
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // SSE endpoint
    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return EcommerceMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      return EcommerceMCP.serve("/mcp").fetch(request, env, ctx);
    }

    // 404 for other paths
    return new Response("Not found", { status: 404 });
  },
};
