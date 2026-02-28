import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.products import ProductImageService, ProductVariantService
from app.schemas.products import (
    ProductImageCreateRequest, ProductImageUpdateRequest,
    ProductVariantCreateRequest, ProductVariantUpdateRequest
)


def build_q(first=None, all_result=None):
    q = MagicMock()
    for a in ("filter", "options", "order_by", "offset", "limit", "update"):
        getattr(q, a).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    return q

# ProductImageService - add_image


class TestAddImage:

    def test_adds_non_primary_image(self, mock_db, mock_product, mock_image, product_id):
        mock_db.query.return_value = build_q(first=mock_product)
        mock_db.refresh.side_effect = lambda obj: None

        data = ProductImageCreateRequest(
            image_url="https://example.com/new.jpg",
            is_primary=False, display_order=1
        )
        result = ProductImageService.add_image(mock_db, product_id, data)
        assert result["success"] is True
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_add_primary_image_bulk_updates_existing(
        self, mock_db, mock_product, product_id
    ):
        """is_primary=True → db.query(ProductImage).filter(...).update(...) gọi trước."""
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            # calls[0] == 2: ProductImage query for bulk update
            return q
        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        data = ProductImageCreateRequest(
            image_url="https://example.com/primary.jpg",
            is_primary=True, display_order=0
        )
        ProductImageService.add_image(mock_db, product_id, data)

        # Phải gọi query ít nhất 2 lần (get product + bulk update)
        assert mock_db.query.call_count >= 2

    def test_product_not_found_raises_404(self, mock_db, product_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductImageService.add_image(
                mock_db, product_id,
                ProductImageCreateRequest(image_url="https://x.com/img.jpg")
            )
        assert exc.value.status_code == 404

# ProductImageService - update_image


class TestUpdateImage:

    def test_updates_alt_text(self, mock_db, mock_image, product_id, image_id):
        mock_db.query.return_value = build_q(first=mock_image)
        mock_db.refresh.side_effect = lambda obj: None

        data = ProductImageUpdateRequest(alt_text="New Alt Text")
        result = ProductImageService.update_image(
            mock_db, product_id, image_id, data)
        assert result["success"] is True
        assert mock_image.alt_text == "New Alt Text"

    def test_set_primary_clears_others(
        self, mock_db, mock_image, product_id, image_id
    ):
        """is_primary=True, hiện tại False → bulk update các image khác."""
        mock_image.is_primary = False

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_image
            return q
        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        data = ProductImageUpdateRequest(is_primary=True)
        ProductImageService.update_image(mock_db, product_id, image_id, data)

        # bulk update gọi ít nhất 1 lần (để clear others)
        assert mock_db.query.call_count >= 2

    def test_image_not_found_raises_404(self, mock_db, product_id, image_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductImageService.update_image(
                mock_db, product_id, image_id,
                ProductImageUpdateRequest()
            )
        assert exc.value.status_code == 404

# ProductImageService - delete_image


class TestDeleteImage:

    def test_hard_deletes_image(self, mock_db, mock_image, product_id, image_id):
        """ProductImageService dùng db.delete() (KHÔNG soft delete)."""
        mock_db.query.return_value = build_q(first=mock_image)

        result = ProductImageService.delete_image(
            mock_db, product_id, image_id)
        assert result["success"] is True
        mock_db.delete.assert_called_once_with(mock_image)
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, product_id, image_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductImageService.delete_image(mock_db, product_id, image_id)
        assert exc.value.status_code == 404

# ProductVariantService - get_all_variants


class TestGetAllVariants:

    def test_returns_variants_list(
        self, mock_db, mock_product, mock_variant, product_id
    ):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.all.return_value = [mock_variant]
            return q
        mock_db.query.side_effect = side_effect

        with patch("app.services.products.product_variant_service.format_product_variant",
                   return_value={"id": mock_variant.id, "name": "50ml"}):
            result = ProductVariantService.get_all_variants(
                mock_db, product_id)

        assert result["success"] is True
        assert result["data"]["total"] == 1

    def test_product_not_found_raises_404(self, mock_db, product_id):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductVariantService.get_all_variants(mock_db, product_id)
        assert exc.value.status_code == 404

# ProductVariantService - add_variant


class TestAddVariant:

    def _req(self, **overrides):
        base = dict(name="50ml", sku="VAR-NEW-001",
                    price=Decimal("150000.00"), stock_quantity=10)
        return ProductVariantCreateRequest(**{**base, **overrides})

    def test_adds_variant_to_product(
        self, mock_db, mock_product, mock_variant, product_id, mock_admin_user
    ):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product   # get product
            elif calls[0] == 2:
                q.first.return_value = None          # sku not exists
            return q
        mock_db.query.side_effect = side_effect
        mock_db.refresh.side_effect = lambda obj: None

        result = ProductVariantService.add_variant(
            mock_db, product_id, self._req(), mock_admin_user.id)
        assert result["success"] is True
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_duplicate_sku_raises_409(
        self, mock_db, mock_product, mock_variant, product_id, mock_admin_user
    ):
        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_product
            else:
                q.first.return_value = mock_variant  # sku exists
            return q
        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc:
            ProductVariantService.add_variant(
                mock_db, product_id, self._req(), mock_admin_user.id)
        assert exc.value.status_code == 409

    def test_product_not_found_raises_404(self, mock_db, product_id, mock_admin_user):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductVariantService.add_variant(
                mock_db, product_id, self._req(), mock_admin_user.id)
        assert exc.value.status_code == 404

# ProductVariantService - update_variant


class TestUpdateVariant:

    def test_updates_variant_fields(
        self, mock_db, mock_variant, product_id, variant_id, mock_admin_user
    ):
        mock_db.query.return_value = build_q(first=mock_variant)
        mock_db.refresh.side_effect = lambda obj: None

        data = ProductVariantUpdateRequest(stock_quantity=20)
        result = ProductVariantService.update_variant(
            mock_db, product_id, variant_id, data, mock_admin_user.id)
        assert result["success"] is True
        assert mock_variant.stock_quantity == 20

    def test_duplicate_sku_raises_409(
        self, mock_db, mock_variant, product_id, variant_id, mock_admin_user
    ):
        existing = MagicMock()
        existing.id = "other-variant-id"
        mock_variant.sku = "CURRENT-SKU"

        calls = [0]

        def side_effect(*args, **kwargs):
            calls[0] += 1
            q = build_q()
            if calls[0] == 1:
                q.first.return_value = mock_variant
            else:
                q.first.return_value = existing  # sku conflict
            return q
        mock_db.query.side_effect = side_effect

        data = ProductVariantUpdateRequest(sku="CONFLICT-SKU")
        with pytest.raises(HTTPException) as exc:
            ProductVariantService.update_variant(
                mock_db, product_id, variant_id, data, mock_admin_user.id)
        assert exc.value.status_code == 409

    def test_not_found_raises_404(
        self, mock_db, product_id, variant_id, mock_admin_user
    ):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductVariantService.update_variant(
                mock_db, product_id, variant_id,
                ProductVariantUpdateRequest(), mock_admin_user.id)
        assert exc.value.status_code == 404

# ProductVariantService - delete_variant


class TestDeleteVariant:

    def test_soft_deletes_variant(
        self, mock_db, mock_variant, product_id, variant_id, mock_admin_user
    ):
        """SOFT delete: variant.deleted_at được set, db.delete() KHÔNG được gọi."""
        mock_db.query.return_value = build_q(first=mock_variant)

        result = ProductVariantService.delete_variant(
            mock_db, product_id, variant_id, mock_admin_user.id)

        assert result["success"] is True
        assert mock_variant.deleted_at is not None
        mock_db.delete.assert_not_called()   # KHÔNG gọi hard delete
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(
        self, mock_db, product_id, variant_id, mock_admin_user
    ):
        mock_db.query.return_value = build_q(first=None)
        with pytest.raises(HTTPException) as exc:
            ProductVariantService.delete_variant(
                mock_db, product_id, variant_id, mock_admin_user.id)
        assert exc.value.status_code == 404
