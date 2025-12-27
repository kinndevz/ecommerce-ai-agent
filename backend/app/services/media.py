import uuid
import os
from typing import List
from fastapi import UploadFile
from app.services.s3 import s3_service
from app.utils.responses import ResponseHandler


class MediaService:
    """
    Media Service for file upload operations
    """

    ALLOWED_IMAGE_TYPES = {
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/gif'
    }

    ALLOWED_DOCUMENT_TYPES = {
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # .xlsx
        'text/plain',
        'text/csv'
    }

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    @staticmethod
    async def upload_files(files: List[UploadFile]) -> dict:
        """
        Upload multiple files to S3

        Args:
            files: List of uploaded files

        Returns:
            List of URLs
        """

        if len(files) > 100:
            ResponseHandler.bad_request("Maximum 100 files per request")

        results = []

        for file in files:
            # Validate file
            MediaService._validate_file(file)

            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"

            # Determine folder based on content type
            folder = MediaService._get_folder_by_content_type(
                file.content_type)
            s3_key = f"{folder}/{unique_filename}"

            # Read file content
            content = await file.read()

            # Upload to S3
            url = s3_service.upload_file(
                filename=s3_key,
                file_content=content,
                content_type=file.content_type
            )

            results.append({"url": url})

        return {
            "success": True,
            "message": f"{len(results)} file(s) uploaded successfully",
            "data": results
        }

    @staticmethod
    def get_presigned_url(filename: str, filesize: int) -> dict:
        """
        Generate presigned URL for client-side upload
        Args:
            filename: Original filename
            filesize: File size in bytes

        Returns:
            Presigned URL and final URL
        """

        # Validate file size
        if filesize > MediaService.MAX_FILE_SIZE:
            ResponseHandler.bad_request(
                f"File too large (max {MediaService.MAX_FILE_SIZE / 1024 / 1024}MB)")

        # Generate random filename
        file_extension = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Determine folder
        content_type = MediaService._guess_content_type(filename)
        folder = MediaService._get_folder_by_content_type(content_type)
        s3_key = f"{folder}/{unique_filename}"

        # Generate presigned URL
        presigned_url = s3_service.create_presigned_url(
            filename=s3_key,
            expires_in=60  # 1 minute
        )

        # Get final URL (without query params)
        url = presigned_url.split('?')[0]

        return {
            "success": True,
            "message": "Presigned URL generated successfully",
            "data": {
                "presigned_url": presigned_url,
                "url": url,
                "expires_in": 60
            }
        }

    @staticmethod
    def _validate_file(file: UploadFile):
        """Validate uploaded file"""

        # Check content type
        all_allowed_types = MediaService.ALLOWED_IMAGE_TYPES | MediaService.ALLOWED_DOCUMENT_TYPES

        if file.content_type not in all_allowed_types:
            allowed = ', '.join(all_allowed_types)
            ResponseHandler.bad_request(
                f"Invalid file type. Allowed types: {allowed}"
            )

    @staticmethod
    def _get_folder_by_content_type(content_type: str) -> str:
        """Determine S3 folder based on content type"""

        if content_type in MediaService.ALLOWED_IMAGE_TYPES:
            return "images"
        elif content_type in MediaService.ALLOWED_DOCUMENT_TYPES:
            return "documents"
        else:
            return "files"

    @staticmethod
    def _guess_content_type(filename: str) -> str:
        """Guess content type from filename"""
        import mimetypes
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or 'application/octet-stream'


media_service = MediaService()
