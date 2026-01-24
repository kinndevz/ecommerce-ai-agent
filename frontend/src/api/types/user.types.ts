import type { HTTPMethod, UserRole, UserStatus } from '../services/constants'

export interface PaginationMeta {
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

export interface UserIncludeRole {
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
