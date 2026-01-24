import type { Permission } from './user.types'

export interface RoleCreateRequest {
  name: string
  description?: string
  is_active?: boolean
  permission_ids?: string[]
}

export interface RoleUpdateRequest {
  name?: string
  description?: string
  is_active?: boolean
  permission_ids?: string[]
}

export interface AssignPermissionsRequest {
  permission_ids: string[]
}

export interface RemovePermissionsRequest {
  permission_ids: string[]
}

export interface RoleQueryParams {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
  include_permissions?: boolean
}

export interface RoleData {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by_id?: string | null
  updated_by_id?: string | null
}

export interface RoleDetailData extends RoleData {
  permissions: Permission[]
}

export interface RoleStats {
  total_roles: number
  active_roles: number
  inactive_roles: number
  roles_by_user_count: {
    [key: string]: number
  }
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface RoleResponse {
  success: boolean
  message: string
  data: RoleDetailData
}

export interface RoleListResponse {
  success: boolean
  message: string
  data: RoleData[]
  meta?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface RoleListWithPermissionsResponse {
  success: boolean
  message: string
  data: RoleDetailData[]
  meta?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface RoleStatsResponse {
  success: boolean
  message: string
  data: RoleStats
}
