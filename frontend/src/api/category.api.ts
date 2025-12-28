import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

// Request Interfaces
interface CreateCategoryRequest {
  parent_id?: string | null
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  display_order?: number
}

interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

interface MoveCategoryRequest {
  new_parent_id?: string | null
}

interface CategoryQueryParams {
  include_inactive?: boolean
}

// Response Data Interfaces
interface Category {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  product_count: number
  children_count: number
}

interface CategoryTreeNode
  extends Omit<
    Category,
    'product_count' | 'children_count' | 'created_at' | 'updated_at'
  > {
  product_count: number
  children: CategoryTreeNode[]
}

interface CategoryListData {
  categories: Category[]
  total: number
}

interface CategoryStats {
  total_categories: number
  active_categories: number
  parent_categories: number
  child_categories: number
  top_categories: Array<{
    name: string
    product_count: number
    [key: string]: any
  }>
}

// Response Wrappers
interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

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
}
