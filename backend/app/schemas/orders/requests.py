from pydantic import BaseModel, Field, field_validator
from typing import Optional

from app.core.enums import PaymentMethod


class BaseConfig:
    from_attributes = True


class ShippingAddressRequest(BaseModel):
    """Shipping address"""
    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=10, max_length=20)
    address: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    ward: Optional[str] = Field(None, max_length=100)
    country: str = Field(default="Vietnam", max_length=100)

    class Config(BaseConfig):
        pass


class CreateOrderRequest(BaseModel):
    """Create order from cart"""
    shipping_address: ShippingAddressRequest
    payment_method: PaymentMethod = Field(..., description="Payment method")
    notes: Optional[str] = Field(None, max_length=500)

    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v):
        """Validate payment method"""
        if v not in PaymentMethod.values():
            raise ValueError(
                f"Invalid payment methods. Must be one of: {', '.join(PaymentMethod.values())}"
            )
        return v

    class Config(BaseConfig):
        pass


class UpdateOrderStatusRequest(BaseModel):
    """Update order status (Admin)"""
    status: str = Field(..., description="Order status")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate order status"""
        from app.core.enums import OrderStatus

        if v not in OrderStatus.values():
            raise ValueError(
                f"Invalid status. Must be one of: {', '.join(OrderStatus.values())}"
            )
        return v

    class Config(BaseConfig):
        pass
