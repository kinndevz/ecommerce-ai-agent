from pydantic import BaseModel
from typing import Optional
from app.schemas.users import RoleOut
from datetime import datetime
from app.core.constant import UserStatus

# ========== User Profile Schema ==========


class AccountBase(BaseModel):
    """User profile with full role & permissions"""
    id: str
    email: str
    full_name: str
    phone_number: Optional[str]
    avatar: Optional[str]
    status: UserStatus
    is_2fa_enabled: bool
    role: RoleOut
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Update User Schema ==========
class UpdateUserProfileRequest(BaseModel):
    """Update user profile request"""
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = None


# ========== Change Password Schema ==========
class ChangePasswordRequest(BaseModel):
    """Change password request"""
    old_password: str
    new_password: str
    confirm_new_password: str

    def validate_passwords(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match")
        if self.old_password == self.new_password:
            raise ValueError(
                "New password must be different from old password")
        return True


# ========== Response Wrapper ==========

class UserProfileResponse(BaseModel):
    """Wrapped response for user profile"""
    success: bool
    message: str
    data: AccountBase
