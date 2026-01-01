from pydantic import BaseModel, Field
from typing import List


class BaseConfig:
    from_attributes = True


class UploadedFileData(BaseModel):
    """Single uploaded file data"""
    url: str

    class Config(BaseConfig):
        pass


class PresignedUrlData(BaseModel):
    """Presigned URL data"""
    presigned_url: str = Field(...,
                               description="Presigned URL for PUT request")
    url: str = Field(..., description="Final public URL after upload")
    expires_in: int = Field(..., description="Expiration time in seconds")

    class Config(BaseConfig):
        pass


class UploadFilesResponse(BaseModel):
    """
    Response for file upload
    """
    success: bool
    message: str
    data: List[UploadedFileData]

    class Config(BaseConfig):
        pass


class PresignedUploadFileResponse(BaseModel):
    """
    Response for presigned URL
    """
    success: bool
    message: str
    data: PresignedUrlData

    class Config(BaseConfig):
        pass


class PresignedUploadFilesResponse(BaseModel):
    """Presigned URLs for multiple files"""
    success: bool
    message: str
    data: List[dict]
