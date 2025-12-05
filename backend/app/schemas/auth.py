from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator, ConfigDict, ValidationInfo
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


class RegisterOut(BaseModel):
    email: str
    full_name: str
    phone_number: str


class RegisterResponse(BaseModel):
    success: bool
    message: str
    data: RegisterOut

    class Config(ConfigDict):
        pass

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

    @field_validator('confirm_new_password')
    @classmethod
    def check_passwords_match(cls, v: str, info: ValidationInfo) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


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
