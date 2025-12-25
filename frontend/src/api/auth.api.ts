import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
interface LoginRequest {
  email: string
  password: string
  totp_code?: string
  otp_code?: string
}

interface RegisterRequest {
  email: string
  password: string
  confirm_password: string
  full_name: string
  phone_number?: string
  code: string
}

interface ForgotPasswordRequest {
  email: string
  code: string
  new_password: string
}

interface SendOTPRequest {
  email: string
  type: 'REGISTER' | 'FORGOT_PASSWORD' | 'LOGIN' | 'DISABLE_2FA'
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    access_token: string
    token_type: string
  }
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string | null
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

interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// AUTH API METHODS
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
      API_ENDPOINT.LOGIN,
      credentials
    )
    return data
  },

  register: async (
    registerData: RegisterRequest
  ): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>(
      API_ENDPOINT.REGISTER,
      registerData
    )
    return data
  },

  sendOTP: async (otpData: SendOTPRequest): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>(
      API_ENDPOINT.SEND_OTP,
      otpData
    )
    return data
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API_ENDPOINT.REFRESH)
    return data
  },

  logout: async (): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>(API_ENDPOINT.LOGOUT)
    return data
  },

  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<ApiSuccessResponse<UserProfile>>(
      API_ENDPOINT.PROFILE
    )
    return data.data
  },

  updateProfile: async (
    profileData: Partial<UserProfile>
  ): Promise<ApiSuccessResponse> => {
    const { data } = await api.put<ApiSuccessResponse>(
      API_ENDPOINT.UPDATE_PROFILE,
      profileData
    )
    return data
  },

  forgotPassword: async (
    resetData: ForgotPasswordRequest
  ): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>(
      API_ENDPOINT.FORGOT_PASSWORD,
      resetData
    )
    return data
  },

  // 2FA Methods
  setup2FA: async (): Promise<
    ApiSuccessResponse<{ secret: string; uri: string }>
  > => {
    const { data } = await api.post<
      ApiSuccessResponse<{ secret: string; uri: string }>
    >(API_ENDPOINT.SETUP_2FA)
    return data
  },

  enable2FA: async (totpCode: string): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>(
      API_ENDPOINT.ENABLE_2FA,
      { totp_code: totpCode }
    )
    return data
  },

  disable2FA: async (
    totpCode?: string,
    otpCode?: string
  ): Promise<ApiSuccessResponse> => {
    const { data } = await api.post<ApiSuccessResponse>(
      API_ENDPOINT.DISABLE_2FA,
      { totp_code: totpCode, code: otpCode }
    )
    return data
  },
}

export type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  SendOTPRequest,
  AuthResponse,
  UserProfile,
  ApiSuccessResponse,
}
