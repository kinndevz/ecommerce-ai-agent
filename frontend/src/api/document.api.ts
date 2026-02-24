import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  DocumentListResponse,
  DocumentResponse,
  FAQSearchRequest,
  FAQSearchResponse,
} from './types/document.types'

export const documentAPI = {
  uploadDocument: async (formData: FormData): Promise<DocumentResponse> => {
    const { data } = await api.post<DocumentResponse>(
      API_ENDPOINT.DOCUMENTS,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return data
  },

  getAllDocuments: async (): Promise<DocumentListResponse> => {
    const { data } = await api.get<DocumentListResponse>(API_ENDPOINT.DOCUMENTS)
    return data
  },

  deleteDocument: async (
    documentId: string
  ): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      `${API_ENDPOINT.DOCUMENT_DETAIL(documentId)}`
    )
    return data
  },

  searchFAQ: async (
    requestData: FAQSearchRequest
  ): Promise<FAQSearchResponse> => {
    const { data } = await api.post<FAQSearchResponse>(
      API_ENDPOINT.DOCUMENTS_SEARCH,
      requestData
    )
    return data
  },
}

export type {
  UploadDocumentRequest,
  FAQSearchRequest,
  DocumentBase,
  FAQSearchResult,
  DocumentResponse,
  DocumentListResponse,
  FAQSearchResponse,
  ApiSuccessResponse,
} from './types/document.types'
