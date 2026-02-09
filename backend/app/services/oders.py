import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from fastapi import BackgroundTasks
from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.models.user import User
from app.utils.responses import ResponseHandler
from app.core.enums import OrderStatus, PaymentStatus, PaymentMethod, NotificationType
from app.core.constant import OrderConstants
from app.services.notification_events import NotificationEventEmitter
from app.utils.email import send_order_confirmation_email


class OrderService:

    # HELPER METHODS
    @staticmethod
    def _safe_datetime(value: datetime | None) -> datetime:
        """Ensure a non-null datetime for response serialization."""
        return value or datetime.now(timezone.utc)

    @staticmethod
    def _calculate_shipping_fee(subtotal: Decimal) -> Decimal:
        """Calculate shipping fee based on subtotal"""
        if subtotal >= OrderConstants.FREE_SHIPPING_THRESHOLD:
            return Decimal('0.00')
        return OrderConstants.DEFAULT_SHIPPING_FEE

    @staticmethod
    def _generate_order_number(db: Session) -> str:
        """Generate unique order number"""
        order_count = db.query(func.count(Order.id)).scalar()
        date_str = datetime.now().strftime('%Y%m%d')

        return OrderConstants.ORDER_NUMBER_FORMAT.format(
            prefix=OrderConstants.ORDER_NUMBER_PREFIX,
            date=date_str,
            sequence=order_count + 1
        )

    @staticmethod
    def _format_order_list_item(order: Order):
        """Format order for list view"""
        return {
            "id": order.id,
            "order_number": order.order_number,
            "status": order.status,
            "payment_status": order.payment_status,
            "total": float(order.total),
            "total_items": len(order.items),
            "created_at": OrderService._safe_datetime(order.created_at)
        }

    @staticmethod
    def _format_order_detail(order: Order):
        """Format order detail"""

        items_data = [
            {
                "id": item.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "product_name": item.product_name,
                "variant_name": item.variant_name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "subtotal": float(item.subtotal)
            }
            for item in order.items
        ]

        return {
            "id": order.id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "subtotal": float(order.subtotal),
            "discount": float(order.discount),
            "shipping_fee": float(order.shipping_fee),
            "total": float(order.total),
            "shipping_address": order.shipping_address,
            "notes": order.notes,
            "items": items_data,
            "created_at": OrderService._safe_datetime(order.created_at),
            "updated_at": OrderService._safe_datetime(order.updated_at)
        }

    @staticmethod
    def _trigger_confirmation_email(background_tasks: BackgroundTasks, user: User, order: Order):
        """
        Prepare email context and add to background tasks.
        """
        shipping_address = order.shipping_address or {}
        ship_info = f"{shipping_address.get('address', '')}, {shipping_address.get('city', '')} - SĐT: {shipping_address.get('phone', '')}"

        email_items = [
            {
                "name": item.product_name,
                "variant": item.variant_name if item.variant_name else "",
                "quantity": item.quantity,
                "price": float(item.unit_price)
            } for item in order.items
        ]

        email_context = {
            "app_name": "Cosmetic Store",
            "full_name": user.full_name,
            "order_number": order.order_number,
            "created_at": order.created_at.strftime("%d/%m/%Y %H:%M"),
            "payment_method": order.payment_method.upper(),
            "items": email_items,
            "subtotal": float(order.subtotal),
            "shipping_fee": float(order.shipping_fee),
            "discount": float(order.discount),
            "total_amount": float(order.total),
            "shipping_address": ship_info
        }

        background_tasks.add_task(
            send_order_confirmation_email,
            user.email,
            email_context
        )

    # CUSTOMER ENDPOINTS
    @staticmethod
    def create_order(db: Session,
                     user_id: str,
                     shipping_address: dict,
                     payment_method: str,
                     background_tasks: BackgroundTasks,
                     notes: str = None,
                     ):
        """Create order from cart"""

        # Get user's infor
        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            ResponseHandler.not_found_error(
                "User with this ", user_id + " not found")

        # Get user's cart with items
        cart = db.query(Cart).options(
            joinedload(Cart.items).joinedload(CartItem.product),
            joinedload(Cart.items).joinedload(CartItem.variant)
        ).filter(Cart.user_id == user_id).first()

        if not cart or not cart.items:
            ResponseHandler.bad_request("Cart is empty")

        # Validate cart size
        if len(cart.items) > OrderConstants.MAX_ITEMS_PER_ORDER:
            ResponseHandler.bad_request(
                f"Cannot create order with more than {OrderConstants.MAX_ITEMS_PER_ORDER} items"
            )

        # Validate stock for all items
        for cart_item in cart.items:
            if cart_item.variant:
                available_stock = cart_item.variant.stock_quantity
            else:
                available_stock = cart_item.product.stock_quantity

            if available_stock < cart_item.quantity:
                ResponseHandler.bad_request(
                    f"Insufficient stock for {cart_item.product.name}. Only {available_stock} available"
                )

        # Calculate totals
        subtotal = Decimal('0.00')
        for cart_item in cart.items:
            subtotal += cart_item.price * cart_item.quantity

        # Calculate shipping fee (smart logic)
        shipping_fee = OrderService._calculate_shipping_fee(subtotal)

        discount = Decimal('0.00')  # Can add coupon logic later
        total = subtotal + shipping_fee - discount

        # Generate order number
        order_number = OrderService._generate_order_number(db)

        # Create order
        order = Order(
            id=str(uuid.uuid4()),
            user_id=user_id,
            order_number=order_number,
            status=OrderStatus.PENDING.value,
            payment_status=PaymentStatus.UNPAID.value,
            payment_method=payment_method,
            subtotal=subtotal,
            discount=discount,
            shipping_fee=shipping_fee,
            total=total,
            shipping_address=shipping_address,
            notes=notes,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        db.add(order)
        db.flush()

        # Create order items (snapshot)
        for cart_item in cart.items:
            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                product_id=cart_item.product_id,
                variant_id=cart_item.variant_id,
                product_name=cart_item.product.name,
                variant_name=cart_item.variant.name if cart_item.variant else None,
                quantity=cart_item.quantity,
                unit_price=cart_item.price,
                subtotal=cart_item.price * cart_item.quantity,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(order_item)

            # Deduct stock
            if cart_item.variant:
                cart_item.variant.stock_quantity -= cart_item.quantity
            else:
                cart_item.product.stock_quantity -= cart_item.quantity

        # Clear cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        db.commit()
        db.refresh(order)

        # Format response
        order_data = OrderService._format_order_detail(order)

        # Push Notification
        NotificationEventEmitter.emit(
            db,
            notification_type=NotificationType.ORDER_CREATED,
            model=order,
            send_websocket=True
        )

        # Send Email
        OrderService._trigger_confirmation_email(background_tasks, user, order)

        return ResponseHandler.create_success("Order", order.id, order_data)

    @staticmethod
    def get_user_orders(db: Session, user_id: str, page: int = 1, limit: int = 20):
        """Get user's orders"""

        query = db.query(Order).filter(Order.user_id == user_id)

        total = query.count()

        orders = query.order_by(desc(Order.created_at)).offset(
            (page - 1) * limit).limit(limit).all()

        orders_data = [OrderService._format_order_list_item(
            order) for order in orders]

        return ResponseHandler.get_list_success(
            resource_name="Orders",
            data=orders_data,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def get_order_detail(db: Session, user_id: str, order_id: str):
        """Get order detail"""

        order = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant)
        ).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            ResponseHandler.not_found_error("Order", order_id)

        order_data = OrderService._format_order_detail(order)

        return ResponseHandler.success(
            message="Order retrieved successfully",
            data=order_data
        )

    @staticmethod
    def get_order_detail_admin(db: Session, order_id: str):
        """Get order detail (Admin)"""

        order = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant)
        ).filter(
            Order.id == order_id
        ).first()

        if not order:
            ResponseHandler.not_found_error("Order", order_id)

        order_data = OrderService._format_order_detail(order)

        return ResponseHandler.success(
            message="Order retrieved successfully",
            data=order_data
        )

    @staticmethod
    def cancel_order(db: Session, user_id: str, order_id: str):
        """Cancel order (only if pending/processing)"""

        order = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant)
        ).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            ResponseHandler.not_found_error("Order", order_id)

        # Check if cancellable
        if order.status not in OrderConstants.CANCELLABLE_STATUSES:
            ResponseHandler.bad_request(
                f"Cannot cancel order with status '{order.status}'. "
                f"Only orders with status {', '.join(OrderConstants.CANCELLABLE_STATUSES)} can be cancelled."
            )

        # Restore stock
        for item in order.items:
            if item.variant:
                item.variant.stock_quantity += item.quantity
            else:
                item.product.stock_quantity += item.quantity

        # Update status
        order.status = OrderStatus.CANCELLED.value
        order.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(order)

        order_data = OrderService._format_order_detail(order)

        return ResponseHandler.success(
            message="Order cancelled successfully",
            data=order_data
        )

    # ADMIN ENDPOINTS

    @staticmethod
    def get_all_orders(db: Session, status: str = None, page: int = 1, limit: int = 20):
        """Get all orders (Admin)"""

        query = db.query(Order)

        if status:
            # Validate status
            if status not in OrderStatus.values():
                ResponseHandler.bad_request(
                    f"Invalid status. Must be one of: {', '.join(OrderStatus.values())}"
                )
            query = query.filter(Order.status == status)

        total = query.count()

        orders = query.order_by(desc(Order.created_at)).offset(
            (page - 1) * limit).limit(limit).all()

        orders_data = [OrderService._format_order_list_item(
            order) for order in orders]

        return ResponseHandler.get_list_success(
            resource_name="Orders",
            data=orders_data,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def update_order_status(db: Session, order_id: str, status: str, user_id: str):
        """Update order status (Admin)"""

        order = db.query(Order).options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.items).joinedload(OrderItem.variant)
        ).filter(Order.id == order_id).first()

        if not order:
            ResponseHandler.not_found_error("Order", order_id)

        # Validate status
        if status not in OrderStatus.values():
            ResponseHandler.bad_request(
                f"Invalid status. Must be one of: {', '.join(OrderStatus.values())}"
            )

        # If cancelling, restore stock
        if status == OrderStatus.CANCELLED.value and order.status != OrderStatus.CANCELLED.value:
            for item in order.items:
                if item.variant:
                    item.variant.stock_quantity += item.quantity
                else:
                    item.product.stock_quantity += item.quantity

        # Update status
        old_status = order.status
        order.status = status
        order.updated_at = datetime.now(timezone.utc)

        # Update payment status if delivered with COD
        if status == OrderStatus.DELIVERED.value and order.payment_method == PaymentMethod.COD.value:
            order.payment_status = PaymentStatus.PAID.value

        db.commit()
        db.refresh(order)

        order_data = OrderService._format_order_detail(order)

        return ResponseHandler.success(
            message=f"Order status updated from '{old_status}' to '{status}'",
            data=order_data
        )

    @staticmethod
    def get_order_stats(db: Session):
        """Get order statistics (Admin)"""

        total_orders = db.query(func.count(Order.id)).scalar()

        # Count by status using Enums
        pending_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.PENDING.value
        ).scalar()

        processing_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.PROCESSING.value
        ).scalar()

        shipped_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.SHIPPED.value
        ).scalar()

        delivered_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.DELIVERED.value
        ).scalar()

        cancelled_orders = db.query(func.count(Order.id)).filter(
            Order.status == OrderStatus.CANCELLED.value
        ).scalar()

        # Calculate revenue
        total_revenue = db.query(func.sum(Order.total)).filter(
            Order.status == OrderStatus.DELIVERED.value
        ).scalar() or Decimal('0.00')

        stats = {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
            "shipped_orders": shipped_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "total_revenue": float(total_revenue)
        }

        return ResponseHandler.success(
            message="Order statistics retrieved successfully",
            data=stats
        )
