import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  MergeTagsData,
  MergeTagsRequest,
  MessageResponse,
  TagCreateRequest,
  TagData,
  TagListData,
  TagStats,
  TagUpdateRequest,
} from './types/tag.types'

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
} from './types/tag.types'
