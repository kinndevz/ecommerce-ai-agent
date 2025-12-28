import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from typing import BinaryIO, Optional
import mimetypes
from app.core.config import settings


class S3Service:
    """
    AWS S3 Service for file operations
    """

    def __init__(self):
        """Initialize S3 client"""
        self.s3_client = boto3.client(
            's3',
            region_name=settings.S3_REGION,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4'),
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    def upload_file(
        self,
        filename: str,
        file_content: bytes,
        content_type: str
    ) -> str:
        """
        Upload file to S3

        Args:
            filename: S3 key (path in bucket)
            file_content: File bytes
            content_type: MIME type

        Returns:
            Public URL of uploaded file
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=file_content,
                ContentType=content_type,
                CacheControl='max-age=31536000',  # 1 year
            )

            # Generate public URL
            url = f"https://{self.bucket_name}.s3.{settings.S3_REGION}.amazonaws.com/{filename}"

            print(f">>>>Uploaded: {url}")
            return url

        except ClientError as e:
            print(f"S3 Upload Error: {e}")
            raise Exception(f"Failed to upload file: {str(e)}")

    def create_presigned_url(
        self,
        filename: str,
        expires_in: int = 60  # 1 minute default
    ) -> str:
        """
        Create presigned URL for client-side upload

        Args:
            filename: S3 key
            expires_in: URL expiration in seconds

        Returns:
            Presigned URL
        """
        try:
            # Detect content type from filename
            content_type = mimetypes.guess_type(
                filename)[0] or 'application/octet-stream'

            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': filename,
                    'ContentType': content_type
                },
                ExpiresIn=expires_in,
                HttpMethod='PUT'
            )

            return presigned_url

        except ClientError as e:
            print(f"Presigned URL Error: {e}")
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

    def delete_file(self, filename: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=filename
            )
            return True
        except ClientError as e:
            print(f"S3 Delete Error: {e}")
            return False

    def get_file_url(self, filename: str) -> str:
        """Get public URL for a file"""
        return f"https://{self.bucket_name}.s3.{settings.S3_REGION}.amazonaws.com/{filename}"


s3_service = S3Service()
