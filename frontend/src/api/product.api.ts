import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  AddTagsRequest,
  ApiSuccessResponse,
  CreateProductRequest,
  ProductDetail,
  ProductImageCreateRequest,
  ProductImageData,
  ProductImageUpdateRequest,
  ProductListData,
  ProductListMeta,
  ProductQueryParams,
  ProductStats,
  ProductVariantCreateRequest,
  ProductVariantData,
  ProductVariantUpdateRequest,
  SearchQueryParams,
  UpdateProductRequest,
  UpdateStockRequest,
} from './types/product.types'

// PRODUCT API METHODS
export const productAPI = {
  search: async (
    params?: SearchQueryParams
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_SEARCH, { params })
    return data
  },

  getAll: async (
    params?: ProductQueryParams
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCTS, { params })
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

  getBySlug: async (
    slug: string
  ): Promise<ApiSuccessResponse<ProductDetail>> => {
    const { data } = await api.get<ApiSuccessResponse<ProductDetail>>(
      API_ENDPOINT.PRODUCT_DETAIL_SLUG(slug)
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
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_LOW_STOCK, { params: { threshold } })
    return data
  },

  getOutOfStock: async (): Promise<
    ApiSuccessResponse<ProductListData, ProductListMeta>
  > => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_OUT_OF_STOCK)
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
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_FEATURED, { params: { limit } })
    return data
  },

  getTrending: async (
    days: number = 7,
    limit: number = 10
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_TRENDING, { params: { days, limit } })
    return data
  },

  getNewArrivals: async (
    days: number = 30,
    limit: number = 10
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_NEW_ARRIVALS, { params: { days, limit } })
    return data
  },

  getOnSale: async (
    limit: number = 20
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_ON_SALE, { params: { limit } })
    return data
  },

  getByBrand: async (
    brandSlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_BY_BRAND(brandSlug), { params: { page, limit } })
    return data
  },

  getByCategory: async (
    categorySlug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_BY_CATEGORY(categorySlug), {
      params: { page, limit },
    })
    return data
  },

  getRelated: async (
    productId: string,
    limit: number = 5
  ): Promise<ApiSuccessResponse<ProductListData, ProductListMeta>> => {
    const { data } = await api.get<
      ApiSuccessResponse<ProductListData, ProductListMeta>
    >(API_ENDPOINT.PRODUCT_RELATED(productId), { params: { limit } })
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
  ProductListMeta,
  BrandSimple,
  CategorySimple,
  TagSimple,
  ApiSuccessResponse,
} from './types/product.types'
