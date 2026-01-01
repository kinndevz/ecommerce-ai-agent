from fastapi import HTTPException, status
from typing import Any, Optional, Dict


class ResponseHandler:
    # ========== Success Responses ==========

    @staticmethod
    def success(message: str, data: Any = None, meta: Optional[Dict] = None):
        """Generic success response"""
        response = {
            "success": True,
            "message": message,
            "data": data
        }
        if meta:
            response["meta"] = meta
        return response

    @staticmethod
    def get_single_success(resource_name: str, resource_id: str, data: Any):
        """Response cho GET single resource"""
        message = f"{resource_name} retrieved successfully"
        return ResponseHandler.success(message, data)

    @staticmethod
    def get_list_success(resource_name: str, data: Any, total: int, page: int, limit: int):
        """Response cho GET list với pagination"""
        total_pages = (total + limit - 1) // limit  # Ceiling division
        meta = {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
        }
        message = f"{resource_name} list retrieved successfully"
        return ResponseHandler.success(message, data, meta)

    @staticmethod
    def create_success(resource_name: str, resource_id: str, data: Any):
        """Response cho POST (create)"""
        message = f"{resource_name} created successfully"
        return ResponseHandler.success(message, data)

    @staticmethod
    def update_success(resource_name: str, resource_id: str, data: Any):
        """Response cho PUT/PATCH (update)"""
        message = f"{resource_name} updated successfully"
        return ResponseHandler.success(message, data)

    @staticmethod
    def delete_success(resource_name: str, resource_id: str):
        """Response cho DELETE"""
        message = f"{resource_name} deleted successfully"
        return ResponseHandler.success(message, None)

    # ========== Error Responses ==========

    @staticmethod
    def error_response(message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        """Generic error response"""
        raise HTTPException(
            status_code=status_code,
            detail={
                "success": False,
                "message": message
            }
        )

    @staticmethod
    def not_found_error(resource_name: str = "Resource", resource_id: Optional[str] = None):
        """404 Not Found"""
        if resource_id:
            message = f"{resource_name} with id '{resource_id}' not found"
        else:
            message = f"{resource_name} not found"

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "message": message
            }
        )

    @staticmethod
    def already_exists_error(resource_name: str, field: str = ""):
        """409 Conflict - Resource already exists"""
        if field:
            message = f"{resource_name} with this {field} already exists"
        else:
            message = f"{resource_name} already exists"

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "success": False,
                "message": message
            }
        )

    @staticmethod
    def invalid_credentials():
        """401 Unauthorized - Invalid credentials"""
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Invalid credentials"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    @staticmethod
    def invalid_token(token_type: str = "access"):
        """401 Unauthorized - Invalid token"""
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": f"Invalid {token_type} token"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    @staticmethod
    def expired_token(token_type: str = "access"):
        """401 Unauthorized - Expired token"""
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": f"{token_type.capitalize()} token has expired"
            },
            headers={"WWW-Authenticate": "Bearer"}
        )

    @staticmethod
    def forbidden_error(message: str = "You don't have permission to perform this action"):
        """403 Forbidden"""
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": message
            }
        )

    @staticmethod
    def validation_error(message: str, errors: Optional[Dict] = None):
        """422 Unprocessable Entity - Validation error"""
        detail = {
            "success": False,
            "message": message
        }
        if errors:
            detail["errors"] = errors

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )

    @staticmethod
    def bad_request(message: str):
        """400 Bad Request"""
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": message
            }
        )

    @staticmethod
    def internal_error(message: str = "Internal server error"):
        """500 Internal Server Error"""
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": message
            }
        )

    # ========== Auth Specific ==========

    @staticmethod
    def otp_sent_success(email: str):
        """OTP sent success"""
        return ResponseHandler.success(
            message=f"OTP has been sent to {email}",
            data={"email": email}
        )

    @staticmethod
    def invalid_otp():
        """Invalid OTP"""
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Invalid or expired OTP code"
            }
        )

    @staticmethod
    def account_inactive():
        """Account inactive"""
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "Your account is inactive. Please contact support."
            }
        )

    @staticmethod
    def password_changed_success():
        """Password changed"""
        return ResponseHandler.success(
            message="Password changed successfully",
            data=None
        )

    @staticmethod
    def logout_success():
        """Logout success"""
        return ResponseHandler.success(
            message="Logged out successfully",
            data=None
        )

    # ========== E-commerce Specific ==========

    @staticmethod
    def out_of_stock(product_name: str):
        """Product out of stock"""
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": f"{product_name} is currently out of stock"
            }
        )

    @staticmethod
    def insufficient_stock(product_name: str, available: int):
        """Insufficient stock"""
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": f"Only {available} units of {product_name} available"
            }
        )

    @staticmethod
    def order_created_success(order_number: str, data: Any):
        """Order created"""
        return ResponseHandler.success(
            message=f"Order {order_number} created successfully",
            data=data
        )

    @staticmethod
    def payment_required():
        """Payment required"""
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "success": False,
                "message": "Payment required to complete this order"
            }
        )

    # ========== Media/Upload Specific ==========

    @staticmethod
    def files_uploaded_success(count: int, data: list):
        """Files uploaded successfully"""
        return ResponseHandler.success(
            message=f"{count} file(s) uploaded successfully",
            data=data
        )

    @staticmethod
    def presigned_url_generated_success(data: dict):
        """Single presigned URL generated"""
        return ResponseHandler.success(
            message="Presigned URL generated successfully",
            data=data
        )

    @staticmethod
    def presigned_urls_generated_success(count: int, data: list):
        """Multiple presigned URLs generated"""
        return ResponseHandler.success(
            message=f"{count} presigned URL(s) generated successfully",
            data=data
        )

    @staticmethod
    def file_deleted_success():
        """File deleted successfully"""
        return ResponseHandler.success(
            message="File deleted successfully",
            data=None
        )

    @staticmethod
    def invalid_file_type(allowed_types: set):
        """Invalid file type"""
        allowed = ', '.join(sorted(allowed_types))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": f"Invalid file type. Allowed types: {allowed}"
            }
        )

    @staticmethod
    def file_too_large(max_size_mb: int, filename: str = None):
        """File too large"""
        if filename:
            message = f"File '{filename}' too large (max {max_size_mb}MB)"
        else:
            message = f"File too large (max {max_size_mb}MB)"

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": message
            }
        )

    @staticmethod
    def too_many_files(max_count: int):
        """Too many files in request"""
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": f"Maximum {max_count} files per request"
            }
        )
