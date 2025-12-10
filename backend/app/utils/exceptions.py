from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError


async def http_exception_handler(request: Request, exc):
    """Handle HTTPException with consistent format"""
    # Check if detail is already formatted
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )

    # Format detail as error response
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with custom format"""
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        message = error["msg"]
        errors[field] = message

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors
        }
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors (unique constraint, foreign key, etc.)"""
    error_msg = str(exc.orig)

    # Parse common errors
    if "unique constraint" in error_msg.lower():
        message = "A record with this value already exists"
    elif "foreign key" in error_msg.lower():
        message = "Referenced record does not exist"
    else:
        message = "Database integrity error"

    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "success": False,
            "message": message
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle generic SQLAlchemy errors"""

    print("⚠️ SQLAlchemy ERROR:", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Database error occurred"
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected error occurred"
        }
    )
