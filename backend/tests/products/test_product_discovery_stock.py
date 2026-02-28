import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.products import ProductDiscoveryService, ProductStockService

MOCK_ITEM = {"id": "x", "name": "Test", "slug": "test"}


def build_q(first=None, all_result=None, count=0):
    q = MagicMock()
    for a in ("filter", "options", "join", "order_by", "offset", "limit"):
        getattr(q, a).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.count.return_value = count
    return q

# get_featured


class TestGetFeatured:

    def test_returns_featured_list(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(
            all_result=[mock_product], count=1)
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_featured(mock_db, limit=10)
        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_no_featured_returns_empty(self, mock_db):
        mock_db.query.return_value = build_q(all_result=[], count=0)
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_featured(mock_db)
        assert result["data"] == []

# get_trending


class TestGetTrending:

    def test_returns_trending_list(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(
            all_result=[mock_product], count=1)
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_trending(
                mock_db, days=7, limit=10)
        assert result["success"] is True

    def test_days_parameter_filters_by_updated_at(self, mock_db):
        q = build_q(all_result=[], count=0)
        mock_db.query.return_value = q
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            ProductDiscoveryService.get_trending(mock_db, days=30)
        # filter gọi với updated_at >= since
        q.filter.assert_called()

# get_new_arrivals


class TestGetNewArrivals:

    def test_returns_new_arrivals_with_pagination(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(
            all_result=[mock_product], count=5)
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_new_arrivals(
                mock_db, days=30, limit=10, page=1)
        assert result["success"] is True
        assert result["meta"]["total"] == 5

    def test_offset_applied_for_page_2(self, mock_db):
        q = build_q(all_result=[], count=0)
        mock_db.query.return_value = q
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            ProductDiscoveryService.get_new_arrivals(
                mock_db, days=30, limit=10, page=2)
        q.offset.assert_called_once_with(10)  # (2-1)*10

# get_on_sale


class TestGetOnSale:

    def test_returns_on_sale_products(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(
            all_result=[mock_product], count=1)
        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_on_sale(mock_db, limit=20)
        assert result["success"] is True

# get_by_brand


class TestGetByBrand:

    def test_valid_brand_slug_returns_products(
        self, mock_db, mock_brand, mock_product
    ):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_brand
            else:
                q.all.return_value = [mock_product]
                q.count.return_value = 1
            return q
        mock_db.query.side_effect = side_effect

        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_by_brand(
                mock_db, "the-ordinary", page=1, limit=20)
        assert result["success"] is True

    def test_brand_not_found_raises_404(self, mock_db):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductDiscoveryService.get_by_brand(mock_db, "nonexistent-brand")
        assert exc.value.status_code == 404

# get_by_category


class TestGetByCategory:

    def test_valid_category_slug_returns_products(
        self, mock_db, mock_category, mock_product
    ):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_category
            else:
                q.all.return_value = [mock_product]
                q.count.return_value = 1
            return q
        mock_db.query.side_effect = side_effect

        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_by_category(mock_db, "serum")
        assert result["success"] is True

    def test_category_not_found_raises_404(self, mock_db):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductDiscoveryService.get_by_category(mock_db, "nonexistent")
        assert exc.value.status_code == 404

# get_related


class TestGetRelated:

    def test_returns_related_products(self, mock_db, mock_product, product_id):
        mock_product.concerns = ["mun"]

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = [mock_product]
                q.count.return_value = 1
            return q
        mock_db.query.side_effect = side_effect

        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_related(
                mock_db, product_id, limit=5)
        assert result["success"] is True

    def test_product_not_found_raises_404(self, mock_db, product_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductDiscoveryService.get_related(mock_db, product_id)
        assert exc.value.status_code == 404

    def test_no_concerns_skips_concern_filter(self, mock_db, mock_product, product_id):
        """Product không có concerns → filter concerns KHÔNG được thêm."""
        mock_product.concerns = []

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = []
            return q
        mock_db.query.side_effect = side_effect

        with patch("app.services.products.product_discovery_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductDiscoveryService.get_related(mock_db, product_id)
        assert result["success"] is True

# ProductStockService - get_low_stock


class TestGetLowStock:

    def test_returns_low_stock_products(self, mock_db, mock_product):
        mock_db.query.return_value = build_q(all_result=[mock_product])
        with patch("app.services.products.product_stock_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductStockService.get_low_stock(mock_db, threshold=10)
        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_no_low_stock_returns_empty(self, mock_db):
        mock_db.query.return_value = build_q(all_result=[])
        with patch("app.services.products.product_stock_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductStockService.get_low_stock(mock_db)
        assert result["data"] == []
        # limit = 1 khi total = 0 (để tránh limit=0)
        assert result["meta"]["limit"] == 1

# ProductStockService - get_out_of_stock


class TestGetOutOfStock:

    def test_returns_out_of_stock_products(self, mock_db, mock_product):
        mock_product.stock_quantity = 0
        mock_db.query.return_value = build_q(all_result=[mock_product])
        with patch("app.services.products.product_stock_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductStockService.get_out_of_stock(mock_db)
        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_no_out_of_stock_returns_empty(self, mock_db):
        mock_db.query.return_value = build_q(all_result=[])
        with patch("app.services.products.product_stock_service.format_product_list_item",
                   return_value=MOCK_ITEM):
            result = ProductStockService.get_out_of_stock(mock_db)
        assert result["data"] == []
