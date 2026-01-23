export const API_ENDPOINT = {
  // Auth Routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  SEND_OTP: '/auth/otp',

  // Category Routes
  GET_ALL_CATEGORIES: '/categories',
  GET_CATEGORY_DETAIL: (id: string) => `/categories/${id}`,
  GET_CATEGORY_TREE: '/categories/tree',
  GET_CATEGORY_STATISTICS: '/categories/stats',
  GENERATE_CATEGORY: '/categories',
  UPDATE_CATEGORY: (id: string) => `/categories/${id}`,
  DELETE_CATEGORY: (id: string) => `/categories/${id}`,
  TOGGLE_CATEGORY_STATUS: (id: string) => `/categories/${id}/toggle-status`,
  MOVE_CATEGORY: (id: string) => `/categories/${id}/move`,

  // Cart Endpoints
  GET_CART: '/cart',
  ADD_TO_CART: '/cart/items',
  CLEAR_CART: '/cart',
  UPDATE_CART_ITEM: (id: string) => `/cart/items/${id}`,
  REMOVE_CART_ITEM: (id: string) => `/cart/items/${id}`,

  // Order Endpoints
  CREATE_ORDER: '/orders',
  GET_MY_ORDERS: '/orders',
  GET_ALL_ORDERS_ADMIN: '/orders/all',
  GET_ORDER_STATS: '/orders/stats',
  GET_ORDER_DETAIL: (id: string) => `/orders/${id}`,
  GET_ORDER_DETAIL_ADMIN: (id: string) => `/orders/admin/${id}`,
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
  UPDATE_ORDER_STATUS: (id: string) => `/orders/${id}/status`,

  // Tags
  TAGS: '/tags',
  TAG_POPULAR: '/tags/popular',
  TAG_STATS: '/tags/stats',
  TAG_BY_SLUG: (slug: string) => `/tags/slug/${slug}`,
  TAG_DETAIL: (id: string) => `/tags/${id}`,
  TAG_MERGE: '/tags/merge',

  // Brand Routes
  GET_ALL_BRANDS: '/brands',
  GET_BRAND_DETAIL: (id: string) => `/brands/${id}`,
  GET_BRAND_STATISTICS: '/brands/stats',
  GENERATE_BRAND: '/brands',
  UPDATE_BRAND: (id: string) => `/brands/${id}`,
  DELETE_BRAND: (id: string) => `/brands/${id}`,
  TOGGLE_BRAND_STATUS: (id: string) => `/brands/${id}/toggle-status`,

  // Media Routes
  MEDIA_UPLOAD_FILES: '/media/images/upload',
  MEDIA_PRESIGNED_URL: '/media/images/upload/presigned-url',
  MEDIA_PRESIGNED_URLS: '/media/images/upload/presigned-urls',
  MEDIA_DELETE_FILE: '/media/file',

  // Role Routes
  ROLES: '/roles',
  ROLE_STATS: '/roles/stats',
  ROLE_DETAIL: (id: string) => `/roles/${id}`,
  ROLE_ASSIGN_PERMISSIONS: (id: string) => `/roles/${id}/permissions/assign`,
  ROLE_REMOVE_PERMISSIONS: (id: string) => `/roles/${id}/permissions/remove`,

  // Permission Roues
  PERMISSIONS: '/roles/permissions',
  PERMISSIONS_ALL: '/roles/permissions/all',
  PERMISSIONS_GROUPED: '/roles/permissions/grouped',
  PERMISSIONS_DETAIL: (id: string) => `/roles/permissions/${id}`,
  // Product Routes
  PRODUCTS: '/products',
  PRODUCT_SEARCH: '/products/search',
  PRODUCT_STATS: '/products/stats',
  PRODUCT_LOW_STOCK: '/products/low-stock',
  PRODUCT_OUT_OF_STOCK: '/products/out-of-stock',

  // Discovery
  PRODUCT_FEATURED: '/products/featured',
  PRODUCT_TRENDING: '/products/trending',
  PRODUCT_NEW_ARRIVALS: '/products/new-arrivals',
  PRODUCT_ON_SALE: '/products/on-sale',

  // Dynamic URL Generators
  PRODUCT_BY_BRAND: (slug: string) => `/products/by-brand/${slug}`,
  PRODUCT_BY_CATEGORY: (slug: string) => `/products/by-category/${slug}`,
  PRODUCT_RELATED: (id: string) => `/products/${id}/related`,
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,

  // Stock & Toggles
  PRODUCT_UPDATE_STOCK: (id: string) => `/products/${id}/stock`,
  PRODUCT_TOGGLE_AVAILABILITY: (id: string) =>
    `/products/${id}/toggle-availability`,
  PRODUCT_TOGGLE_FEATURED: (id: string) => `/products/${id}/toggle-featured`,

  // Tags
  PRODUCT_TAGS: (id: string) => `/products/${id}/tags`,
  PRODUCT_REMOVE_TAG: (id: string, tagId: string) =>
    `/products/${id}/tags/${tagId}`,

  // Images
  PRODUCT_IMAGES: (id: string) => `/products/${id}/images`,
  PRODUCT_IMAGE_DETAIL: (id: string, imageId: string) =>
    `/products/${id}/images/${imageId}`,

  // Variants
  PRODUCT_VARIANTS: (id: string) => `/products/${id}/variants`,
  PRODUCT_VARIANT_DETAIL: (id: string, variantId: string) =>
    `/products/${id}/variants/${variantId}`,

  // User Routes
  GET_ALL_USERS: '/users',
  GENERATE_USER: '/users',
  GET_USERS_STATISTICS: '/users/stats',
  GET_USER_DETAIL: (id: string) => `/users/${id}`,
  UPDATE_USER: (id: string) => `/users/${id}`,
  DELETE_USER: (id: string) => `/users/${id}`,
  TOGGLE_USER_STATUS: (id: string) => `/users/${id}/toggle-status`,

  // 2FA Routes
  SETUP_2FA: '/auth/2fa/setup',
  ENABLE_2FA: '/auth/2fa/enable',
  DISABLE_2FA: '/auth/2fa/disable',

  // Account Routes
  PROFILE: '/me',
  UPDATE_PROFILE: '/me',

  // CHAT ENDPOINTS
  CHAT: '/chat',
  CHAT_CONVERSATIONS: '/chat/conversations',
  CHAT_CONVERSATION_DETAIL: (id: string) => `/chat/conversations/${id}`,
  DELETE_CONVERSATION: (id: string) => `/chat/conversations/${id}`,

  CHAT_STREAM: '/chat/messages/stream',
  CHAT_CONVERSATION_STREAM: (id: string) =>
    `/chat/conversations/${id}/messages/stream`,

  // Notification Endpoints
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_STATS: '/notifications/stats',
  NOTIFICATION_MARK_READ: '/notifications/mark-read',
  NOTIFICATION_MARK_ALL_READ: '/notifications/mark-all-read',
  NOTIFICATION_WS_TICKET: '/notifications/ws-ticket',
} as const

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD'

export type UserStatus = 'ACTIVE' | 'INACTIVE'

export type UserRole = 'ADMIN' | 'CUSTOMER' | 'SELLER'
