import uuid
import os
from typing import List
from fastapi import UploadFile
from app.services.s3 import s3_service
from app.utils.responses import ResponseHandler


class MediaService:
    # File type constraints
    ALLOWED_IMAGE_TYPES = {
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/gif'
    }

    ALLOWED_DOCUMENT_TYPES = {
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
    }

    # Size and count limits
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_FILE_SIZE_MB = 5
    MAX_UPLOAD_COUNT = 100
    MAX_PRESIGNED_COUNT = 10
    PRESIGNED_URL_EXPIRES_IN = 300  # 5 minutes

    @staticmethod
    async def upload_files(files: List[UploadFile]) -> dict:
        # Validate count
        if len(files) > MediaService.MAX_UPLOAD_COUNT:
            ResponseHandler.too_many_files(MediaService.MAX_UPLOAD_COUNT)

        results = []

        for file in files:
            # Validate file type
            MediaService._validate_file_type(file)

            # Generate S3 key
            s3_key = MediaService._generate_s3_key(
                file.filename, file.content_type)

            # Read file content
            content = await file.read()

            # Upload to S3
            url = s3_service.upload_file(
                filename=s3_key,
                file_content=content,
                content_type=file.content_type
            )

            results.append({"url": url})

        return ResponseHandler.files_uploaded_success(len(results), results)

    @staticmethod
    def get_presigned_url(filename: str, filesize: int) -> dict:
        # Validate file size
        if filesize > MediaService.MAX_FILE_SIZE:
            ResponseHandler.file_too_large(MediaService.MAX_FILE_SIZE_MB)

        # Generate S3 key
        content_type = MediaService._guess_content_type(filename)
        s3_key = MediaService._generate_s3_key(filename, content_type)

        # Generate presigned URL
        presigned_url = s3_service.create_presigned_url(
            filename=s3_key,
            expires_in=MediaService.PRESIGNED_URL_EXPIRES_IN
        )

        # Get final URL (without query params)
        final_url = presigned_url.split('?')[0]

        data = {
            "presigned_url": presigned_url,
            "url": final_url,
            "expires_in": MediaService.PRESIGNED_URL_EXPIRES_IN
        }

        return ResponseHandler.presigned_url_generated_success(data)

    @staticmethod
    def get_presigned_urls(files: List[dict]) -> dict:
        # Validate count
        if len(files) > MediaService.MAX_PRESIGNED_COUNT:
            ResponseHandler.too_many_files(MediaService.MAX_PRESIGNED_COUNT)

        results = []

        for file_info in files:
            filename = file_info.get('filename', '')
            filesize = file_info.get('filesize', 0)

            # Validate file size
            if filesize > MediaService.MAX_FILE_SIZE:
                ResponseHandler.file_too_large(
                    MediaService.MAX_FILE_SIZE_MB,
                    filename
                )

            # Generate S3 key
            content_type = MediaService._guess_content_type(filename)
            s3_key = MediaService._generate_s3_key(filename, content_type)

            # Generate presigned URL
            presigned_url = s3_service.create_presigned_url(
                filename=s3_key,
                expires_in=MediaService.PRESIGNED_URL_EXPIRES_IN
            )

            # Get final URL
            final_url = presigned_url.split('?')[0]

            results.append({
                "presigned_url": presigned_url,
                "url": final_url,
                "original_filename": filename,
                "expires_in": MediaService.PRESIGNED_URL_EXPIRES_IN
            })

        return ResponseHandler.presigned_urls_generated_success(len(results), results)

    #  PRIVATE HELPER METHODS

    @staticmethod
    def _validate_file_type(file: UploadFile):
        all_allowed_types = MediaService.ALLOWED_IMAGE_TYPES | MediaService.ALLOWED_DOCUMENT_TYPES

        if file.content_type not in all_allowed_types:
            ResponseHandler.invalid_file_type(all_allowed_types)

    @staticmethod
    def _generate_s3_key(filename: str, content_type: str) -> str:
        # Extract extension
        file_extension = os.path.splitext(filename)[1]

        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Determine folder
        folder = MediaService._get_folder_by_content_type(content_type)

        # Combine into S3 key
        return f"{folder}/{unique_filename}"

    @staticmethod
    def _get_folder_by_content_type(content_type: str) -> str:
        if content_type in MediaService.ALLOWED_IMAGE_TYPES:
            return "images"
        elif content_type in MediaService.ALLOWED_DOCUMENT_TYPES:
            return "documents"
        else:
            return "files"

    @staticmethod
    def _guess_content_type(filename: str) -> str:
        import mimetypes
        content_type, _ = mimetypes.guess_type(filename)
        return content_type or 'application/octet-stream'


media_service = MediaService()
