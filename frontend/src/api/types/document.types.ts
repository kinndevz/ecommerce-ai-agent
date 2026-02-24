export interface UploadDocumentRequest {
  title: string
  description: string | null
  document_group_id: string | null
}

export interface FAQSearchRequest {
  query: string
  limit: number
}

export interface DocumentBase {
  id: string
  title: string
  description: string | null
  file_type: string
  file_size: string | null
  s3_url: string
  document_group_id: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FAQSearchResult {
  content: string
  document_title: string
  version: number
  similarity: number
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface DocumentResponse extends ApiSuccessResponse<DocumentBase> {}

export interface DocumentListResponse
  extends ApiSuccessResponse<DocumentBase[]> {}

export interface FAQSearchResponse
  extends ApiSuccessResponse<FAQSearchResult[]> {}
