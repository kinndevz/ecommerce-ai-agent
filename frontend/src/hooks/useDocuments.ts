import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  documentAPI,
  type UploadDocumentRequest,
  type FAQSearchRequest,
  type DocumentResponse,
} from '@/api/document.api'
import { toast } from 'sonner'

// QUERY KEYS
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  faqSearch: (params: FAQSearchRequest) =>
    [...documentKeys.all, 'faqSearch', params] as const,
}

// QUERY HOOKS

/**
 * Get all active documents (Admin view).
 */
export function useAllDocuments() {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: () => documentAPI.getAllDocuments(),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Perform semantic search over active document chunks (FAQ search).
 */
export function useFAQSearch(params: FAQSearchRequest) {
  return useQuery({
    queryKey: documentKeys.faqSearch(params),
    queryFn: () => documentAPI.searchFAQ(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled: !!params.query,
  })
}

// MUTATION HOOKS

/**
 * Upload a new document or a new version of an existing group.
 */
export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => documentAPI.uploadDocument(formData),
    onSuccess: (response: DocumentResponse) => {
      toast.success(response.message || 'Tải lên tài liệu thành công!')
      queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Không thể tải lên tài liệu, vui lòng thử lại.'
      )
    },
  })
}

/**
 * Deactivate a document and all its chunks.
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => documentAPI.deleteDocument(documentId),
    onSuccess: (response) => {
      toast.success(response.message || 'Đã xóa tài liệu thành công!')
      queryClient.invalidateQueries({
        queryKey: documentKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: documentKeys.faqSearch({ query: '', limit: 0 }),
        refetchType: 'all',
      })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          'Không thể xóa tài liệu, vui lòng thử lại.'
      )
    },
  })
}
