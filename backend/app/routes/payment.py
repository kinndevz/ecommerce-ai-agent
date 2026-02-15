from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.payment import VNPayService
from app.models.user import User
from app.utils.deps import get_current_user
from app.schemas.payment import (
    CreatePaymentRequest,
    PaymentURLResponse,
    PaymentReturnResponse
)


router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post("/vnpay/create", response_model=PaymentURLResponse)
def create_vnpay_payment(
    payload: CreatePaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create VNPay payment URL

    User clicks "Pay with VNPay" → Call this endpoint → Redirect to payment_url
    """
    return VNPayService.create_payment_url(
        db=db,
        order_id=payload.order_id,
        bank_code=payload.bank_code,
        language=payload.language
    )


@router.get("/vnpay/return", response_model=PaymentReturnResponse)
def vnpay_return_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    VNPay Return URL - User redirected here after payment

    This endpoint only verifies and returns payment result.
    Frontend should display the result to user.
    DO NOT update order status here - trust IPN instead!
    """
    callback_params = dict(request.query_params)
    return VNPayService.handle_payment_return(db, callback_params)


@router.get("/vnpay/ipn")
def vnpay_ipn_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    VNPay IPN - Server-to-server callback

    This is where order status gets updated.
    VNPay calls this endpoint directly (not through browser).
    MUST return JSON response for VNPay.
    """
    callback_params = dict(request.query_params)
    return VNPayService.handle_payment_ipn(db, callback_params)
