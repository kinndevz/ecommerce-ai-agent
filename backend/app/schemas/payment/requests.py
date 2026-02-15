from pydantic import BaseModel, Field
from typing import Optional


class BaseConfig:
    from_attributes = True


class CreatePaymentRequest(BaseModel):
    """Request to create VNPay payment URL"""
    order_id: str = Field(..., description="Order ID to create payment for")
    bank_code: Optional[str] = Field(
        None, description="Bank code (optional)")
    language: str = Field(
        "vn", description="Language: 'vn' or 'en'", pattern="^(vn|en)$")

    class Config(BaseConfig):
        json_schema_extra = {
            "example": {
                "order_id": "550e8400-e29b-41d4-a716-446655440000",
                "bank_code": "NCB",
                "language": "vn"
            }
        }
