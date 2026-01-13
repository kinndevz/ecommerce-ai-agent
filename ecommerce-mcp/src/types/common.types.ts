/**
 * Common Types and Interfaces
 */

// Standard API Response wrapper from backend
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: Record<string, any> | null;
}

// MCP Tool Response Structure (matches MCP SDK CallToolResult)
export interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: any;
  isError?: boolean;
  [key: string]: unknown; // Index signature for MCP SDK compatibility
}

// Auth Token Parameter (injected by interceptor)
export interface AuthTokenParam {
  __auth_token?: string;
}

// Pagination Parameters
export interface PaginationParams {
  page?: number | null;
  limit?: number | null;
}

// Price Range Filter
export interface PriceRangeParams {
  min_price?: number | null;
  max_price?: number | null;
}
