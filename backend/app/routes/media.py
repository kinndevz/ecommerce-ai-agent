from fastapi import APIRouter, Depends, UploadFile, File, Body
from typing import List
from app.models.user import User
from app.utils.deps import require_permission
from app.services.media import media_service
from app.schemas.media import (
    PresignedUploadFileRequest,
    UploadFilesResponse,
    PresignedUploadFileResponse,
    PresignedUploadFilesResponse,
    PresignedUploadFilesRequest
)
from app.services.s3 import s3_service
from app.utils.responses import ResponseHandler

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/images/upload", response_model=UploadFilesResponse)
async def upload_files(
    files: List[UploadFile] = File(
        ...,
        description="Multiple files (max 100, each max 5MB)"
    ),
    current_user: User = Depends(require_permission())
):

    return await media_service.upload_files(files)


@router.post("/images/upload/presigned-url", response_model=PresignedUploadFileResponse)
async def create_presigned_url(
    body: PresignedUploadFileRequest,
    current_user: User = Depends(require_permission())
):
    return media_service.get_presigned_url(
        filename=body.filename,
        filesize=body.filesize
    )


@router.delete("/file")
async def delete_file(
    file_url: str = Body(..., embed=True, description="Full S3 URL"),
    current_user: User = Depends(require_permission())
):

    # Extract S3 key from URL
    key = file_url.split('.amazonaws.com/')[-1]
    success = s3_service.delete_file(key)

    if success:
        return {
            "success": True,
            "message": "File deleted successfully"
        }
    else:
        ResponseHandler.bad_request("Failed to delete file")


@router.post("/images/upload/presigned-urls", response_model=PresignedUploadFilesResponse)
async def create_presigned_urls(
    body: PresignedUploadFilesRequest,
    current_user: User = Depends(require_permission())
):
    return media_service.get_presigned_urls(body.files)
