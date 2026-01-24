export interface TagCreateRequest {
  name: string
  slug: string
}

export interface TagUpdateRequest {
  name?: string
  slug?: string
}

export interface MergeTagsRequest {
  source_tag_id: string
  target_tag_id: string
}

export interface TagData {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
  usage_count?: number
}

export interface TagStats {
  total_tags: number
  most_used_tags: Array<{
    name: string
    product_count: number
  }>
  unused_tags_count: number
}

export interface TagListData {
  tags: TagData[]
  total: number
}

export interface MergeTagsData {
  products_affected: number
  target_tag: {
    id: string
    name: string
    slug: string
  }
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface MessageResponse {
  success: boolean
  message: string
}
