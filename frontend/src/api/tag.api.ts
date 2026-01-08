import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

// REQUEST INTERFACES
interface TagCreateRequest {
  name: string
  slug: string
}

interface TagUpdateRequest {
  name?: string
  slug?: string
}

interface MergeTagsRequest {
  source_tag_id: string
  target_tag_id: string
}

// RESPONSE DATA INTERFACES
interface TagData {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
  usage_count?: number
}

interface TagStats {
  total_tags: number
  most_used_tags: Array<{
    name: string
    product_count: number
  }>
  unused_tags_count: number
}

interface TagListData {
  tags: TagData[]
  total: number
}

interface MergeTagsData {
  products_affected: number
  target_tag: {
    id: string
    name: string
    slug: string
  }
}

// RESPONSE WRAPPERS
interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

interface MessageResponse {
  success: boolean
  message: string
}

// TAG API METHODS
export const tagAPI = {
  // Public endpoints
  getAll: async (): Promise<ApiSuccessResponse<TagListData>> => {
    const { data } = await api.get<ApiSuccessResponse<TagListData>>(
      API_ENDPOINT.TAGS
    )
    return data
  },

  getPopular: async (
    limit: number = 10
  ): Promise<ApiSuccessResponse<TagListData>> => {
    const { data } = await api.get<ApiSuccessResponse<TagListData>>(
      API_ENDPOINT.TAG_POPULAR,
      { params: { limit } }
    )
    return data
  },

  getById: async (id: string): Promise<ApiSuccessResponse<TagData>> => {
    const { data } = await api.get<ApiSuccessResponse<TagData>>(
      API_ENDPOINT.TAG_DETAIL(id)
    )
    return data
  },

  getBySlug: async (slug: string): Promise<ApiSuccessResponse<TagData>> => {
    const { data } = await api.get<ApiSuccessResponse<TagData>>(
      API_ENDPOINT.TAG_BY_SLUG(slug)
    )
    return data
  },

  // Admin endpoints
  getStats: async (): Promise<ApiSuccessResponse<TagStats>> => {
    const { data } = await api.get<ApiSuccessResponse<TagStats>>(
      API_ENDPOINT.TAG_STATS
    )
    return data
  },

  create: async (
    createData: TagCreateRequest
  ): Promise<ApiSuccessResponse<TagData>> => {
    const { data } = await api.post<ApiSuccessResponse<TagData>>(
      API_ENDPOINT.TAGS,
      createData
    )
    return data
  },

  update: async (
    id: string,
    updateData: TagUpdateRequest
  ): Promise<ApiSuccessResponse<TagData>> => {
    const { data } = await api.put<ApiSuccessResponse<TagData>>(
      API_ENDPOINT.TAG_DETAIL(id),
      updateData
    )
    return data
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await api.delete<MessageResponse>(
      API_ENDPOINT.TAG_DETAIL(id)
    )
    return data
  },

  merge: async (
    sourceTagId: string,
    targetTagId: string
  ): Promise<ApiSuccessResponse<MergeTagsData>> => {
    const { data } = await api.post<ApiSuccessResponse<MergeTagsData>>(
      API_ENDPOINT.TAG_MERGE,
      null,
      {
        params: {
          source_tag_id: sourceTagId,
          target_tag_id: targetTagId,
        },
      }
    )
    return data
  },
}

export type {
  TagCreateRequest,
  TagUpdateRequest,
  MergeTagsRequest,
  TagData,
  TagStats,
  TagListData,
  MergeTagsData,
  ApiSuccessResponse,
  MessageResponse,
}
