import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { setAccessToken, clearAccessToken } from '@/api/services/token.service'
import {
  authAPI,
  type ForgotPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type SendOTPRequest,
  type UserProfile,
} from '@/api/auth.api'

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  sendOTP: (data: SendOTPRequest) => Promise<void>
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>

  refetchUser: () => Promise<void>
  updateUser: (user: UserProfile) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const fetchUser = useCallback(async () => {
    try {
      const userData = await authAPI.getProfile()
      setUser(userData)

      if (import.meta.env.DEV) {
        console.log('[Auth] User fetched:', userData.email)
      }
    } catch (error: any) {
      console.error('[Auth] Failed to fetch user:', error)
      clearAccessToken()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchUser().finally(() => {
      setIsLoading(false)
    })
  }, [fetchUser])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)

      const response = await authAPI.login(credentials)

      setAccessToken(response.data.access_token)

      await fetchUser()

      toast.success('Login successful! Welcome back! 🎉')

      navigate('/home')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(errorMessage)

      console.error('[Auth] Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (registerData: RegisterRequest) => {
    try {
      setIsLoading(true)

      await authAPI.register(registerData)

      toast.success('Registration successful! Please login.')

      navigate('/login')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      toast.error(errorMessage)

      console.error('[Auth] Register error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sendOTP = async (otpData: SendOTPRequest) => {
    try {
      const response = await authAPI.sendOTP(otpData)
      toast.success(response.message || 'OTP sent to your email!')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send OTP.'
      toast.error(errorMessage)
      throw error
    }
  }

  const forgotPassword = async (resetData: ForgotPasswordRequest) => {
    try {
      const response = await authAPI.forgotPassword(resetData)
      toast.success(response.message || 'Password reset successful!')
      navigate('/login')
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Password reset failed.'
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('[Auth] Logout error:', error)
    } finally {
      clearAccessToken()

      setUser(null)

      navigate('/login')

      toast.success('Logged out successfully. See you soon! 👋')
    }
  }

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,

    login,
    register,
    logout,
    sendOTP,
    forgotPassword,
    refetchUser: fetchUser,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
