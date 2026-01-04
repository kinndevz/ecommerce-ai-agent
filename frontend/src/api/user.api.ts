import api from '@/lib/api'
import {
  API_ENDPOINT,
  type HTTPMethod,
  type UserRole,
  type UserStatus,
} from './services/constants'

interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}
export interface Permission {
  id: string
  name: string
  description: string
  path: string
  method: HTTPMethod
  module: string
}

export interface Role {
  id: string
  name: string
  description: string
  is_active: boolean
  permissions: Permission[]
}

interface UserIncludeRole {
  id: string
  name: string
  description: string
  permissions?: Permission[]
}

export interface User {
  id: string
  email: string
  full_name: string
  phone_number: string | null
  avatar: string | null
  status: UserStatus
  is_2fa_enabled: boolean
  role: UserIncludeRole
  created_at: string
  updated_at: string
  created_by_id: string | null
  updated_by_id: string | null
}

//  Request Interfaces
export interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  phone_number?: string | null
  role_id: string
  status?: UserStatus
}

export interface UpdateUserRequest {
  full_name?: string | null
  phone_number?: string | null
  avatar?: string | null
  role_id?: string | null
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: UserStatus
  role?: UserRole
}

export interface UserRoleStats {
  [key: string]: number
}
export interface UserStats {
  total_users: number
  active_users: number
  inactive_users: number
  users_with_2fa: number
  users_by_role: UserRoleStats
}

// Response Wrappers
export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface UserListResponse {
  success: boolean
  message: string
  data: User[]
  meta: PaginationMeta
}

// USER API METHODS
export const userAPI = {
  getAll: async (params?: UserQueryParams): Promise<UserListResponse> => {
    const { data } = await api.get<UserListResponse>(
      API_ENDPOINT.GET_ALL_USERS,
      { params }
    )
    return data
  },

  getStats: async (): Promise<ApiSuccessResponse<UserStats>> => {
    const { data } = await api.get<ApiSuccessResponse<UserStats>>(
      `${API_ENDPOINT.GET_USERS_STATISTICS}`
    )
    return data
  },

  getById: async (id: string): Promise<ApiSuccessResponse<User>> => {
    const { data } = await api.get<ApiSuccessResponse<User>>(
      `${API_ENDPOINT.GET_USER_DETAIL(id)}`
    )
    return data
  },

  create: async (
    createData: CreateUserRequest
  ): Promise<ApiSuccessResponse<User>> => {
    const { data } = await api.post<ApiSuccessResponse<User>>(
      API_ENDPOINT.GENERATE_USER,
      createData
    )
    return data
  },

  update: async (
    id: string,
    updateData: UpdateUserRequest
  ): Promise<ApiSuccessResponse<User>> => {
    const { data } = await api.put<ApiSuccessResponse<User>>(
      `${API_ENDPOINT.UPDATE_USER(id)}`,
      updateData
    )
    return data
  },

  delete: async (id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.DELETE_USER(id)}`
    )
    return data
  },

  toggleStatus: async (
    id: string,
    status: UserStatus
  ): Promise<ApiSuccessResponse<User>> => {
    const { data } = await api.put<ApiSuccessResponse<User>>(
      `${API_ENDPOINT.TOGGLE_USER_STATUS(id)}`,
      { status }
    )
    return data
  },
}

export type { PaginationMeta, UserIncludeRole }
