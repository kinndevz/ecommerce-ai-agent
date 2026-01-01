from pydantic import BaseModel, Field, field_validator
from typing import List


class BaseConfig:
    from_attributes = True


class PresignedUploadFileRequest(BaseModel):
    """
    Request body for presigned URL generation
    """
    filename: str = Field(..., min_length=1, description="Original filename")
    filesize: int = Field(..., ge=1, le=5*1024*1024,
                          description="File size in bytes (max 5MB)")

    @field_validator('filename')
    def validate_filename(cls, v):
        """Validate filename has extension"""
        if '.' not in v:
            raise ValueError("Filename must have extension")
        return v

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "filename": "document.pdf",
                "filesize": 1024000
            }
        }


class PresignedUploadFilesRequest(BaseModel):
    """Request presigned URLs for multiple files"""
    files: List[dict] = Field(..., max_items=10,
                              description="Array of {filename, filesize}")
