export interface CreateCategoryRequest {
  parent_id?: string | null
  name: string
  slug: string
  description?: string | null
  image_url?: string | null
  display_order?: number
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface MoveCategoryRequest {
  new_parent_id?: string | null
}

export interface CategoryQueryParams {
  include_inactive?: boolean
}

export interface Category {
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

export interface CategoryTreeNode
  extends Omit<Category, 'product_count' | 'children_count' | 'created_at' | 'updated_at'> {
  product_count: number
  children: CategoryTreeNode[]
}

export interface CategoryListData {
  categories: Category[]
  total: number
}

export interface CategoryStats {
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

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}
