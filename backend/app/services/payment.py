import hashlib
import hmac
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.order import Order
from app.utils.responses import ResponseHandler
from app.core.enums import PaymentStatus
from app.core.enums import VNPaymentStatus, OrderStatus


class VNPayService:
    @staticmethod
    def _hmac_sha512(key: str, data: str) -> str:
        """Create HMAC SHA512 signature"""
        byte_key = key.encode('utf-8')
        byte_data = data.encode('utf-8')
        return hmac.new(byte_key, byte_data, hashlib.sha512).hexdigest()

    @staticmethod
    def _build_query_string(params: Dict) -> str:
        """Build sorted query string"""
        sorted_params = sorted(params.items())
        query_parts = []

        for key, val in sorted_params:
            query_parts.append(f"{key}={urllib.parse.quote_plus(str(val))}")

        return "&".join(query_parts)

    @staticmethod
    def _validate_signature(params: Dict, secret_key: str) -> bool:
        """
        Validate VNPay signature

        Args:
            params: Callback parameters (including vnp_SecureHash)
            secret_key: Hash secret

        Returns:
            True if valid
        """
        vnp_secure_hash = params.get("vnp_SecureHash")
        if not vnp_secure_hash:
            return False

        # Remove signature params for validation
        input_data = {k: v for k, v in params.items()
                      if k not in ["vnp_SecureHash", "vnp_SecureHashType"]}

        # Build query string and calculate signature
        query_string = VNPayService._build_query_string(input_data)
        calculated_hash = VNPayService._hmac_sha512(secret_key, query_string)

        return vnp_secure_hash == calculated_hash

    @staticmethod
    def _build_ipn_response(rsp_code: str, message: str) -> Dict:
        """
        Build VNPay IPN response

        Args:
            rsp_code: Response code
            message: Response message

        Returns:
            VNPay IPN response format
        """
        return {
            "RspCode": rsp_code,
            "Message": message
        }

    @staticmethod
    def create_payment_url(
        db: Session,
        order_id: str,
        bank_code: Optional[str] = None,
        language: str = "vn"
    ):
        """
        Create VNPay payment URL

        Args:
            db: Database session
            order_id: Order ID
            bank_code: Bank code (optional)
            language: Language code (vn/en)

        Returns:
            Payment URL
        """

        # Get order
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            ResponseHandler.not_found_error("Order", order_id)

        # Check if already paid
        if order.payment_status == PaymentStatus.PAID.value:
            ResponseHandler.bad_request("Order already paid")

        # Build VNPay parameters
        amount = int(order.total * 100)
        create_date = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

        vnp_params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": settings.VNP_TMNCODE,
            "vnp_Amount": str(amount),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": order.order_number,
            "vnp_OrderInfo": f"Thanh toan don hang {order.order_number}",
            "vnp_OrderType": "other",
            "vnp_Locale": language,
            "vnp_ReturnUrl": settings.VNP_RETURN_URL,
            "vnp_IpAddr": "127.0.0.1",
            "vnp_CreateDate": create_date
        }

        # Add bank code if provided
        if bank_code:
            vnp_params["vnp_BankCode"] = bank_code

        # Create signature
        query_string = VNPayService._build_query_string(vnp_params)
        signature = VNPayService._hmac_sha512(
            settings.VNP_HASHSECRET, query_string)

        # Build final payment URL
        payment_url = f"{settings.VNP_PAYMENT_URL}?{query_string}&vnp_SecureHash={signature}"

        return ResponseHandler.success(
            message="Payment URL created successfully",
            data={"payment_url": payment_url}
        )

    @staticmethod
    def handle_payment_return(db: Session, callback_params: Dict) -> Dict:
        """
        Handle VNPay return callback (from user browser)
        Just verify and return data - don't update order here

        Args:
            db: Database session
            callback_params: Callback parameters

        Returns:
            Payment result data
        """
        # Validate signature
        is_valid = VNPayService._validate_signature(
            callback_params,
            settings.VNP_HASHSECRET
        )

        if not is_valid:
            ResponseHandler.bad_request("Invalid signature")

        # Get order by order_number (vnp_TxnRef)
        order_number = callback_params.get("vnp_TxnRef")
        order = db.query(Order).filter(
            Order.order_number == order_number).first()

        if not order:
            ResponseHandler.not_found_error("Order", order_number)

        # Get response code and message
        response_code = callback_params.get("vnp_ResponseCode", "99")
        message = VNPaymentStatus(response_code)

        return ResponseHandler.success(
            message=message,
            data={
                "order_id": order.id,
                "order_number": order.order_number,
                "amount": float(callback_params.get("vnp_Amount", 0)) / 100,
                "response_code": response_code,
                "transaction_no": callback_params.get("vnp_TransactionNo", ""),
                "bank_code": callback_params.get("vnp_BankCode", ""),
            }
        )

    @staticmethod
    def handle_payment_ipn(db: Session, callback_params: Dict) -> Dict:
        """
        Handle VNPay IPN callback
        Updates order status - THIS IS THE SECURE ENDPOINT

        Args:
            db: Database session
            callback_params: IPN parameters

        Returns:
            VNPay IPN response (RspCode, Message)
        """
        try:
            # Validate signature
            is_valid = VNPayService._validate_signature(
                callback_params,
                settings.VNP_HASHSECRET
            )

            if not is_valid:
                return VNPayService._build_ipn_response("97", "Invalid signature")

            # Get order
            order_number = callback_params.get("vnp_TxnRef")
            order = db.query(Order).filter(
                Order.order_number == order_number).first()

            if not order:
                return VNPayService._build_ipn_response("01", "Order not found")

            # Validate amount
            vnp_amount = float(callback_params.get("vnp_Amount", 0)) / 100
            if float(order.total) != vnp_amount:
                return VNPayService._build_ipn_response("04", "Invalid amount")

            # Check if already processed
            if order.payment_status == PaymentStatus.PAID.value:
                return VNPayService._build_ipn_response("02", "Order already confirmed")

            # Update order status based on payment result
            response_code = callback_params.get("vnp_ResponseCode")
            transaction_status = callback_params.get("vnp_TransactionStatus")

            if response_code == "00" and transaction_status == "00":
                # Payment successful
                order.payment_status = PaymentStatus.PAID.value
                order.status = OrderStatus.PENDING.value
            else:
                # Payment failed
                order.payment_status = PaymentStatus.FAILED.value

            db.commit()

            return VNPayService._build_ipn_response("00", "Confirm Success")

        except Exception as e:
            db.rollback()
            print(f"IPN Error: {str(e)}")
            return VNPayService._build_ipn_response("99", "Unknown error")
