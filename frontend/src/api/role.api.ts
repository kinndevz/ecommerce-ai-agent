import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  AssignPermissionsRequest,
  RemovePermissionsRequest,
  RoleCreateRequest,
  RoleData,
  RoleDetailData,
  RoleListResponse,
  RoleListWithPermissionsResponse,
  RoleQueryParams,
  RoleResponse,
  RoleStats,
  RoleStatsResponse,
  RoleUpdateRequest,
} from './types/role.types'

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

export type {
  RoleCreateRequest,
  RoleUpdateRequest,
  AssignPermissionsRequest,
  RemovePermissionsRequest,
  RoleQueryParams,
  RoleData,
  RoleDetailData,
  RoleStats,
  RoleResponse,
  RoleListResponse,
  RoleListWithPermissionsResponse,
  RoleStatsResponse,
  ApiSuccessResponse,
  RoleData as Role,
  RoleDetailData as RoleDetail,
} from './types/role.types'
