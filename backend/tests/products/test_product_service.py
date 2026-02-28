import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.products import ProductService
from app.schemas.products import (
    ProductCreateRequest, ProductUpdateRequest,
    AddTagsRequest, UpdateStockRequest
)

#  helpers

MOCK_LIST_ITEM = {"id": "x", "name": "Test", "slug": "test"}
MOCK_DETAIL = {"id": "x", "name": "Test",
               "images": [], "variants": [], "tags": []}


def build_q(first=None, all_result=None, scalar=0, count=0):
    q = MagicMock()
    for a in ("filter", "options", "join", "order_by", "offset", "limit",
              "update", "ilike", "expire"):
        getattr(q, a).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.count.return_value = count
    q.scalar.return_value = scalar
    return q

# search_products_with_es


class TestSearchProductsWithEs:

    def test_successful_search_returns_list(self):
        """ES trả về kết quả → format và trả về list."""
        mock_response = {
            "hits": {
                "total": {"value": 1},
                "hits": [{"_source": {"id": "p1", "name": "Product"}}]
            }
        }
        with patch("app.services.products.product_service.search_products_query",
                   return_value=mock_response):
            result = ProductService.search_products_with_es(
                keyword="kem", min_price=None, max_price=None,
                limit=20, page=1
            )
        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_es_exception_raises_http_400(self):
        """ES raise exception → ResponseHandler.error_response → HTTPException 400."""
        with patch("app.services.products.product_service.search_products_query",
                   side_effect=Exception("ES down")):
            with pytest.raises(HTTPException) as exc:
                ProductService.search_products_with_es(
                    keyword="test", min_price=None, max_price=None,
                    limit=20, page=1
                )
            assert exc.value.status_code == 400
            assert exc.value.detail["success"] is False

# get_all_products


