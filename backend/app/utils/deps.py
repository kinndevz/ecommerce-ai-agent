import logging
from fastapi import Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
from typing import Optional
from app.db.database import get_db
from app.core.security import verify_access_token
from app.models.user import User
from app.models.role import Role
from app.utils.responses import ResponseHandler
from app.utils.helper import match_path
from app.core.constant import UserRole

logger = logging.getLogger(__name__)
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials

    try:
        payload = verify_access_token(token)
        user_id = payload.get("user_id")

        if not user_id:
            ResponseHandler.invalid_credentials()

        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        if not user:
            ResponseHandler.not_found_error("User", user_id)

        return user

    except JWTError:
        ResponseHandler.invalid_token()


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if current_user.status != "ACTIVE":
        ResponseHandler.forbidden_error(message="Inactive User")
    return current_user


def require_role(required_role: str):
    """Dependency to check user role"""
    def role_checker(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
        role = db.query(Role).filter(Role.id == current_user.role_id).first()
        if not role or role.name != required_role:
            ResponseHandler.forbidden_error()
        return current_user
    return role_checker


def require_permission():
    """
    Dependency to check user permission automatically from request

    Usage:
        @router.get("/users")
        def get_users(
            current_user: User = Depends(require_permission())
        ):
            pass

    The path and method are automatically detected from the request.
    """
    def permission_checker(
        request: Request,
        current_user: User = Depends(get_current_active_user),
        db: Session = Depends(get_db)
    ):
        # Get path and method from request
        path = request.url.path
        method = request.method

        # Get user's role
        role = current_user.role

        if not role or role.deleted_at is not None:
            logger.warning(f"User {current_user.id} has no valid role")
            ResponseHandler.forbidden_error("No role assigned")

        # Check if role is active
        if not role.is_active:
            logger.warning(
                f"User {current_user.id} has inactive role: {role.name}")
            ResponseHandler.forbidden_error("Your role is inactive")

        # ADMIN bypass all permission checks
        if role.name == UserRole.ADMIN:
            logger.info(
                f"User {current_user.id} authorized as ADMIN for {method} {path}")
            return current_user

        # Check if user has the required permission
        has_permission = any(
            match_path(
                p.path, path) and p.method == method and p.deleted_at is None
            for p in role.permissions
        )

        if has_permission:
            logger.info(
                f"User {current_user.id} (role: {role.name}) "
                f"authorized: {method} {path}"
            )
            return current_user

        # Permission denied
        logger.warning(
            f"User {current_user.id} (role: {role.name}) "
            f"denied access: {method} {path}"
        )
        ResponseHandler.forbidden_error(
            f"You don't have permission to access this resource"
        )

    return permission_checker


# Optional: For public routes
def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if token exists, otherwise None"""
    if not authorization:
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None

        payload = verify_access_token(token)
        user_id = payload.get("user_id")

        if not user_id:
            return None

        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        return user

    except Exception:
        return None
