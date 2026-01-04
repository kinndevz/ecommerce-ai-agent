import api from '@/lib/api'
import type { Permission } from './user.api'
import { API_ENDPOINT } from './services/constants'

// REQUEST INTERFACES
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

// RESPONSE DATA INTERFACES
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

// RESPONSE WRAPPERS
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

// ROLE API METHODS
export const roleAPI = {
  /**
   * Get all roles with optional filters
   * GET /roles
   */
  getAll: async (
    params?: RoleQueryParams
  ): Promise<RoleListResponse | RoleListWithPermissionsResponse> => {
    const { data } = await api.get<
      RoleListResponse | RoleListWithPermissionsResponse
    >(API_ENDPOINT.ROLES, { params })
    return data
  },

  /**
   * Get active roles only (for dropdowns)
   * GET /roles?is_active=true
   */
  getActive: async (): Promise<RoleListResponse> => {
    const { data } = await api.get<RoleListResponse>(API_ENDPOINT.ROLES, {
      params: { is_active: true, limit: 100 },
    })
    return data
  },

  /**
   * Get role statistics
   * GET /roles/stats
   */
  getStats: async (): Promise<RoleStatsResponse> => {
    const { data } = await api.get<RoleStatsResponse>(API_ENDPOINT.ROLE_STATS)
    return data
  },

  /**
   * Get role by ID
   * GET /roles/{role_id}
   */
  getById: async (id: string): Promise<RoleResponse> => {
    const { data } = await api.get<RoleResponse>(API_ENDPOINT.ROLE_DETAIL(id))
    return data
  },

  /**
   * Create new role
   * POST /roles
   */
  create: async (createData: RoleCreateRequest): Promise<RoleResponse> => {
    const { data } = await api.post<RoleResponse>(
      API_ENDPOINT.ROLES,
      createData
    )
    return data
  },

  /**
   * Update role
   * PUT /roles/{role_id}
   */
  update: async (
    id: string,
    updateData: RoleUpdateRequest
  ): Promise<RoleResponse> => {
    const { data } = await api.put<RoleResponse>(
      API_ENDPOINT.ROLE_DETAIL(id),
      updateData
    )
    return data
  },

  /**
   * Delete role
   * DELETE /roles/{role_id}
   */
  delete: async (id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.ROLE_DETAIL(id)
    )
    return data
  },

  /**
   * Assign permissions to role
   * POST /roles/{role_id}/permissions/assign
   */
  assignPermissions: async (
    id: string,
    permissions: AssignPermissionsRequest
  ): Promise<RoleResponse> => {
    const { data } = await api.post<RoleResponse>(
      API_ENDPOINT.ROLE_ASSIGN_PERMISSIONS(id),
      permissions
    )
    return data
  },

  /**
   * Remove permissions from role
   * POST /roles/{role_id}/permissions/remove
   */
  removePermissions: async (
    id: string,
    permissions: RemovePermissionsRequest
  ): Promise<RoleResponse> => {
    const { data } = await api.post<RoleResponse>(
      API_ENDPOINT.ROLE_REMOVE_PERMISSIONS(id),
      permissions
    )
    return data
  },
}

export type { RoleData as Role, RoleDetailData as RoleDetail }
