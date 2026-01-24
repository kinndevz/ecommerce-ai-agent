import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  Category,
  CategoryListData,
  CategoryQueryParams,
  CategoryStats,
  CategoryTreeNode,
  CreateCategoryRequest,
  MoveCategoryRequest,
  UpdateCategoryRequest,
} from './types/category.types'

// CATEGORY API METHODS
export const categoryAPI = {
  getAll: async (
    params?: CategoryQueryParams
  ): Promise<ApiSuccessResponse<CategoryListData>> => {
    const { data } = await api.get<ApiSuccessResponse<CategoryListData>>(
      API_ENDPOINT.GET_ALL_CATEGORIES,
      {
        params: {
          include_inactive: false,
          ...params,
        },
      }
    )
    return data
  },

  getTreeStructure: async (
    params?: CategoryQueryParams
  ): Promise<ApiSuccessResponse<CategoryTreeNode[]>> => {
    const { data } = await api.get<ApiSuccessResponse<CategoryTreeNode[]>>(
      API_ENDPOINT.GET_CATEGORY_TREE,
      { params }
    )
    return data
  },

  getStats: async (): Promise<ApiSuccessResponse<CategoryStats>> => {
    const { data } = await api.get<ApiSuccessResponse<CategoryStats>>(
      API_ENDPOINT.GET_CATEGORY_STATISTICS
    )
    return data
  },

  getById: async (id: string): Promise<ApiSuccessResponse<Category>> => {
    const { data } = await api.get<ApiSuccessResponse<Category>>(
      `${API_ENDPOINT.GET_CATEGORY_DETAIL(id)}`
    )
    return data
  },

  create: async (
    createData: CreateCategoryRequest
  ): Promise<ApiSuccessResponse<Category>> => {
    const { data } = await api.post<ApiSuccessResponse<Category>>(
      API_ENDPOINT.GENERATE_CATEGORY,
      createData
    )
    return data
  },

  update: async (
    id: string,
    updateData: UpdateCategoryRequest
  ): Promise<ApiSuccessResponse<Category>> => {
    const { data } = await api.put<ApiSuccessResponse<Category>>(
      `${API_ENDPOINT.UPDATE_CATEGORY(id)}`,
      updateData
    )
    return data
  },

  delete: async (id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.DELETE_CATEGORY(id)}`
    )
    return data
  },

  toggleStatus: async (id: string): Promise<ApiSuccessResponse<Category>> => {
    const { data } = await api.patch<ApiSuccessResponse<Category>>(
      `${API_ENDPOINT.TOGGLE_CATEGORY_STATUS(id)}`
    )
    return data
  },

  move: async (
    id: string,
    moveData: MoveCategoryRequest
  ): Promise<ApiSuccessResponse<Category>> => {
    const { data } = await api.patch<ApiSuccessResponse<Category>>(
      `${API_ENDPOINT.MOVE_CATEGORY(id)}`,
      moveData
    )
    return data
  },
}

export type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  MoveCategoryRequest,
  CategoryQueryParams,
  Category,
  CategoryTreeNode,
  CategoryListData,
  CategoryStats,
  ApiSuccessResponse,
} from './types/category.types'
