from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import uuid

from app.models.user import User, RefreshToken, VerificationCode, UserStatus, VerificationCodeType
from app.models.role import Role
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, verify_refresh_token,
    generate_totp_secret, verify_totp, generate_otp
)
from app.core.config import settings
from app.utils.email import send_otp_email
from app.utils.responses import ResponseHandler
from app.schemas.auth import RegisterRequest, LoginRequest


class AuthService:

    @staticmethod
    def register(db: Session, register: RegisterRequest):
        """Register new user"""
        # Verify OTP
        verification = db.query(VerificationCode).filter(
            VerificationCode.email == register.email,
            VerificationCode.type == VerificationCodeType.REGISTER,
            VerificationCode.code == register.code
        ).first()

        if not verification:
            ResponseHandler.invalid_otp()

        if verification.expires_at < datetime.utcnow():
            ResponseHandler.invalid_otp()

        # Check if user exists
        existing_user = db.query(User).filter(
            User.email == register.email).first()
        if existing_user:
            ResponseHandler.already_exists_error("User", "email")

        # Get customer role
        customer_role = db.query(Role).filter(Role.name == "CUSTOMER").first()
        if not customer_role:
            ResponseHandler.internal_error("Default role not found")

        # Create user
        user = User(
            id=str(uuid.uuid4()),
            email=register.email,
            password=hash_password(register.password),
            full_name=register.full_name,
            phone_number=register.phone_number,
            role_id=customer_role.id,
            status=UserStatus.ACTIVE
        )

        db.add(user)
        db.delete(verification)
        db.commit()
        db.refresh(user)

        return ResponseHandler.create_success("User", user.id, user)

    @staticmethod
    def send_otp(db: Session, email: str, otp_type: VerificationCodeType):
        """Send OTP to email"""
        # Check conditions based on type
        if otp_type == VerificationCodeType.REGISTER:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                ResponseHandler.already_exists_error("User", "email")

        elif otp_type == VerificationCodeType.FORGOT_PASSWORD:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                ResponseHandler.not_found_error("User")

        # Generate OTP
        code = generate_otp()
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        # Delete old OTP
        db.query(VerificationCode).filter(
            VerificationCode.email == email,
            VerificationCode.type == otp_type
        ).delete()

        # Create new OTP
        verification = VerificationCode(
            id=str(uuid.uuid4()),
            email=email,
            code=code,
            type=otp_type,
            expires_at=expires_at
        )

        db.add(verification)
        db.commit()

        # Send email
        send_otp_email(email, code)

        return ResponseHandler.otp_sent_success(email)

    @staticmethod
    def login(db: Session, loginRequest: LoginRequest):
        """Login user"""
        # Find user
        user = db.query(User).filter(User.email == loginRequest.email,
                                     User.deleted_at.is_(None)).first()
        if not user:
            ResponseHandler.invalid_credentials()

        # Verify password
        if not verify_password(loginRequest.password, user.password):
            ResponseHandler.invalid_credentials()

        # Check if account is active
        if user.status != UserStatus.ACTIVE:
            ResponseHandler.account_inactive()

        # Check 2FA
        if user.is_2fa_enabled and user.totp_secret:
            if not loginRequest.totp_code and not loginRequest.otp_code:
                ResponseHandler.bad_request("2FA code required")

            if loginRequest.totp_code:
                if not verify_totp(user.totp_secret, loginRequest.totp_code):
                    ResponseHandler.bad_request("Invalid 2FA code")
            elif loginRequest.otp_code:
                verification = db.query(VerificationCode).filter(
                    VerificationCode.email == loginRequest.email,
                    VerificationCode.type == VerificationCodeType.LOGIN,
                    VerificationCode.code == loginRequest.otp_code
                ).first()

                if not verification or verification.expires_at < datetime.now(timezone.utc):
                    ResponseHandler.invalid_otp()

                db.delete(verification)

        # Generate tokens
        access_token = create_access_token({
            "user_id": user.id,
            "role_id": user.role_id
        })

        refresh_token = create_refresh_token({"user_id": user.id})

        # Save refresh token
        payload = verify_refresh_token(refresh_token)
        expires_at = datetime.fromtimestamp(payload["exp"])

        db_refresh_token = RefreshToken(
            id=str(uuid.uuid4()),
            token=refresh_token,
            user_id=user.id,
            expires_at=expires_at
        )
        db.add(db_refresh_token)
        db.commit()

        token_data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

        return ResponseHandler.success("Login successful", token_data)

    @staticmethod
    def refresh_token_handler(db: Session, refresh_token: str):
        """Refresh access token"""
        try:
            payload = verify_refresh_token(refresh_token)
        except:
            ResponseHandler.invalid_token("refresh")

        user_id = payload.get("user_id")
        if not user_id:
            ResponseHandler.invalid_token("refresh")

        # Check if refresh token exists in DB
        db_refresh_token = db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).first()

        if not db_refresh_token:
            ResponseHandler.invalid_token("refresh")

        # Check if token expired
        if db_refresh_token.expires_at < datetime.utcnow():
            db.delete(db_refresh_token)
            db.commit()
            ResponseHandler.expired_token("refresh")

        # Get user
        user = db.query(User).filter(User.id == user_id,
                                     User.deleted_at.is_(None)).first()
        if not user:
            ResponseHandler.not_found_error("User")

        # Delete old refresh token
        db.delete(db_refresh_token)

        # Generate new tokens
        new_access_token = create_access_token({
            "user_id": user.id,
            "role_id": user.role_id
        })

        new_refresh_token = create_refresh_token({"user_id": user.id})

        # Save new refresh token
        new_payload = verify_refresh_token(new_refresh_token)
        expires_at = datetime.fromtimestamp(new_payload["exp"])

        new_db_refresh_token = RefreshToken(
            id=str(uuid.uuid4()),
            token=new_refresh_token,
            user_id=user.id,
            expires_at=expires_at
        )
        db.add(new_db_refresh_token)
        db.commit()

        token_data = {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

        return ResponseHandler.success("Token refreshed successfully", token_data)

    @staticmethod
    def logout(db: Session, refresh_token: str):
        """Logout user"""
        db_refresh_token = db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).first()

        if not db_refresh_token:
            ResponseHandler.invalid_token("refresh")

        # Delete refresh token
        db.delete(db_refresh_token)
        db.commit()

        return ResponseHandler.logout_success()

    @staticmethod
    def setup_2fa(db: Session, user_id: str):
        """Setup 2FA for user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            ResponseHandler.not_found_error("User")

        if user.is_2fa_enabled:
            ResponseHandler.bad_request("2FA is already enabled")

        secret, uri = generate_totp_secret(user.email)
        user.pending_totp_secret = secret
        db.commit()

        data = {"secret": secret, "uri": uri}
        return ResponseHandler.success("2FA setup initiated", data)

    @staticmethod
    def enable_2fa(db: Session, user_id: str, totp_code: str):
        """Enable 2FA after verification"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.pending_totp_secret:
            ResponseHandler.bad_request("2FA setup not initiated")

        if not verify_totp(user.pending_totp_secret, totp_code):
            ResponseHandler.bad_request("Invalid TOTP code")

        user.totp_secret = user.pending_totp_secret
        user.pending_totp_secret = None
        user.is_2fa_enabled = True
        db.commit()

        return ResponseHandler.success("2FA enabled successfully", None)

    @staticmethod
    def disable_2fa(db: Session, user_id: str, totp_code: str = None, otp_code: str = None):
        """Disable 2FA"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            ResponseHandler.not_found_error("User")

        if not user.is_2fa_enabled:
            ResponseHandler.bad_request("2FA is not enabled")

        if not totp_code and not otp_code:
            ResponseHandler.bad_request("Verification code required")

        # Verify TOTP or OTP
        if totp_code:
            if not verify_totp(user.totp_secret, totp_code):
                ResponseHandler.bad_request("Invalid TOTP code")
        elif otp_code:
            verification = db.query(VerificationCode).filter(
                VerificationCode.email == user.email,
                VerificationCode.type == VerificationCodeType.DISABLE_2FA,
                VerificationCode.code == otp_code
            ).first()

            if not verification or verification.expires_at < datetime.now(timezone.utc):
                ResponseHandler.invalid_otp()

            db.delete(verification)

        user.totp_secret = None
        user.is_2fa_enabled = False
        db.commit()

        return ResponseHandler.success("2FA disabled successfully", None)

    @staticmethod
    def forgot_password(db: Session, email: str, code: str, new_password: str):
        """Reset password"""
        # Verify OTP
        verification = db.query(VerificationCode).filter(
            VerificationCode.email == email,
            VerificationCode.type == VerificationCodeType.FORGOT_PASSWORD,
            VerificationCode.code == code
        ).first()

        if not verification:
            ResponseHandler.invalid_otp()

        if verification.expires_at < datetime.now(timezone.utc):
            ResponseHandler.invalid_otp()

        # Get user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            ResponseHandler.not_found_error("User")

        # Update password
        user.password = hash_password(new_password)
        db.delete(verification)
        db.commit()

        return ResponseHandler.password_changed_success()
