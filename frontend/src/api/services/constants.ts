export const API_ENDPOINT = {
  // Auth Routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  SEND_OTP: '/auth/otp',

  // 2FA Routes
  SETUP_2FA: '/auth/2fa/setup',
  ENABLE_2FA: '/auth/2fa/enable',
  DISABLE_2FA: '/auth/2fa/disable',

  // User Routes
  PROFILE: '/me',
  UPDATE_PROFILE: '/me',
} as const
