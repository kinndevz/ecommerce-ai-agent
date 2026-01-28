// Backend API Configuration
export const API_CONFIG = {
  // BACKEND_URL: "https://ecommerce-ai-agent-b2lc.onrender.com",
  BACKEND_URL: "http://127.0.0.1:8000",

  DEFAULT_TIMEOUT: 50000,
  SEARCH_TIMEOUT: 30000,
  CART_TIMEOUT: 50000,

  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// Tool Metadata Templates
export const TOOL_METADATA = {
  PRODUCT_SEARCH: {
    agent: "product",
    category: "search",
    requires_auth: false,
  },
  CART_MANAGEMENT: {
    agent: "order",
    category: "cart",
    requires_auth: true,
  },
  ORDER_MANAGEMENT: {
    agent: "order",
    category: "order",
    requires_auth: true,
  },
  PREFERENCE_MANAGEMENT: {
    agent: "profile",
    category: "preferences",
    requires_auth: true,
  },
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NO_AUTH_TOKEN: "Error: No auth token provided (internal error).",
  NETWORK_ERROR: "Network error occurred. Please try again.",
  INVALID_RESPONSE: "Invalid API response structure",
  UNKNOWN_ERROR: "Unknown error occurred",
} as const;
