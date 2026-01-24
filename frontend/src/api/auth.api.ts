import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  SendOTPRequest,
  UserProfile,
} from './types/auth.types'

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
} from './types/auth.types'
