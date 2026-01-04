import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

//  REQUEST INTERFACES
export interface PermissionCreateRequest {
  name: string
  description?: string
  path: string
  method: string // GET, POST, PUT, DELETE, PATCH
  module?: string
}

export interface PermissionUpdateRequest {
  name?: string
  description?: string
  module?: string
}

export interface PermissionQueryParams {
  page?: number
  limit?: number
  search?: string
  module?: string
  method?: string // GET, POST, PUT, DELETE, PATCH
}

//  RESPONSE DATA INTERFACES
export interface PermissionData {
  id: string
  name: string
  description: string
  path: string
  method: string
  module: string
  created_at: string
  updated_at: string
}

export interface PermissionsByModule {
  [moduleName: string]: PermissionData[]
}

//  RESPONSE WRAPPERS
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

export interface PermissionResponse {
  success: boolean
  message: string
  data: PermissionData
}

export interface PermissionListResponse {
  success: boolean
  message: string
  data: PermissionData[]
  meta?: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface PermissionsByModuleResponse {
  success: boolean
  message: string
  data: PermissionsByModule
}

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

export type { PermissionData as Permission }
