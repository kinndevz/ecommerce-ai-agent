import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'
import type {
  ApiSuccessResponse,
  BatchPresignedUrlData,
  DeleteFileRequest,
  PresignedUploadFileRequest,
  PresignedUploadFilesRequest,
  PresignedUrlData,
  UploadedFileData,
} from './types/media.types'

// MEDIA API METHODS
export const mediaAPI = {
  uploadFiles: async (
    formData: FormData
  ): Promise<ApiSuccessResponse<UploadedFileData[]>> => {
    const { data } = await api.post<ApiSuccessResponse<UploadedFileData[]>>(
      API_ENDPOINT.MEDIA_UPLOAD_FILES,
      formData
    )
    return data
  },

  getPresignedUrl: async (
    requestData: PresignedUploadFileRequest
  ): Promise<ApiSuccessResponse<PresignedUrlData>> => {
    const { data } = await api.post<ApiSuccessResponse<PresignedUrlData>>(
      API_ENDPOINT.MEDIA_PRESIGNED_URL,
      requestData
    )
    return data
  },

  getPresignedUrls: async (
    requestData: PresignedUploadFilesRequest
  ): Promise<ApiSuccessResponse<BatchPresignedUrlData[]>> => {
    const { data } = await api.post<
      ApiSuccessResponse<BatchPresignedUrlData[]>
    >(API_ENDPOINT.MEDIA_PRESIGNED_URLS, requestData)
    return data
  },

  deleteFile: async (fileUrl: string): Promise<ApiSuccessResponse<null>> => {
    const { data } = await api.delete<ApiSuccessResponse<null>>(
      API_ENDPOINT.MEDIA_DELETE_FILE,
      {
        data: { file_url: fileUrl } as DeleteFileRequest,
      }
    )
    return data
  },
}

export type {
  PresignedUploadFileRequest,
  PresignedUploadFilesRequest,
  DeleteFileRequest,
  UploadedFileData,
  PresignedUrlData,
  BatchPresignedUrlData,
  ApiSuccessResponse,
} from './types/media.types'
