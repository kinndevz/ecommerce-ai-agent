from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.models.role import Role, Permission
from app.utils.responses import ResponseHandler
from app.schemas.account import UpdateUserProfileRequest, ChangePasswordRequest
from app.core.security import verify_password, hash_password


class AccountService:
    @staticmethod
    def get_my_profile(db: Session, user_id: str):
        """Get my profile"""
        user = db.query(User).options(
            joinedload(User.role).joinedload(Role.permissions)
        ).filter(User.id == user_id, User.deleted_at.is_(None)).first()
        if not user:
            ResponseHandler.not_found_error("User", user_id)
        return ResponseHandler.get_single_success(user.full_name, user.id, data=user)

    @staticmethod
    def update_profile(db: Session, user_id: str, updated_data: UpdateUserProfileRequest):
        """Update my profile"""
        user = db.query(User).filter(
            User.id == user_id,
            User.deleted_at.is_(None)
        ).first()

        if not user:
            ResponseHandler.not_found_error("User")

        # Update fields if provided
        if updated_data.full_name is not None:
            user.full_name = updated_data.full_name

        if updated_data.phone_number is not None:
            user.phone_number = updated_data.phone_number

        if updated_data.avatar is not None:
            user.avatar = updated_data.avatar

        db.commit()
        db.refresh(user)

        # Reload with relationships
        user = db.query(User).options(
            joinedload(User.role).joinedload(Role.permissions)
        ).filter(User.id == user_id).first()

        return ResponseHandler.update_success(
            user.full_name,
            user.id,
            data=user
        )

    @staticmethod
    def change_password(db: Session, user_id: str, password_data: ChangePasswordRequest):
        """Change my password"""
        # Validate passwords
        try:
            password_data.validate_passwords()
        except ValueError as e:
            ResponseHandler.bad_request(str(e))

        user = db.query(User).filter(
            User.id == user_id, User.deleted_at.is_(None)).first()

        if not user:
            ResponseHandler.not_found_error("User")

        # Verify old password
        if not verify_password(password_data.old_password, user.password):
            ResponseHandler.bad_request("Old password is incorrect")

        # Update password
        user.password = hash_password(password_data.new_password)
        db.commit()

        return ResponseHandler.success(
            message="Password changed successfully",
            data=None
        )
