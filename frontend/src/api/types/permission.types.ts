export interface PermissionCreateRequest {
  name: string
  description?: string
  path: string
  method: string
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
  method?: string
}

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
