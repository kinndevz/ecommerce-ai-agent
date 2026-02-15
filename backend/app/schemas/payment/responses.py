from pydantic import BaseModel, Field
from typing import Optional


class BaseConfig:
    from_attributes = True


class PaymentURLData(BaseModel):
    """Payment URL data"""
    payment_url: str = Field(..., description="VNPay payment URL")

    class Config(BaseConfig):
        pass


class PaymentReturnData(BaseModel):
    """Payment return callback data"""
    order_id: str
    order_number: str
    amount: float
    response_code: str
    transaction_no: str
    bank_code: str

    class Config(BaseConfig):
        pass


class PaymentURLResponse(BaseModel):
    """Create payment URL response"""
    success: bool
    message: str
    data: PaymentURLData

    class Config(BaseConfig):
        pass


class PaymentReturnResponse(BaseModel):
    """Payment return callback response"""
    success: bool
    message: str
    data: PaymentReturnData

    class Config(BaseConfig):
        pass
