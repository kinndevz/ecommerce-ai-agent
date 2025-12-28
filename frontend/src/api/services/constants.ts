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

  // Brand Routes
  GET_ALL_BRANDS: '/brands',
  GET_BRAND_DETAIL: (id: string) => `/brands/${id}`,
  GET_BRAND_STATISTICS: '/brands/stats',
  GENERATE_BRAND: '/brands',
  UPDATE_BRAND: (id: string) => `/brands/${id}`,
  DELETE_BRAND: (id: string) => `/brands/${id}`,
  TOGGLE_BRAND_STATUS: (id: string) => `/brands/${id}/toggle-status`,

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
