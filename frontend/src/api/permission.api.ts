import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  PermissionCreateRequest,
  PermissionData,
  PermissionListResponse,
  PermissionQueryParams,
  PermissionResponse,
  PermissionUpdateRequest,
  PermissionsByModuleResponse,
} from './types/permission.types'

//  PERMISSION API METHODS
export const permissionAPI = {
  /**
   * Get all permissions with optional filters
   * GET /roles/permissions/all
   */
  getAll: async (
    params?: PermissionQueryParams
  ): Promise<PermissionListResponse> => {
    const { data } = await api.get<PermissionListResponse>(
      API_ENDPOINT.PERMISSIONS_ALL,
      { params }
    )
    return data
  },

  /**
   * Get permissions grouped by module
   * GET /roles/permissions/grouped
   */
  getGroupedByModule: async (): Promise<PermissionsByModuleResponse> => {
    const { data } = await api.get<PermissionsByModuleResponse>(
      API_ENDPOINT.PERMISSIONS_GROUPED
    )
    return data
  },

  /**
   * Get permission by ID
   * GET /roles/permissions/{permission_id}
   */
  getById: async (id: string): Promise<PermissionResponse> => {
    const { data } = await api.get<PermissionResponse>(
      API_ENDPOINT.PERMISSIONS_DETAIL(id)
    )
    return data
  },

  /**
   * Create new permission
   * POST /roles/permissions
   */
  create: async (
    createData: PermissionCreateRequest
  ): Promise<PermissionResponse> => {
    const { data } = await api.post<PermissionResponse>(
      API_ENDPOINT.PERMISSIONS,
      createData
    )
    return data
  },

  /**
   * Update permission
   * PUT /roles/permissions/{permission_id}
   */
  update: async (
    id: string,
    updateData: PermissionUpdateRequest
  ): Promise<PermissionResponse> => {
    const { data } = await api.put<PermissionResponse>(
      API_ENDPOINT.PERMISSIONS_DETAIL(id),
      updateData
    )
    return data
  },

  /**
   * Delete permission
   * DELETE /roles/permissions/{permission_id}
   */
  delete: async (id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.PERMISSIONS_DETAIL(id)
    )
    return data
  },
}

export type {
  PermissionCreateRequest,
  PermissionUpdateRequest,
  PermissionQueryParams,
  PermissionData,
  PermissionsByModuleResponse,
  PermissionResponse,
  PermissionListResponse,
  ApiSuccessResponse,
  PermissionData as Permission,
} from './types/permission.types'
