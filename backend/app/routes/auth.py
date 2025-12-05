from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import *
from app.services.auth import AuthService
from app.utils.deps import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register new user account"""
    return AuthService.register(
        db=db,
        register=data
    )


@router.post("/otp")
def send_otp(
    data: SendOTPRequest,
    db: Session = Depends(get_db)
):
    """Send OTP to email for verification"""
    return AuthService.send_otp(db, data.email, data.type)


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login with email and password"""

    return AuthService.login(
        db=db,
        loginRequest=data
    )


@router.post("/refresh")
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    return AuthService.refresh_token_handler(
        db=db,
        refresh_token=data.refresh_token,
    )


@router.post("/logout")
def logout(
    data: LogoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Logout user and invalidate refresh token"""
    return AuthService.logout(db, data.refresh_token)


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password using OTP"""
    return AuthService.forgot_password(
        db=db,
        email=data.email,
        code=data.code,
        new_password=data.new_password
    )


@router.post("/2fa/setup")
def setup_2fa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Setup 2FA - generates TOTP secret and QR code URI"""
    return AuthService.setup_2fa(db, current_user.id)


@router.post("/2fa/enable")
def enable_2fa(
    data: Enable2FARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enable 2FA after verifying TOTP code"""
    return AuthService.enable_2fa(db, current_user.id, data.totp_code)


@router.post("/2fa/disable")
def disable_2fa(
    data: Disable2FARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Disable 2FA using TOTP or OTP verification"""
    return AuthService.disable_2fa(
        db=db,
        user_id=current_user.id,
        totp_code=data.totp_code,
        otp_code=data.code
    )
