from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import datetime
from enum import Enum
from typing_extensions import Self

# ========== Enums ==========


class VerificationCodeType(str, Enum):
    REGISTER = "REGISTER"
    FORGOT_PASSWORD = "FORGOT_PASSWORD"
    LOGIN = "LOGIN"
    DISABLE_2FA = "DISABLE_2FA"


# ========== Register ==========
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=15)
    code: str = Field(..., min_length=6, max_length=6)

    @model_validator(mode='after')
    def check_passwords_match(self) -> Self:
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self


class RegisterResponse(BaseModel):
    id: str
    email: str
    full_name: str
    status: str

    class Config:
        from_attributes = True

# ========== OTP ==========


class SendOTPRequest(BaseModel):
    email: EmailStr
    type: VerificationCodeType


class SendOTPResponse(BaseModel):
    message: str


# ========== Login ==========
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = Field(None, min_length=6, max_length=6)
    code: Optional[str] = Field(None, min_length=6, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ========== Refresh Token ==========
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ========== Logout ==========
class LogoutRequest(BaseModel):
    refresh_token: str


# ========== Forgot Password ==========
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)
    confirm_new_password: str = Field(..., min_length=6, max_length=100)

    @model_validator(mode='after')
    def check_passwords_match(self) -> Self:
        if self.new_password != self.confirm_new_password:
            raise ValueError('Passwords do not match')
        return self


# ========== 2FA ==========
class TwoFactorSetupResponse(BaseModel):
    secret: str
    uri: str


class Enable2FARequest(BaseModel):
    totp_code: str = Field(..., min_length=6, max_length=6)


class Disable2FARequest(BaseModel):
    totp_code: Optional[str] = Field(None, min_length=6, max_length=6)
    code: Optional[str] = Field(None, min_length=6, max_length=6)


# ========== Message Response ==========
class MessageResponse(BaseModel):
    message: str
