import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  CreateUserRequest,
  PaginationMeta,
  Permission,
  Role,
  UpdateUserRequest,
  User,
  UserIncludeRole,
  UserListResponse,
  UserQueryParams,
  UserRoleStats,
  UserStats,
} from './types/user.types'

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

export type {
  PaginationMeta,
  UserIncludeRole,
  Permission,
  Role,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  UserRoleStats,
  UserStats,
  ApiSuccessResponse,
  UserListResponse,
} from './types/user.types'
