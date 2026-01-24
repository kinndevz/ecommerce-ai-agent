export interface PresignedUploadFileRequest {
  filename: string
  filesize: number
}

export interface FileConfig {
  filename: string
  filesize: number
}

export interface PresignedUploadFilesRequest {
  files: FileConfig[]
}

export interface DeleteFileRequest {
  file_url: string
}

export interface UploadedFileData {
  url: string
}

export interface PresignedUrlData {
  presigned_url: string
  url: string
  expires_in: number
}

export interface BatchPresignedUrlData extends PresignedUrlData {
  filename?: string
  [key: string]: any
}

export interface ApiSuccessResponse<T = any> {
  success: boolean
  message: string
  data: T
}
