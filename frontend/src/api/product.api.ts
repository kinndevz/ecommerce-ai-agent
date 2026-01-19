import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import { SkinType, SkinConcern, ProductBenefit } from './services/enums'

// REQUEST INTERFACES
interface ProductQueryParams {
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

interface SearchQueryParams {
  q?: string
  min_price?: number
  max_price?: number
  page?: number
  limit?: number
}

// Sub-inputs for Create/Update
interface ProductImageInput {
  image_url: string
  alt_text?: string | null
  is_primary?: boolean
  display_order?: number
}

interface ProductVariantInput {
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

interface CreateProductRequest {
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

interface UpdateProductRequest
  extends Partial<Omit<CreateProductRequest, 'images' | 'variants'>> {}

interface AddTagsRequest {
  tag_ids: string[]
}

interface UpdateStockRequest {
  quantity: number
}

interface ProductImageCreateRequest extends ProductImageInput {}

interface ProductImageUpdateRequest {
  alt_text?: string | null
  is_primary?: boolean | null
  display_order?: number | null
}

interface ProductVariantCreateRequest extends ProductVariantInput {}

interface ProductVariantUpdateRequest extends Partial<ProductVariantInput> {
  is_available?: boolean | null
}

// RESPONSE DATA INTERFACES
interface BrandSimple {
  id: string
  name: string
  slug: string
}

interface CategorySimple {
  id: string
  name: string
  slug: string
}

interface TagSimple {
  id: string
  name: string
  slug: string
  color?: string | null
}

interface ProductImageData {
  id: string
  image_url: string
  alt_text?: string | null
  is_primary: boolean
  display_order: number
}

interface ProductVariantData {
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

interface ProductListItem {
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

interface ProductDetail {
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

interface ProductStats {
  total_products: number
  available_products: number
  out_of_stock: number
  featured_products: number
  average_price: number
  top_rated_products: any[]
  top_viewed_products: any[]
}

interface ProductListData {
  products: ProductListItem[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// RESPONSE WRAPPERS
interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// PRODUCT API METHODS
export const productAPI = {
  search: async (
    params?: SearchQueryParams
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_SEARCH,
      { params }
    )
    return data
  },

  getAll: async (
    params?: ProductQueryParams
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCTS,
      { params }
    )
    return data
  },

  getStats: async (): Promise<ApiSuccessResponse<ProductStats>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductStats>>(
      API_ENDPOINT.PRODUCT_STATS
    )
    return data
  },

  getById: async (id: string): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_DETAIL(id)
    )
    return data
  },

  create: async (
    createData: CreateProductRequest
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.post<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCTS,
      createData
    )
    return data
  },

  update: async (
    id: string,
    updateData: UpdateProductRequest
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.put<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_DETAIL(id),
      updateData
    )
    return data
  },

  delete: async (id: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.PRODUCT_DETAIL(id)
    )
    return data
  },

  //  Stock & Toggles
  updateStock: async (
    id: string,
    quantity: number
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.patch<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_UPDATE_STOCK(id),
      { quantity } as UpdateStockRequest
    )
    return data
  },

  getLowStock: async (
    threshold: number = 10
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_LOW_STOCK,
      { params: { threshold } }
    )
    return data
  },

  getOutOfStock: async (): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_OUT_OF_STOCK
    )
    return data
  },

  toggleAvailability: async (
    id: string
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.patch<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_TOGGLE_AVAILABILITY(id)
    )
    return data
  },

  toggleFeatured: async (
    id: string
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.patch<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_TOGGLE_FEATURED(id)
    )
    return data
  },

  //  Discovery
  getFeatured: async (
    limit: number = 10
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_FEATURED,
      { params: { limit } }
    )
    return data
  },

  getTrending: async (
    days: number = 7,
    limit: number = 10
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_TRENDING,
      { params: { days, limit } }
    )
    return data
  },

  getNewArrivals: async (
    days: number = 30,
    limit: number = 10
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_NEW_ARRIVALS,
      { params: { days, limit } }
    )
    return data
  },

  getOnSale: async (
    limit: number = 20
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_ON_SALE,
      { params: { limit } }
    )
    return data
  },

  getByBrand: async (
    brandSlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_BY_BRAND(brandSlug),
      { params: { page, limit } }
    )
    return data
  },

  getByCategory: async (
    categorySlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_BY_CATEGORY(categorySlug),
      { params: { page, limit } }
    )
    return data
  },

  getRelated: async (
    productId: string,
    limit: number = 5
  ): Promise<ApiSuccessResponse<ProductListData>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductListData>>(
      API_ENDPOINT.PRODUCT_RELATED(productId),
      { params: { limit } }
    )
    return data
  },

  //  Tags
  addTags: async (
    id: string,
    tagIds: string[]
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.post<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_TAGS(id),
      { tag_ids: tagIds } as AddTagsRequest
    )
    return data
  },

  removeTag: async (
    id: string,
    tagId: string
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.delete<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_REMOVE_TAG(id, tagId)
    )
    return data
  },

  //  Images
  addImage: async (
    id: string,
    imageData: ProductImageCreateRequest
  ): Promise<ApiSuccessResponse<ProductImageData>> => {
    const { data } = await api.post<ApiSuccessResponse<ProductImageData>>(
      API_ENDPOINT.PRODUCT_IMAGES(id),
      imageData
    )
    return data
  },

  updateImage: async (
    id: string,
    imageId: string,
    imageData: ProductImageUpdateRequest
  ): Promise<ApiSuccessResponse<ProductImageData>> => {
    const { data } = await api.patch<ApiSuccessResponse<ProductImageData>>(
      API_ENDPOINT.PRODUCT_IMAGE_DETAIL(id, imageId),
      imageData
    )
    return data
  },

  deleteImage: async (
    id: string,
    imageId: string
  ): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.PRODUCT_IMAGE_DETAIL(id, imageId)
    )
    return data
  },

  //  Variants

  getVariants: async (
    id: string
  ): Promise<ApiSuccessResponse<Record<string, any>>> => {
    const { data } = await api.get<ApiSuccessResponse<Record<string, any>>>(
      API_ENDPOINT.PRODUCT_VARIANTS(id)
    )
    return data
  },

  addVariant: async (
    id: string,
    variantData: ProductVariantCreateRequest
  ): Promise<ApiSuccessResponse<ProductVariantData>> => {
    const { data } = await api.post<ApiSuccessResponse<ProductVariantData>>(
      API_ENDPOINT.PRODUCT_VARIANTS(id),
      variantData
    )
    return data
  },

  updateVariant: async (
    id: string,
    variantId: string,
    variantData: ProductVariantUpdateRequest
  ): Promise<ApiSuccessResponse<ProductVariantData>> => {
    const { data } = await api.put<ApiSuccessResponse<ProductVariantData>>(
      API_ENDPOINT.PRODUCT_VARIANT_DETAIL(id, variantId),
      variantData
    )
    return data
  },

  deleteVariant: async (
    id: string,
    variantId: string
  ): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.PRODUCT_VARIANT_DETAIL(id, variantId)
    )
    return data
  },
}

export type {
  ProductQueryParams,
  SearchQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
  ProductImageInput,
  ProductVariantInput,
  AddTagsRequest,
  UpdateStockRequest,
  ProductImageCreateRequest,
  ProductImageUpdateRequest,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest,
  ProductListItem,
  ProductDetail,
  ProductStats,
  ProductImageData,
  ProductVariantData,
  ProductListData,
  BrandSimple,
  CategorySimple,
  TagSimple,
  ApiSuccessResponse,
}
