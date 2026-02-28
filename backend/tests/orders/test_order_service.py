import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch, call
from fastapi import HTTPException
from app.services.oders import OrderService
from app.core.enums import OrderStatus, PaymentStatus, PaymentMethod


# HELPER
def build_query_chain(first=None, all_result=None, scalar_val=0):
    q = MagicMock()
    for attr in ("filter", "options", "join", "order_by",
                 "offset", "limit", "joinedload"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.count.return_value = scalar_val
    q.scalar.return_value = scalar_val
    q.delete.return_value = 0
    return q


# _CALCULATE_SHIPPING_FEE
class TestCalculateShippingFee:

    def test_subtotal_above_threshold_returns_zero(self):
        """subtotal >= 500000 → shipping_fee = 0."""
        fee = OrderService._calculate_shipping_fee(Decimal("500000.00"))
        assert fee == Decimal("0.00")

    def test_subtotal_below_threshold_returns_default_fee(self):
        """subtotal < 500000 → shipping_fee = 30000."""
        fee = OrderService._calculate_shipping_fee(Decimal("499999.99"))
        assert fee == Decimal("30000.00")

    def test_subtotal_exactly_at_threshold_returns_zero(self):
        """Đúng bằng threshold → free shipping."""
        fee = OrderService._calculate_shipping_fee(Decimal("500000.00"))
        assert fee == Decimal("0.00")


# CREATE ORDER
class TestCreateOrder:

    def _setup_query(self, mock_db, mock_user, mock_cart):
        """Setup query side_effect cho create_order flow."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_user    # User query
            elif call_count == 2:
                q.first.return_value = mock_cart    # Cart query with joinedload
            elif call_count == 3:
                # count(Order.id) for order_number
                q.scalar.return_value = 0
            else:
                q.first.return_value = mock_cart    # db.refresh reload
            return q

        mock_db.query.side_effect = side_effect
        mock_db.flush.return_value = None
        mock_db.refresh.side_effect = lambda obj: None

    def test_valid_order_creates_successfully(
        self, mock_db, mock_current_user, mock_cart, mock_cart_item,
        mock_order, user_id
    ):
        """Cart hợp lệ → tạo order thành công."""
        self._setup_query(mock_db, mock_current_user, mock_cart)
        background_tasks = MagicMock()

        with patch("app.services.oders.NotificationEventEmitter.emit"), \
            patch("app.services.oders.OrderService._trigger_confirmation_email"), \
            patch("app.services.oders.OrderService._format_order_detail",
                  return_value={"id": mock_order.id}):
            result = OrderService.create_order(
                mock_db, user_id,
                {"name": "Test", "phone": "09000",
                    "address": "123", "city": "HCM"},
                PaymentMethod.COD.value,
                background_tasks
            )

        assert result["success"] is True
        mock_db.add.assert_called()
        mock_db.flush.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_user_not_found_raises_404(self, mock_db, user_id):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.create_order(
                mock_db, user_id, {}, "cod", MagicMock()
            )

        assert exc_info.value.status_code == 404

    def test_empty_cart_raises_400(
        self, mock_db, mock_current_user, mock_empty_cart, user_id
    ):
        """Cart rỗng → raise 400."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_current_user
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            OrderService.create_order(
                mock_db, user_id, {}, "cod", MagicMock()
            )

        assert exc_info.value.status_code == 400
        assert "empty" in exc_info.value.detail["message"].lower()

    def test_insufficient_stock_raises_400(
        self, mock_db, mock_current_user, mock_cart, mock_cart_item, user_id
    ):
        """Stock không đủ → raise 400."""
        mock_cart_item.product.stock_quantity = 1
        mock_cart_item.quantity = 5  # > stock
        mock_cart_item.variant = None

        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_current_user
            else:
                q.first.return_value = mock_cart
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            OrderService.create_order(
                mock_db, user_id, {}, "cod", MagicMock()
            )

        assert exc_info.value.status_code == 400
        assert "stock" in exc_info.value.detail["message"].lower()

    def test_subtotal_below_threshold_adds_shipping_fee(
        self, mock_db, mock_current_user, mock_cart, mock_cart_item,
        mock_order, user_id
    ):
        """subtotal < 500000 → shipping_fee = 30000 được thêm vào order."""
        mock_cart_item.price = Decimal("100000.00")
        mock_cart_item.quantity = 2  # subtotal = 200000 < 500000
        self._setup_query(mock_db, mock_current_user, mock_cart)

        created_orders = []

        original_add = mock_db.add.side_effect

        def capture_add(obj):
            from app.models.order import Order as OrderModel
            if hasattr(obj, 'shipping_fee'):
                created_orders.append(obj)

        mock_db.add.side_effect = capture_add
        mock_db.flush.return_value = None
        mock_db.refresh.side_effect = lambda obj: None

        with patch("app.services.oders.NotificationEventEmitter.emit"), \
            patch("app.services.oders.OrderService._trigger_confirmation_email"), \
            patch("app.services.oders.OrderService._format_order_detail",
                  return_value={"id": "x"}):
            OrderService.create_order(
                mock_db, user_id,
                {"name": "Test", "phone": "09000",
                    "address": "123", "city": "HCM"},
                PaymentMethod.COD.value,
                MagicMock()
            )

        # Order add được gọi với shipping_fee = 30000
        assert mock_db.add.called

    def test_deducts_stock_after_create(
        self, mock_db, mock_current_user, mock_cart, mock_cart_item,
        mock_order, user_id
    ):
        """Sau khi tạo order → stock của product bị trừ."""
        mock_cart_item.variant = None
        original_stock = mock_cart_item.product.stock_quantity
        self._setup_query(mock_db, mock_current_user, mock_cart)

        with patch("app.services.oders.NotificationEventEmitter.emit"), \
            patch("app.services.oders.OrderService._trigger_confirmation_email"), \
            patch("app.services.oders.OrderService._format_order_detail",
                  return_value={"id": "x"}):
            OrderService.create_order(
                mock_db, user_id,
                {"name": "Test", "phone": "09000",
                    "address": "123", "city": "HCM"},
                PaymentMethod.COD.value,
                MagicMock()
            )

        assert mock_cart_item.product.stock_quantity == \
            original_stock - mock_cart_item.quantity

    def test_clears_cart_after_create(
        self, mock_db, mock_current_user, mock_cart, mock_order, user_id
    ):
        """Sau khi tạo order → CartItem bulk delete được gọi."""
        self._setup_query(mock_db, mock_current_user, mock_cart)

        with patch("app.services.oders.NotificationEventEmitter.emit"), \
            patch("app.services.oders.OrderService._trigger_confirmation_email"), \
            patch("app.services.oders.OrderService._format_order_detail",
                  return_value={"id": "x"}):
            OrderService.create_order(
                mock_db, user_id,
                {"name": "Test", "phone": "09000",
                    "address": "123", "city": "HCM"},
                PaymentMethod.COD.value,
                MagicMock()
            )

        # Verify db.query(CartItem) được gọi để bulk delete
        # Khi side_effect active, dùng call_args_list thay vì .return_value
        from app.models.cart import CartItem as CartItemModel
        queried_models = [
            call.args[0] for call in mock_db.query.call_args_list if call.args
        ]
        assert any(m is CartItemModel for m in queried_models)
        mock_db.commit.assert_called_once()

    def test_sends_confirmation_email(
        self, mock_db, mock_current_user, mock_cart, mock_order, user_id
    ):
        """Sau khi tạo order → _trigger_confirmation_email được gọi."""
        self._setup_query(mock_db, mock_current_user, mock_cart)
        background_tasks = MagicMock()

        with patch("app.services.oders.NotificationEventEmitter.emit"), \
            patch.object(OrderService, "_trigger_confirmation_email") as mock_email, \
            patch("app.services.oders.OrderService._format_order_detail",
                  return_value={"id": "x"}):
            OrderService.create_order(
                mock_db, user_id,
                {"name": "Test", "phone": "09000",
                    "address": "123", "city": "HCM"},
                PaymentMethod.COD.value,
                background_tasks
            )

        mock_email.assert_called_once()


# GET ORDER DETAIL (Customer)
class TestGetOrderDetail:

    def test_existing_order_returns_detail(
        self, mock_db, mock_order, user_id, order_id
    ):
        """Order tồn tại, thuộc user → trả về detail."""
        mock_db.query.return_value = build_query_chain(first=mock_order)

        result = OrderService.get_order_detail(mock_db, user_id, order_id)

        assert result["success"] is True

    def test_not_found_raises_404(self, mock_db, user_id, order_id):
        """Order không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.get_order_detail(mock_db, user_id, order_id)

        assert exc_info.value.status_code == 404

    def test_other_user_order_raises_404(
        self, mock_db, mock_order, order_id
    ):
        """Order thuộc user khác (filter user_id) → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.get_order_detail(mock_db, "other-user-id", order_id)

        assert exc_info.value.status_code == 404


# GET ORDER DETAIL ADMIN
class TestGetOrderDetailAdmin:

    def test_any_order_returns_detail(
        self, mock_db, mock_order, order_id
    ):
        """Admin có thể xem bất kỳ order nào."""
        mock_db.query.return_value = build_query_chain(first=mock_order)

        result = OrderService.get_order_detail_admin(mock_db, order_id)

        assert result["success"] is True

    def test_not_found_raises_404(self, mock_db, order_id):
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.get_order_detail_admin(mock_db, order_id)

        assert exc_info.value.status_code == 404


# CANCEL ORDER
class TestCancelOrder:

    def test_cancel_pending_order_succeeds(
        self, mock_db, mock_order, user_id, order_id
    ):
        """Order trạng thái 'pending' → cancel thành công, restore stock."""
        mock_order.status = OrderStatus.PENDING.value
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        result = OrderService.cancel_order(mock_db, user_id, order_id)

        assert result["success"] is True
        assert mock_order.status == OrderStatus.CANCELLED.value
        mock_db.commit.assert_called_once()

    def test_cancel_processing_order_succeeds(
        self, mock_db, mock_order, user_id, order_id
    ):
        """Order trạng thái 'processing' → cancel thành công."""
        mock_order.status = OrderStatus.PROCESSING.value
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        result = OrderService.cancel_order(mock_db, user_id, order_id)

        assert result["success"] is True
        assert mock_order.status == OrderStatus.CANCELLED.value

    def test_cancel_shipped_order_raises_400(
        self, mock_db, mock_order_shipped, user_id, order_id
    ):
        """Order trạng thái 'shipped' → KHÔNG cancel được."""
        mock_db.query.return_value = build_query_chain(
            first=mock_order_shipped)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.cancel_order(mock_db, user_id, order_id)

        assert exc_info.value.status_code == 400
        assert "cancel" in exc_info.value.detail["message"].lower()

    def test_cancel_restores_product_stock(
        self, mock_db, mock_order, mock_order_item, user_id, order_id
    ):
        """Cancel order → stock của product được restore."""
        mock_order.status = OrderStatus.PENDING.value
        mock_order_item.variant = None
        original_stock = mock_order_item.product.stock_quantity
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        OrderService.cancel_order(mock_db, user_id, order_id)

        assert mock_order_item.product.stock_quantity == \
            original_stock + mock_order_item.quantity

    def test_order_not_found_raises_404(self, mock_db, user_id, order_id):
        """Order không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.cancel_order(mock_db, user_id, order_id)

        assert exc_info.value.status_code == 404


# GET ALL ORDERS (Admin)
class TestGetAllOrders:

    def test_no_filter_returns_all_orders(self, mock_db, mock_order):
        """Không filter → trả về tất cả orders."""
        q = build_query_chain(all_result=[mock_order], scalar_val=1)
        mock_db.query.return_value = q

        result = OrderService.get_all_orders(mock_db)

        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_valid_status_filter_applies(self, mock_db, mock_order):
        """status hợp lệ → filter được áp dụng."""
        q = build_query_chain(all_result=[mock_order], scalar_val=1)
        mock_db.query.return_value = q

        result = OrderService.get_all_orders(
            mock_db, status=OrderStatus.PENDING.value
        )

        assert result["success"] is True
        q.filter.assert_called()

    def test_invalid_status_raises_400(self, mock_db):
        """status không hợp lệ → raise 400."""
        q = build_query_chain()
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            OrderService.get_all_orders(mock_db, status="invalid_status")

        assert exc_info.value.status_code == 400

    def test_pagination_meta_is_correct(self, mock_db, mock_order):
        """Meta phân trang trả về đúng."""
        q = build_query_chain(all_result=[mock_order] * 3, scalar_val=3)
        mock_db.query.return_value = q

        result = OrderService.get_all_orders(mock_db, page=1, limit=10)

        assert result["meta"]["page"] == 1
        assert result["meta"]["limit"] == 10
        assert result["meta"]["total"] == 3


# UPDATE ORDER STATUS (Admin)
class TestUpdateOrderStatus:

    def test_valid_status_update_succeeds(
        self, mock_db, mock_order, order_id, user_id
    ):
        """Status hợp lệ → update thành công."""
        mock_order.status = OrderStatus.PENDING.value
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        result = OrderService.update_order_status(
            mock_db, order_id, OrderStatus.PROCESSING.value, user_id
        )

        assert result["success"] is True
        assert mock_order.status == OrderStatus.PROCESSING.value
        mock_db.commit.assert_called_once()

    def test_invalid_status_raises_400(self, mock_db, mock_order, order_id, user_id):
        """Status không hợp lệ → raise 400."""
        mock_db.query.return_value = build_query_chain(first=mock_order)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.update_order_status(
                mock_db, order_id, "invalid_status", user_id
            )

        assert exc_info.value.status_code == 400

    def test_order_not_found_raises_404(self, mock_db, order_id, user_id):
        """Order không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            OrderService.update_order_status(
                mock_db, order_id, OrderStatus.PROCESSING.value, user_id
            )

        assert exc_info.value.status_code == 404

    def test_cancel_restores_stock(
        self, mock_db, mock_order, mock_order_item, order_id, user_id
    ):
        """Update status → 'cancelled' → restore stock."""
        mock_order.status = OrderStatus.PROCESSING.value
        mock_order_item.variant = None
        original_stock = mock_order_item.product.stock_quantity
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        OrderService.update_order_status(
            mock_db, order_id, OrderStatus.CANCELLED.value, user_id
        )

        assert mock_order_item.product.stock_quantity == \
            original_stock + mock_order_item.quantity

    def test_delivered_cod_sets_payment_paid(
        self, mock_db, mock_order, order_id, user_id
    ):
        """Update → 'delivered' + payment_method='cod' → payment_status='paid'."""
        mock_order.status = OrderStatus.PROCESSING.value
        mock_order.payment_method = PaymentMethod.COD.value
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        OrderService.update_order_status(
            mock_db, order_id, OrderStatus.DELIVERED.value, user_id
        )

        assert mock_order.payment_status == PaymentStatus.PAID.value

    def test_delivered_non_cod_does_not_change_payment_status(
        self, mock_db, mock_order, order_id, user_id
    ):
        """Update → 'delivered' + payment_method='vnpay' → payment_status KHÔNG thay đổi."""
        mock_order.status = OrderStatus.PROCESSING.value
        mock_order.payment_method = PaymentMethod.VNPAY.value
        mock_order.payment_status = PaymentStatus.UNPAID.value
        mock_db.query.return_value = build_query_chain(first=mock_order)
        mock_db.refresh.side_effect = lambda obj: None

        OrderService.update_order_status(
            mock_db, order_id, OrderStatus.DELIVERED.value, user_id
        )

        assert mock_order.payment_status == PaymentStatus.UNPAID.value


# GET ORDER STATS (Admin)
class TestGetOrderStats:
    """
    get_order_stats gọi db.query(*args) 7 lần:
      1: count(Order.id) → total
      2-6: count(Order.id).filter(status=X) → pending/processing/shipped/delivered/cancelled
      7: sum(Order.total).filter(delivered) → revenue
    Tất cả side_effect phải nhận *args
    """

    def test_returns_correct_structure(self, mock_db):
        """Response phải có đủ 7 keys."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 6:
                q.scalar.return_value = call_count * 10
            else:
                q.scalar.return_value = Decimal("1000000.00")
            return q

        mock_db.query.side_effect = side_effect

        result = OrderService.get_order_stats(mock_db)

        assert result["success"] is True
        for key in ("total_orders", "pending_orders", "processing_orders",
                    "shipped_orders", "delivered_orders", "cancelled_orders",
                    "total_revenue"):
            assert key in result["data"]

    def test_no_delivered_orders_revenue_is_zero(self, mock_db):
        """Không có delivered order → total_revenue = 0."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 6:
                q.scalar.return_value = 0
            else:
                q.scalar.return_value = None   # sum returns None when no rows
            return q

        mock_db.query.side_effect = side_effect

        result = OrderService.get_order_stats(mock_db)

        assert result["data"]["total_revenue"] == 0.0

    def test_counts_are_correct(self, mock_db):
        """Giá trị count trả về đúng."""
        counts = [100, 10, 20, 30, 25, 15]
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            if call_count < len(counts):
                q.scalar.return_value = counts[call_count]
            else:
                q.scalar.return_value = Decimal("500000.00")
            call_count += 1
            return q

        mock_db.query.side_effect = side_effect

        result = OrderService.get_order_stats(mock_db)

        assert result["data"]["total_orders"] == 100
        assert result["data"]["pending_orders"] == 10
