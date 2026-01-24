export interface CreateBrandRequest {
  name: string
  slug: string
  description?: string | null
  country?: string | null
  website_url?: string | null
  logo_url?: string | null
}

export type UpdateBrandRequest = Partial<CreateBrandRequest>

export interface BrandQueryParams {
  include_inactive?: boolean
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  country: string | null
  website_url: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  product_count: number
}

export interface BrandListData {
  brands: Brand[]
  total: number
}

export interface BrandStats {
  total_brands: number
  active_brands: number
  inactive_brands: number
  top_brands: Array<{
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
