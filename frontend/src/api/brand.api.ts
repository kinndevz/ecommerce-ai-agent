import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  Brand,
  BrandListData,
  BrandQueryParams,
  BrandStats,
  CreateBrandRequest,
  UpdateBrandRequest,
} from './types/brand.types'

// BRAND API METHODS
export const brandAPI = {
  getAll: async (
    params?: BrandQueryParams
  ): Promise<ApiSuccessResponse<BrandListData>> => {
    const { data } = await api.get<ApiSuccessResponse<BrandListData>>(
      API_ENDPOINT.GET_ALL_BRANDS,
      { params }
    )
    return data
  },

  getStats: async (): Promise<ApiSuccessResponse<BrandStats>> => {
    const { data } = await api.get<ApiSuccessResponse<BrandStats>>(
      API_ENDPOINT.GET_BRAND_STATISTICS
    )
    return data
  },

  getById: async (id: string): Promise<ApiSuccessResponse<Brand>> => {
    const { data } = await api.get<ApiSuccessResponse<Brand>>(
      `${API_ENDPOINT.GET_BRAND_DETAIL(id)}`
    )
    return data
  },

  create: async (
    createData: CreateBrandRequest
  ): Promise<ApiSuccessResponse<Brand>> => {
    const { data } = await api.post<ApiSuccessResponse<Brand>>(
      API_ENDPOINT.GENERATE_BRAND,
      createData
    )
    return data
  },

  update: async (
    id: string,
    updateData: UpdateBrandRequest
  ): Promise<ApiSuccessResponse<Brand>> => {
    const { data } = await api.put<ApiSuccessResponse<Brand>>(
      `${API_ENDPOINT.UPDATE_BRAND(id)}`,
      updateData
    )
    return data
  },

  // Delete Brand
  delete: async (id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.DELETE_BRAND(id)}`
    )
    return data
  },

  toggleStatus: async (id: string): Promise<ApiSuccessResponse<Brand>> => {
    const { data } = await api.patch<ApiSuccessResponse<Brand>>(
      `${API_ENDPOINT.TOGGLE_BRAND_STATUS(id)}`
    )
    return data
  },
}

export type {
  CreateBrandRequest,
  UpdateBrandRequest,
  BrandQueryParams,
  Brand,
  BrandListData,
  BrandStats,
  ApiSuccessResponse,
} from './types/brand.types'
