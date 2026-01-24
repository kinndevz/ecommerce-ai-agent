export interface LoginRequest {
  email: string
  password: string
  totp_code?: string
  otp_code?: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirm_password: string
  full_name: string
  phone_number?: string
  code: string
}

export interface ForgotPasswordRequest {
  email: string
  code: string
  new_password: string
}

export interface SendOTPRequest {
  email: string
  type: 'REGISTER' | 'FORGOT_PASSWORD' | 'LOGIN' | 'DISABLE_2FA'
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    token_type: string
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string | null
  avatar: string | null
  status: string
  is_2fa_enabled: boolean
  role: {
    id: string
    name: string
    description: string
    permissions?: Array<{
      id: string
      name: string
      method: string
      path: string
    }>
  }
  created_at: string
  updated_at: string
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}
