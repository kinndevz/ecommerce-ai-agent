import { ProductBenefit, SkinConcern, SkinType } from '../services/enums'

export interface ProductQueryParams {
  search?: string
  brand_id?: string
  category_id?: string
  min_price?: number
  max_price?: number
  skin_types?: SkinType[]
  concerns?: SkinConcern[]
  benefits?: ProductBenefit[]
  tags?: string[]
  is_featured?: boolean
  is_available?: boolean
  sort_by?: 'created_at' | 'price' | 'rating' | 'popularity' | 'name'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchQueryParams {
  q?: string
  min_price?: number
  max_price?: number
  page?: number
  limit?: number
}

export interface ProductImageInput {
  image_url: string
  alt_text?: string | null
  is_primary?: boolean
  display_order?: number
}

export interface ProductVariantInput {
  name: string
  sku: string
  price: number
  sale_price?: number | null
  stock_quantity: number
  size?: string | null
  size_unit?: string | null
  color?: string | null
  shade_name?: string | null
}

export interface CreateProductRequest {
  brand_id: string
  category_id: string
  name: string
  slug: string
  sku: string
  short_description?: string | null
  description?: string | null
  how_to_use?: string | null
  price: number
  sale_price?: number | null
  stock_quantity: number
  is_featured?: boolean
  skin_types?: SkinType[] | null
  concerns?: SkinConcern[] | null
  benefits?: ProductBenefit[] | null
  ingredients?: Record<string, any> | null
  tag_ids?: string[] | null
  images?: ProductImageInput[] | null
  variants?: ProductVariantInput[] | null
}

export interface UpdateProductRequest
  extends Partial<Omit<CreateProductRequest, 'images' | 'variants'>> {}

export interface AddTagsRequest {
  tag_ids: string[]
}

export interface UpdateStockRequest {
  quantity: number
}

export interface ProductImageCreateRequest extends ProductImageInput {}

export interface ProductImageUpdateRequest {
  alt_text?: string | null
  is_primary?: boolean | null
  display_order?: number | null
}

export interface ProductVariantCreateRequest extends ProductVariantInput {}

export interface ProductVariantUpdateRequest extends Partial<ProductVariantInput> {
  is_available?: boolean | null
}

export interface BrandSimple {
  id: string
  name: string
  slug: string
}

export interface CategorySimple {
  id: string
  name: string
  slug: string
}

export interface TagSimple {
  id: string
  name: string
  slug: string
  color?: string | null
}

export interface ProductImageData {
  id: string
  image_url: string
  alt_text?: string | null
  is_primary: boolean
  display_order: number
}

export interface ProductVariantData {
  id: string
  name: string
  sku: string
  price: number
  sale_price?: number | null
  stock_quantity: number
  is_available: boolean
  size?: string | null
  size_unit?: string | null
  color?: string | null
  shade_name?: string | null
}

export interface ProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  short_description?: string | null
  price: number
  sale_price?: number | null
  stock_quantity: number
  is_available: boolean
  is_featured: boolean
  rating_average: number
  review_count: number
  views_count: number
  brand: BrandSimple
  category: CategorySimple
  product_image?: string | null
  tags: TagSimple[]
}

export interface ProductDetail {
  id: string
  brand_id: string
  category_id: string
  name: string
  slug: string
  sku: string
  short_description?: string | null
  description?: string | null
  how_to_use?: string | null
  price: number
  sale_price?: number | null
  stock_quantity: number
  is_available: boolean
  is_featured: boolean
  rating_average: number
  review_count: number
  views_count: number
  skin_types?: SkinType[] | null
  concerns?: SkinConcern[] | null
  benefits?: ProductBenefit[] | null
  ingredients?: Record<string, any> | null
  created_at: string
  updated_at: string
  brand: BrandSimple
  category: CategorySimple
  images: ProductImageData[]
  variants: ProductVariantData[]
  tags: TagSimple[]
}

export interface ProductStats {
  total_products: number
  available_products: number
  out_of_stock: number
  featured_products: number
  average_price: number
  top_rated_products: any[]
  top_viewed_products: any[]
}

export interface ProductListMeta {
  total: number
  page: number
  limit: number
  total_pages: number
}

export type ProductListData = ProductListItem[]

export interface ApiSuccessResponse<T = any, M = undefined> {
  success: boolean
  message: string
  data: T
  meta?: M
}
