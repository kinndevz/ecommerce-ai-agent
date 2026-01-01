import api from '@/lib/api'
import { API_ENDPOINT } from './services/constants'

// REQUEST INTERFACES
interface PresignedUploadFileRequest {
  filename: string
  filesize: number
}

interface FileConfig {
  filename: string
  filesize: number
}

interface PresignedUploadFilesRequest {
  files: FileConfig[]
}

interface DeleteFileRequest {
  file_url: string
}

// RESPONSE DATA INTERFACES
interface UploadedFileData {
  url: string
}

interface PresignedUrlData {
  presigned_url: string
  url: string
  expires_in: number
}

interface BatchPresignedUrlData extends PresignedUrlData {
  filename?: string
  [key: string]: any
}

// RESPONSE WRAPPERS
interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}

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
}
