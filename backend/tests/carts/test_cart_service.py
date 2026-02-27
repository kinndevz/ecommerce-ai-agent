import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch, call
from fastapi import HTTPException
from app.services.carts import CartService


# HELPER


def build_query_chain(first=None, all_result=None):
    """Build SQLAlchemy query chain mock."""
    q = MagicMock()
    for attr in ("filter", "options", "join", "joinedload",
                 "with_for_update", "offset", "limit", "order_by"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.delete.return_value = 0
    return q


# GET CART


class TestGetCart:

    def test_existing_cart_returns_formatted_data(
        self, mock_db, mock_cart, user_id
    ):
        """Cart tồn tại → trả về formatted data với items."""
        mock_db.query.return_value = build_query_chain(first=mock_cart)

        result = CartService.get_cart(mock_db, user_id)

        assert result["success"] is True
        assert result["data"]["id"] == mock_cart.id
        assert result["data"]["user_id"] == user_id
        assert len(result["data"]["items"]) == 1

    def test_no_cart_creates_and_returns_empty_cart(
        self, mock_db, mock_empty_cart, user_id
    ):
        """User chưa có cart → tạo mới, trả về empty cart."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                # get_cart query with joinedload → không tìm thấy
                q.first.return_value = None
            elif call_count == 2:
                # get_or_create_cart query → cũng không tìm thấy → tạo mới
                q.first.return_value = None
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        # Patch get_or_create_cart để trả về empty cart
        with patch.object(CartService, "get_or_create_cart",
                          return_value=mock_empty_cart):
            result = CartService.get_cart(mock_db, user_id)

        assert result["success"] is True
        assert result["data"]["items"] == []

    def test_message_is_correct(self, mock_db, mock_cart, user_id):
        """Message phải đúng."""
        mock_db.query.return_value = build_query_chain(first=mock_cart)

        result = CartService.get_cart(mock_db, user_id)

        assert result["message"] == "Cart retrieved successfully!"

    def test_empty_cart_has_zero_subtotal(
        self, mock_db, mock_empty_cart, user_id
    ):
        """Cart không có item → subtotal=0, total_items=0."""
        mock_db.query.return_value = build_query_chain(first=mock_empty_cart)

        result = CartService.get_cart(mock_db, user_id)

        assert result["data"]["subtotal"] == 0.0
        assert result["data"]["total_items"] == 0


# ADD TO CART


class TestAddToCart:

    def test_add_new_item_without_variant(
        self, mock_db, mock_cart, mock_empty_cart, mock_product,
        user_id, product_id
    ):
        """Product tồn tại, không variant, chưa có item → add thành công."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                # get_or_create_cart
                q.first.return_value = mock_empty_cart
            elif call_count == 2:
                # product query
                q.first.return_value = mock_product
            elif call_count == 3:
                # existing_item check
                q.first.return_value = None
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None
        mock_empty_cart.items = []

        result = CartService.add_to_cart(
            mock_db, user_id, product_id, variant_id=None, quantity=1
        )

        assert result["success"] is True
        assert result["message"] == "Item added to cart"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called()

    def test_add_new_item_with_variant(
        self, mock_db, mock_empty_cart, mock_product, mock_variant,
        user_id, product_id, variant_id
    ):
        """variant_id hợp lệ → CartItem dùng variant's price."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            elif call_count == 2:
                q.first.return_value = mock_product
            elif call_count == 3:
                q.first.return_value = mock_variant
            elif call_count == 4:
                q.first.return_value = None   # no existing item
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None
        mock_empty_cart.items = []

        result = CartService.add_to_cart(
            mock_db, user_id, product_id, variant_id=variant_id, quantity=1
        )

        assert result["success"] is True
        added_item = mock_db.add.call_args[0][0]
        assert added_item.variant_id == variant_id

    def test_product_not_found_raises_404(
        self, mock_db, mock_empty_cart, user_id, product_id
    ):
        """Product không tồn tại → raise 404."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            else:
                q.first.return_value = None  # product not found
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        with pytest.raises(HTTPException) as exc_info:
            CartService.add_to_cart(mock_db, user_id, product_id)

        assert exc_info.value.status_code == 404
        assert "Product" in exc_info.value.detail["message"]

    def test_variant_not_found_raises_404(
        self, mock_db, mock_empty_cart, mock_product,
        user_id, product_id, variant_id
    ):
        """variant_id truyền vào nhưng không tồn tại → raise 404."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            elif call_count == 2:
                q.first.return_value = mock_product
            else:
                q.first.return_value = None  # variant not found
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        with pytest.raises(HTTPException) as exc_info:
            CartService.add_to_cart(
                mock_db, user_id, product_id, variant_id=variant_id
            )

        assert exc_info.value.status_code == 404
        assert "Variant" in exc_info.value.detail["message"]

    def test_insufficient_stock_raises_400(
        self, mock_db, mock_empty_cart, mock_product,
        user_id, product_id
    ):
        """quantity > stock → raise 400."""
        mock_product.stock_quantity = 2
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            else:
                q.first.return_value = mock_product
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        with pytest.raises(HTTPException) as exc_info:
            CartService.add_to_cart(
                mock_db, user_id, product_id, quantity=5
            )

        assert exc_info.value.status_code == 400
        assert "2" in exc_info.value.detail["message"]

    def test_existing_item_updates_quantity(
        self, mock_db, mock_empty_cart, mock_product, mock_cart_item,
        user_id, product_id
    ):
        """Item đã có trong cart → quantity tăng lên, KHÔNG add mới."""
        mock_cart_item.quantity = 1
        mock_product.stock_quantity = 10
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            elif call_count == 2:
                q.first.return_value = mock_product
            elif call_count == 3:
                q.first.return_value = mock_cart_item  # existing item
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None
        mock_empty_cart.items = []

        CartService.add_to_cart(
            mock_db, user_id, product_id, quantity=2
        )

        # quantity phải tăng: 1 + 2 = 3
        assert mock_cart_item.quantity == 3
        # KHÔNG gọi db.add() vì chỉ update
        mock_db.add.assert_not_called()

    def test_existing_item_exceeds_stock_raises_400(
        self, mock_db, mock_empty_cart, mock_product, mock_cart_item,
        user_id, product_id
    ):
        """existing.quantity + new_quantity > stock → raise 400."""
        mock_cart_item.quantity = 8
        mock_product.stock_quantity = 10
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            elif call_count == 2:
                q.first.return_value = mock_product
            elif call_count == 3:
                q.first.return_value = mock_cart_item
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        with pytest.raises(HTTPException) as exc_info:
            CartService.add_to_cart(
                mock_db, user_id, product_id, quantity=5
            )

        assert exc_info.value.status_code == 400

    def test_price_uses_product_sale_price_when_available(
        self, mock_db, mock_empty_cart, mock_product,
        user_id, product_id
    ):
        """Product có sale_price, không variant → CartItem dùng sale_price."""
        mock_product.sale_price = Decimal("80.00")
        mock_product.price = Decimal("100.00")
        mock_product.stock_quantity = 10
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart
            elif call_count == 2:
                q.first.return_value = mock_product
            elif call_count == 3:
                q.first.return_value = None   # no existing item
            else:
                q.first.return_value = mock_empty_cart
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None
        mock_empty_cart.items = []

        CartService.add_to_cart(mock_db, user_id, product_id, quantity=1)

        added_item = mock_db.add.call_args[0][0]
        assert added_item.price == Decimal("80.00")


# UPDATE CART ITEM


class TestUpdateCartItem:

    def test_valid_update_returns_updated_cart(
        self, mock_db, mock_cart_item, mock_cart, user_id, item_id
    ):
        """Item tồn tại, quantity hợp lệ → cập nhật thành công."""
        mock_cart_item.variant = None
        mock_cart_item.product.stock_quantity = 10
        mock_cart_item.cart = mock_cart

        mock_db.query.return_value = build_query_chain(first=mock_cart_item)
        mock_db.refresh.side_effect = lambda obj: None

        result = CartService.update_cart_item(
            mock_db, user_id, item_id, quantity=3
        )

        assert result["success"] is True
        assert result["message"] == "Cart item updated"
        assert mock_cart_item.quantity == 3
        mock_db.commit.assert_called_once()

    def test_item_not_found_raises_404(self, mock_db, user_id, item_id):
        """Item không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CartService.update_cart_item(
                mock_db, user_id, item_id, quantity=1
            )

        assert exc_info.value.status_code == 404
        assert "Cart item" in exc_info.value.detail["message"]

    def test_quantity_exceeds_stock_raises_400(
        self, mock_db, mock_cart_item, user_id, item_id
    ):
        """quantity > available_stock → raise 400."""
        mock_cart_item.variant = None
        mock_cart_item.product.stock_quantity = 3

        mock_db.query.return_value = build_query_chain(first=mock_cart_item)

        with pytest.raises(HTTPException) as exc_info:
            CartService.update_cart_item(
                mock_db, user_id, item_id, quantity=10
            )

        assert exc_info.value.status_code == 400
        assert "3" in exc_info.value.detail["message"]

    def test_uses_variant_stock_when_variant_exists(
        self, mock_db, mock_cart_item_with_variant, mock_cart, user_id, item_id
    ):
        """cart_item có variant → dùng variant.stock_quantity."""
        mock_cart_item_with_variant.variant.stock_quantity = 2
        mock_cart_item_with_variant.cart = mock_cart

        mock_db.query.return_value = build_query_chain(
            first=mock_cart_item_with_variant
        )
        mock_db.refresh.side_effect = lambda obj: None

        with pytest.raises(HTTPException) as exc_info:
            CartService.update_cart_item(
                mock_db, user_id, item_id, quantity=5
            )

        # Phải fail vì dùng variant.stock_quantity=2, không phải product.stock_quantity
        assert exc_info.value.status_code == 400
        assert "2" in exc_info.value.detail["message"]


# REMOVE CART ITEM


class TestRemoveCartItem:

    def test_remove_existing_item_returns_updated_cart(
        self, mock_db, mock_cart_item, mock_cart, user_id, item_id
    ):
        """Item tồn tại → db.delete(item) gọi, commit gọi, success=True."""
        mock_cart_item.cart = mock_cart

        mock_db.query.return_value = build_query_chain(first=mock_cart_item)
        mock_db.refresh.side_effect = lambda obj: None

        result = CartService.remove_cart_item(mock_db, user_id, item_id)

        assert result["success"] is True
        mock_db.delete.assert_called_once_with(mock_cart_item)
        mock_db.commit.assert_called_once()

    def test_item_not_found_raises_404(self, mock_db, user_id, item_id):
        """Item không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CartService.remove_cart_item(mock_db, user_id, item_id)

        assert exc_info.value.status_code == 404

    def test_message_is_correct(
        self, mock_db, mock_cart_item, mock_cart, user_id, item_id
    ):
        """Message phải đúng."""
        mock_cart_item.cart = mock_cart

        mock_db.query.return_value = build_query_chain(first=mock_cart_item)
        mock_db.refresh.side_effect = lambda obj: None

        result = CartService.remove_cart_item(mock_db, user_id, item_id)

        assert result["message"] == "Item removed from cart"


# CLEAR CART


class TestClearCart:

    def test_clear_existing_cart_bulk_deletes_items(
        self, mock_db, mock_empty_cart, user_id
    ):
        """Cart tồn tại → bulk delete (.delete()) được gọi."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_empty_cart  # Cart query
            else:
                # CartItem bulk delete query
                q.delete.return_value = 0
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        result = CartService.clear_cart(mock_db, user_id)

        assert result["success"] is True
        mock_db.commit.assert_called_once()
        # Verify bulk delete được gọi (không phải db.delete(item))
        mock_db.delete.assert_not_called()

    def test_cart_not_found_raises_404(self, mock_db, user_id):
        """User không có cart → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CartService.clear_cart(mock_db, user_id)

        assert exc_info.value.status_code == 404

    def test_returns_empty_cart_after_clear(
        self, mock_db, mock_empty_cart, user_id
    ):
        """Sau khi clear → items=[], message đúng."""
        call_count = 0

        def side_effect(*args, **kwargs):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_empty_cart
            q.delete.return_value = 0
            return q

        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        result = CartService.clear_cart(mock_db, user_id)

        assert result["data"]["items"] == []
        assert result["message"] == "Cart cleared"