class TestGetAllProducts:

    def test_no_filters_returns_all(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(
            all_result=[mock_product], count=1)
        with patch("app.services.products.product_service.format_product_list_item",
                   return_value=MOCK_LIST_ITEM):
            result = ProductService.get_all_products(mock_db, {}, 1, 20)
        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_search_filter_calls_ilike(self, mock_db, mock_product):
        q = build_q(all_result=[mock_product], count=1)
        mock_db.query.return_value = q
        with patch("app.services.products.product_service.format_product_list_item",
                   return_value=MOCK_LIST_ITEM):
            ProductService.get_all_products(
                mock_db, {"search": "niacinamide"}, 1, 20)
        # filter được gọi nhiều lần (deleted_at + search ilike)
        assert q.filter.call_count >= 2

    def test_pagination_offsets_correctly(self, mock_db):
        q = build_q(all_result=[], count=0)
        mock_db.query.return_value = q
        with patch("app.services.products.product_service.format_product_list_item",
                   return_value=MOCK_LIST_ITEM):
            result = ProductService.get_all_products(mock_db, {}, 3, 10)
        q.offset.assert_called_once_with(20)   # (3-1)*10
        assert result["meta"]["page"] == 3

    def test_sort_asc_calls_asc(self, mock_db):
        q = build_q(all_result=[], count=0)
        mock_db.query.return_value = q
        with patch("app.services.products.product_service.format_product_list_item",
                   return_value=MOCK_LIST_ITEM):
            ProductService.get_all_products(
                mock_db, {"sort_by": "price", "sort_order": "asc"}, 1, 20)
        q.order_by.assert_called()

# get_product_by_id / get_product_by_slug


class TestGetProductById:

    def test_found_returns_detail(self, mock_db, mock_product, product_id):
        mock_db.query.return_value = build_q(first=mock_product)
        with patch("app.services.products.product_service.format_product_detail",
                   return_value=MOCK_DETAIL):
            result = ProductService.get_product_by_id(mock_db, product_id)
        assert result["success"] is True

    def test_not_found_raises_404(self, mock_db):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.get_product_by_id(mock_db, "ghost-id")
        assert exc.value.status_code == 404


class TestGetProductBySlug:

    def test_found_returns_detail(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(first=mock_product)
        with patch("app.services.products.product_service.format_product_detail",
                   return_value=MOCK_DETAIL):
            result = ProductService.get_product_by_slug(
                mock_db, "niacinamide-10")
        assert result["success"] is True

    def test_not_found_raises_404(self, mock_db):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.get_product_by_slug(mock_db, "nonexistent")
        assert exc.value.status_code == 404

# create_product


class TestCreateProduct:

    def _req(self, **overrides):
        base = dict(
            brand_id="brand-1", category_id="cat-1",
            name="Test", slug="test-product", sku="TEST-001",
            price=Decimal("200000.00"), stock_quantity=10
        )
        return ProductCreateRequest(**{**base, **overrides})

    def _valid_side_effect(self, mock_brand, mock_category, mock_product):
        """slug=None, sku=None, brand found, category found, reload product."""
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            n = calls[0]
            if n <= 2:
                q.first.return_value = None          # slug/sku not exists
            elif n == 3:
                q.first.return_value = mock_brand
            elif n == 4:
                q.first.return_value = mock_category
            else:
                q.first.return_value = mock_product  # reload
            return q
        return side_effect

    def test_valid_creates_product(self, mock_db, mock_brand, mock_category,
                                   mock_product, mock_admin_user):
        mock_db.query.side_effect = self._valid_side_effect(
            mock_brand, mock_category, mock_product)
        mock_db.flush.return_value = None
        with patch("app.services.products.product_service.format_product_detail",
                   return_value=MOCK_DETAIL):
            result = ProductService.create_product(
                mock_db, self._req(), mock_admin_user.id)
        assert result["success"] is True
        mock_db.add.assert_called()
        mock_db.flush.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_duplicate_slug_raises_409(self, mock_db, mock_product, mock_admin_user):
        mock_db.query.return_value = build_q(first=mock_product)  # slug exists
        with pytest.raises(HTTPException) as exc:
            ProductService.create_product(
                mock_db, self._req(), mock_admin_user.id)
        assert exc.value.status_code == 409

    def test_duplicate_sku_raises_409(self, mock_db, mock_product, mock_admin_user):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            q.first.return_value = None if calls[0] == 1 else mock_product
            return q
        mock_db.query.side_effect = side_effect
        with pytest.raises(HTTPException) as exc:
            ProductService.create_product(
                mock_db, self._req(), mock_admin_user.id)
        assert exc.value.status_code == 409

    def test_brand_not_found_raises_404(self, mock_db, mock_admin_user):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            q.first.return_value = None  # slug/sku OK, brand not found
            return q
        mock_db.query.side_effect = side_effect
        with pytest.raises(HTTPException) as exc:
            ProductService.create_product(
                mock_db, self._req(), mock_admin_user.id)
        assert exc.value.status_code == 404

    def test_category_not_found_raises_404(self, mock_db, mock_brand, mock_admin_user):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] <= 2:
                q.first.return_value = None       # slug/sku OK
            elif calls[0] == 3:
                q.first.return_value = mock_brand
            else:
                q.first.return_value = None        # category not found
            return q
        mock_db.query.side_effect = side_effect
        with pytest.raises(HTTPException) as exc:
            ProductService.create_product(
                mock_db, self._req(), mock_admin_user.id)
        assert exc.value.status_code == 404

# update_product


class TestUpdateProduct:

    def test_valid_update_succeeds(self, mock_db, mock_product, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=mock_product)
        mock_db.refresh.side_effect = lambda obj: None
        data = ProductUpdateRequest(name="New Name")
        result = ProductService.update_product(
            mock_db, product_id, data, mock_admin_user.id)
        assert result["success"] is True
        assert mock_product.name == "New Name"
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.update_product(
                mock_db, product_id, ProductUpdateRequest(), mock_admin_user.id)
        assert exc.value.status_code == 404

    def test_slug_conflict_raises_409(self, mock_db, mock_product, product_id, mock_admin_user):
        """slug thay đổi và slug mới đã tồn tại → 409."""
        existing = MagicMock()
        existing.id = "other-id"

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product   # get product
            else:
                q.first.return_value = existing        # slug conflict
            return q
        mock_db.query.side_effect = side_effect

        mock_product.slug = "old-slug"
        data = ProductUpdateRequest(slug="new-slug")
        with pytest.raises(HTTPException) as exc:
            ProductService.update_product(
                mock_db, product_id, data, mock_admin_user.id)
        assert exc.value.status_code == 409

    def test_update_tags_decrements_old_usage(
        self, mock_db, mock_product, mock_tag, product_id, mock_admin_user
    ):
        """tag_ids mới → old tags usage_count giảm, new tags tăng."""
        new_tag = MagicMock()
        new_tag.id = "new-tag-id"
        new_tag.usage_count = 2
        mock_product.tags = [mock_tag]
        original_count = mock_tag.usage_count

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = [new_tag]
            return q
        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        data = ProductUpdateRequest(tag_ids=["new-tag-id"])
        ProductService.update_product(
            mock_db, product_id, data, mock_admin_user.id)

        assert mock_tag.usage_count == original_count - 1
        assert new_tag.usage_count == 3  # +1

# delete_product


class TestDeleteProduct:

    def test_soft_delete_sets_deleted_at(
        self, mock_db, mock_product, product_id, mock_admin_user
    ):
        mock_product.tags = []
        mock_db.query.return_value = build_q(first=mock_product)
        result = ProductService.delete_product(
            mock_db, product_id, mock_admin_user.id)
        assert result["success"] is True
        assert mock_product.deleted_at is not None
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.delete_product(
                mock_db, product_id, mock_admin_user.id)
        assert exc.value.status_code == 404

    def test_decrements_tag_usage_count(
        self, mock_db, mock_product, mock_tag, product_id, mock_admin_user
    ):
        mock_product.tags = [mock_tag]
        original_count = mock_tag.usage_count
        mock_db.query.return_value = build_q(first=mock_product)
        ProductService.delete_product(mock_db, product_id, mock_admin_user.id)
        assert mock_tag.usage_count == original_count - 1

# toggle_availability / toggle_featured


class TestToggleAvailability:

    def test_available_becomes_unavailable(
        self, mock_db, mock_product, product_id, mock_admin_user
    ):
        mock_product.is_available = True
        mock_db.query.return_value = build_q(first=mock_product)
        mock_db.refresh.side_effect = lambda obj: None
        result = ProductService.toggle_availability(
            mock_db, product_id, mock_admin_user.id)
        assert mock_product.is_available is False
        assert "unavailable" in result["message"]

    def test_unavailable_becomes_available(
        self, mock_db, mock_product, product_id, mock_admin_user
    ):
        mock_product.is_available = False
        mock_db.query.return_value = build_q(first=mock_product)
        mock_db.refresh.side_effect = lambda obj: None
        ProductService.toggle_availability(
            mock_db, product_id, mock_admin_user.id)
        assert mock_product.is_available is True

    def test_not_found_raises_404(self, mock_db, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.toggle_availability(
                mock_db, product_id, mock_admin_user.id)
        assert exc.value.status_code == 404


class TestToggleFeatured:

    def test_not_featured_becomes_featured(
        self, mock_db, mock_product, product_id, mock_admin_user
    ):
        mock_product.is_featured = False
        mock_db.query.return_value = build_q(first=mock_product)
        mock_db.refresh.side_effect = lambda obj: None
        ProductService.toggle_featured(mock_db, product_id, mock_admin_user.id)
        assert mock_product.is_featured is True

    def test_not_found_raises_404(self, mock_db, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.toggle_featured(
                mock_db, product_id, mock_admin_user.id)
        assert exc.value.status_code == 404

# add_tags / remove_tag


class TestAddTags:

    def test_valid_tags_added_to_product(
        self, mock_db, mock_product, mock_tag, product_id
    ):
        mock_product.tags = []
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = [mock_tag]
            return q
        mock_db.query.side_effect = side_effect

        data = AddTagsRequest(tag_ids=[mock_tag.id])
        result = ProductService.add_tags(mock_db, product_id, data)
        assert result["success"] is True
        assert mock_tag in mock_product.tags
        assert mock_tag.usage_count == 6  # was 5

    def test_tag_not_found_raises_400(self, mock_db, mock_product, product_id):
        """len(tags) < len(tag_ids) → 400."""
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = []  # tag không tồn tại
            return q
        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc:
            ProductService.add_tags(
                mock_db, product_id, AddTagsRequest(tag_ids=["nonexistent"])
            )
        assert exc.value.status_code == 400

    def test_product_not_found_raises_404(self, mock_db, product_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.add_tags(
                mock_db, product_id, AddTagsRequest(tag_ids=["tag-1"])
            )
        assert exc.value.status_code == 404

    def test_already_associated_tag_not_re_added(
        self, mock_db, mock_product, mock_tag, product_id
    ):
        """Tag đã có trong product → không thêm lại, usage_count không tăng."""
        mock_product.tags = [mock_tag]
        original_count = mock_tag.usage_count

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = [mock_tag]
            return q
        mock_db.query.side_effect = side_effect

        ProductService.add_tags(mock_db, product_id,
                                AddTagsRequest(tag_ids=[mock_tag.id]))
        assert mock_tag.usage_count == original_count  # không thay đổi


class TestRemoveTag:

    def test_removes_tag_from_product(
        self, mock_db, mock_product, mock_tag, product_id, tag_id
    ):
        mock_product.tags = [mock_tag]
        original_count = mock_tag.usage_count

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.first.return_value = mock_tag
            return q
        mock_db.query.side_effect = side_effect

        result = ProductService.remove_tag(mock_db, product_id, tag_id)
        assert result["success"] is True
        assert mock_tag.usage_count == original_count - 1

    def test_tag_not_in_product_returns_success_with_different_message(
        self, mock_db, mock_product, mock_tag, product_id, tag_id
    ):
        """Tag không liên kết → không lỗi, message khác."""
        mock_product.tags = []

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.first.return_value = mock_tag
            return q
        mock_db.query.side_effect = side_effect

        result = ProductService.remove_tag(mock_db, product_id, tag_id)
        assert result["success"] is True
        assert "not associated" in result["message"]

    def test_product_not_found_raises_404(self, mock_db, product_id, tag_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.remove_tag(mock_db, product_id, tag_id)
        assert exc.value.status_code == 404

    def test_tag_not_found_raises_404(self, mock_db, mock_product, product_id, tag_id):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.first.return_value = None
            return q
        mock_db.query.side_effect = side_effect
        with pytest.raises(HTTPException) as exc:
            ProductService.remove_tag(mock_db, product_id, tag_id)
        assert exc.value.status_code == 404

# update_stock


class TestUpdateStock:

    def test_updates_stock_quantity(
        self, mock_db, mock_product, product_id, mock_admin_user
    ):
        mock_db.query.return_value = build_q(first=mock_product)
        mock_db.refresh.side_effect = lambda obj: None
        data = UpdateStockRequest(quantity=25)
        result = ProductService.update_stock(
            mock_db, product_id, data, mock_admin_user.id)
        assert result["success"] is True
        assert mock_product.stock_quantity == 25

    def test_not_found_raises_404(self, mock_db, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductService.update_stock(
                mock_db, product_id, UpdateStockRequest(quantity=10), mock_admin_user.id)
        assert exc.value.status_code == 404

# get_product_stats


class TestGetProductStats:
    """
    get_product_stats gọi db.query nhiều lần:
      call 1-5: .scalar() → total, available, out_of_stock, featured, avg_price
      call 6:   .all() → top_rated (list of tuples: (name, rating, count))
      call 7:   .all() → top_viewed (list of tuples: (name, views))
    """

    def test_returns_correct_structure(self, mock_db):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            n = calls[0]
            if n <= 4:
                q.scalar.return_value = n * 10
            elif n == 5:
                q.scalar.return_value = Decimal("150000.00")
            elif n == 6:
                q.all.return_value = [("Product A", Decimal("4.5"), 10)]
            else:
                q.all.return_value = [("Product B", 500)]
            return q
        mock_db.query.side_effect = side_effect

        result = ProductService.get_product_stats(mock_db)
        assert result["success"] is True
        for key in ("total_products", "available_products", "out_of_stock",
                    "featured_products", "average_price",
                    "top_rated_products", "top_viewed_products"):
            assert key in result["data"]

    def test_top_rated_formatted_correctly(self, mock_db):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] <= 5:
                q.scalar.return_value = 0
            elif calls[0] == 6:
                q.all.return_value = [("Best Product", Decimal("4.9"), 20)]
            else:
                q.all.return_value = []
            return q
        mock_db.query.side_effect = side_effect

        result = ProductService.get_product_stats(mock_db)
        top = result["data"]["top_rated_products"]
        assert len(top) == 1
        assert top[0]["name"] == "Best Product"
        assert top[0]["rating"] == 4.9

    def test_avg_price_is_float(self, mock_db):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 5:
                q.scalar.return_value = Decimal("99999.99")
            elif calls[0] < 5:
                q.scalar.return_value = 0
            elif calls[0] == 6:
                q.all.return_value = []
            else:
                q.all.return_value = []
            return q
        mock_db.query.side_effect = side_effect

        result = ProductService.get_product_stats(mock_db)
        assert isinstance(result["data"]["average_price"], float)
