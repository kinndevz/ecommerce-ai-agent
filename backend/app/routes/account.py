from fastapi import APIRouter, Depends
from app.models.user import User
from app.services.account import AccountService
from app.schemas.account import (
    UserProfileResponse,
    UpdateUserProfileRequest,
    ChangePasswordRequest
)
from app.utils.deps import get_current_active_user
from app.db.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(tags=["Account"])


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return AccountService.get_my_profile(db, user_id=current_user.id)


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(updated_data: UpdateUserProfileRequest,
                      current_user: User = Depends(get_current_active_user),
                      db: Session = Depends(get_db)):
    return AccountService.update_profile(db, current_user.id, updated_data)


@router.put("/change-password")
def change_my_password(password_data: ChangePasswordRequest,
                       current_user: User = Depends(get_current_active_user),
                       db: Session = Depends(get_db)):
    return AccountService.change_password(db, current_user.id, password_data)
