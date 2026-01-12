from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.models.role import Role
from app.models.user import User
from app.utils.responses import ResponseHandler
from app.schemas.users import UserCreateRequest, UserUpdateRequest
from app.core.enums import UserStatus
from app.core.security import hash_password
from datetime import datetime, timezone
import uuid
from typing import Optional


class UserService:
    @staticmethod
    def get_all_users(
        db: Session,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        role: Optional[str] = None,
        status: Optional[str] = None
    ):
        """
       Get list of users with pagination and filters
       """

        # Base query
        query = db.query(User).options(joinedload(User.role)).filter(
            User.deleted_at.is_(None)
        )

        if search:
            query = query.filter(
                or_(
                    User.full_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )

        if role:
            query = query.join(Role).filter(Role.name == role)

        if status:
            query = query.filter(User.status == status)

        total = query.count()

        # Paginate
        users = query.order_by(User.created_at.desc()).offset(
            (page - 1) * limit
        ).limit(limit).all()

        return ResponseHandler.get_list_success(
            resource_name="Users",
            data=users,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def get_user(db: Session, user_id: str):
        """Get user by ID"""
        user = db.query(User).options(
            joinedload(User.role)
        ).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        if not user:
            ResponseHandler.not_found_error("User", user_id)

        return ResponseHandler.get_single_success("User", user_id, user)

    @staticmethod
    def create_user(db: Session, data: UserCreateRequest, created_by_id: str):
        """
        Create new user (Admin only)
        """

        # Check if email exists
        user_existed = db.query(User).filter(User.email == data.email).first()
        if user_existed:
            ResponseHandler.already_exists_error("User", "email")

        # Check if role exists
        role = db.query(Role).filter(
            Role.id == data.role_id,
            Role.deleted_at.is_(None)
        ).first()
        if not role:
            ResponseHandler.not_found_error("Role", data.role_id)

        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email=data.email,
            password=hash_password(data.password),
            full_name=data.full_name,
            phone_number=data.phone_number,
            role_id=data.role_id,
            status=data.status,
            created_by_id=created_by_id
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Reload with role
        user = db.query(User).options(joinedload(User.role)).filter(
            User.id == user.id
        ).first()

        return ResponseHandler.create_success("User", user.id, user)

    @staticmethod
    def update_user(db: Session, user_id: str, data: UserUpdateRequest, updated_by_id: str):
        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        if not user:
            ResponseHandler.not_found_error("User", user_id)

        # Update fields
        updated_data = data.model_dump(exclude_unset=True)
        for key, value in updated_data.items():
            setattr(user, key, value)

        user.updated_by_id = updated_by_id
        user.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(user)

        # Reload with role
        user = db.query(User).options(joinedload(User.role)).filter(
            User.id == user.id
        ).first()

        return ResponseHandler.update_success("User", user_id, user)

    @staticmethod
    def delete_user(
        db: Session,
        user_id: str,
        deleted_by_id: str
    ):
        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        if not user:
            ResponseHandler.not_found_error("User", user_id)

        # Cannot delete self
        if user_id == deleted_by_id:
            ResponseHandler.bad_request("You cannot delete yourself")

        # Soft delete
        user.deleted_at = datetime.now(timezone.utc)
        user.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("User", user_id)

    @staticmethod
    def toggle_status(
        db: Session,
        user_id: str,
        updated_by_id: str
    ):
        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        if not user:
            ResponseHandler.not_found_error("User", user_id)

        # Cannot toggle self
        if user_id == updated_by_id:
            ResponseHandler.bad_request("You cannot change your own status")

        # Toggle status
        user.status = (
            UserStatus.INACTIVE
            if user.status == UserStatus.ACTIVE
            else UserStatus.ACTIVE
        )
        user.updated_by_id = updated_by_id
        user.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(user)

        # Reload with role
        user = db.query(User).options(joinedload(User.role)).filter(
            User.id == user.id
        ).first()

        return ResponseHandler.success(
            message=f"User status changed to {user.status}",
            data=user
        )

    @staticmethod
    def get_user_stats(db: Session):
        """Get user statistics"""

        total = db.query(func.count(User.id)).filter(
            User.deleted_at.is_(None)).scalar()
        active = db.query(func.count(User.id)).filter(
            User.deleted_at.is_(None),
            User.status == UserStatus.ACTIVE
        ).scalar()
        inactive = total - active
        with_2fa = db.query(func.count(User.id)).filter(
            User.deleted_at.is_(None),
            User.is_2fa_enabled == True
        ).scalar()

        # By role
        role_stats = db.query(
            Role.name,
            func.count(User.id).label('count')
        ).join(User).filter(
            User.deleted_at.is_(None)
        ).group_by(Role.name).all()

        stats = {
            "total_users": total,
            "active_users": active,
            "inactive_users": inactive,
            "users_with_2fa": with_2fa,
            "users_by_role": {role: count for role, count in role_stats}
        }

        return ResponseHandler.success("User statistics retrieved", stats)
