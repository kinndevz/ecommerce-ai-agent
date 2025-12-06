from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.models.role import Role
from app.models.user import User
from app.utils.responses import ResponseHandler
from app.schemas.users import UserCreateRequest
from app.core.security import hash_password, verify_password
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
