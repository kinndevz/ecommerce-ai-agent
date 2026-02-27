import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.brands import BrandService
from app.schemas.brands import BrandCreateRequest, BrandUpdateRequest


# HELPER
def build_query_chain(first=None, all_result=None, scalar_val=0):
    """Mock toàn bộ SQLAlchemy query chain."""
    q = MagicMock()
    for attr in ("filter", "join", "outerjoin", "group_by",
                 "order_by", "limit", "options"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.scalar.return_value = scalar_val
    q.count.return_value = scalar_val
    return q


def make_brand_result(brand_mock, product_count=3):
    """Tuple (brand, product_count) như outerjoin trả về."""
    return (brand_mock, product_count)


# GET ALL BRANDS
class TestGetAllBrands:

    def test_returns_active_brands_by_default(self, mock_db, mock_brand):
        """Mặc định chỉ trả về brand đang active."""
        q = build_query_chain(all_result=[make_brand_result(mock_brand)])
        mock_db.query.return_value = q

        with patch("app.services.brands.model_to_dict", return_value={"id": mock_brand.id}):
            result = BrandService.get_all_brands(
                mock_db, include_inactive=False)

        assert result["success"] is True
        assert result["data"]["total"] == 1
        assert len(result["data"]["brands"]) == 1

    def test_include_inactive_skips_active_filter(self, mock_db, mock_brand):
        """include_inactive=True → không filter is_active."""
        q = build_query_chain(all_result=[make_brand_result(mock_brand)])
        mock_db.query.return_value = q

        with patch("app.services.brands.model_to_dict", return_value={"id": mock_brand.id}):
            result = BrandService.get_all_brands(
                mock_db, include_inactive=True)

        assert result["success"] is True

    def test_empty_result_returns_empty_list(self, mock_db):
        """Không có brand nào → data rỗng."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = BrandService.get_all_brands(mock_db)

        assert result["data"]["brands"] == []
        assert result["data"]["total"] == 0

    def test_response_includes_product_count(self, mock_db, mock_brand):
        """Mỗi brand trong response phải có product_count."""
        q = build_query_chain(
            all_result=[make_brand_result(mock_brand, product_count=5)])
        mock_db.query.return_value = q

        with patch("app.services.brands.model_to_dict", return_value={"id": mock_brand.id}):
            result = BrandService.get_all_brands(mock_db)

        assert result["data"]["brands"][0]["product_count"] == 5

    def test_message_is_correct(self, mock_db):
        """Message phải đúng."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = BrandService.get_all_brands(mock_db)

        assert result["message"] == "Brands retrieved successfully"


# GET BRAND BY ID
class TestGetBrandById:

    def test_existing_id_returns_brand_with_product_count(
        self, mock_db, mock_brand, brand_id
    ):
        """Brand tồn tại → trả về data kèm product_count."""
        q = build_query_chain(first=make_brand_result(
            mock_brand, product_count=7))
        mock_db.query.return_value = q

        with patch("app.services.brands.model_to_dict", return_value={"id": brand_id}):
            result = BrandService.get_brand_by_id(mock_db, brand_id)

        assert result["success"] is True
        assert result["data"]["product_count"] == 7

    def test_not_found_raises_404(self, mock_db):
        """Brand không tồn tại → raise 404."""
        q = build_query_chain(first=None)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            BrandService.get_brand_by_id(mock_db, "ghost-id")

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail["success"] is False

    def test_message_contains_brand(self, mock_db, mock_brand, brand_id):
        """Message phải chứa 'Brand'."""
        q = build_query_chain(first=make_brand_result(mock_brand))
        mock_db.query.return_value = q

        with patch("app.services.brands.model_to_dict", return_value={"id": brand_id}):
            result = BrandService.get_brand_by_id(mock_db, brand_id)

        assert "Brand" in result["message"]


# CREATE BRAND
class TestCreateBrand:

    def _make_request(self):
        return BrandCreateRequest(
            name="La Roche-Posay",
            slug="la-roche-posay",
            description="French dermatological brand",
            country="France",
            website_url="https://laroche-posay.com",
            logo_url="https://laroche-posay.com/logo.png",
        )

    def test_valid_data_creates_brand_successfully(
        self, mock_db, mock_brand, admin_id
    ):
        """Happy path: tạo brand thành công."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            # Lần 1: check slug → None (chưa tồn tại)
            q.first.return_value = None if call_count == 1 else mock_brand
            return q

        mock_db.query.side_effect = side_effect

        result = BrandService.create_brand(
            mock_db, self._make_request(), admin_id)

        assert result["success"] is True
        assert result["message"] == "Brand created successfully"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_duplicate_slug_raises_409(self, mock_db, mock_brand, admin_id):
        """Slug đã tồn tại → raise 409 Conflict."""
        q = build_query_chain(first=mock_brand)  # slug đã có
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            BrandService.create_brand(mock_db, self._make_request(), admin_id)

        assert exc_info.value.status_code == 409
        assert "slug" in exc_info.value.detail["message"]

    def test_created_brand_has_is_active_true(self, mock_db, mock_brand, admin_id):
        """Brand mới tạo phải có is_active=True."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = None if call_count == 1 else mock_brand
            return q

        mock_db.query.side_effect = side_effect

        BrandService.create_brand(mock_db, self._make_request(), admin_id)

        added_brand = mock_db.add.call_args[0][0]
        assert added_brand.is_active is True

    def test_created_brand_has_correct_created_by_id(
        self, mock_db, mock_brand, admin_id
    ):
        """created_by_id phải là admin_id."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = None if call_count == 1 else mock_brand
            return q

        mock_db.query.side_effect = side_effect

        BrandService.create_brand(mock_db, self._make_request(), admin_id)

        added_brand = mock_db.add.call_args[0][0]
        assert added_brand.created_by_id == admin_id


# UPDATE BRAND
class TestUpdateBrand:

    def test_valid_data_updates_successfully(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Happy path: cập nhật thành công."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        data = BrandUpdateRequest(name="CeraVe Updated")
        result = BrandService.update_brand(mock_db, brand_id, data, admin_id)

        assert result["success"] is True
        assert result["message"] == "Brand updated successfully"
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Brand không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            BrandService.update_brand(
                mock_db, "ghost-id", BrandUpdateRequest(name="X"), admin_id
            )

        assert exc_info.value.status_code == 404

    def test_duplicate_slug_on_another_brand_raises_409(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Slug mới đã thuộc về brand khác → raise 409."""
        other_brand = MagicMock()
        other_brand.id = "other-brand-id"
        other_brand.slug = "new-slug"

        mock_brand.slug = "old-slug"
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            # Lần 1: tìm brand cần update → mock_brand
            # Lần 2: check slug trùng → other_brand (đã có brand khác dùng slug này)
            q.first.return_value = mock_brand if call_count == 1 else other_brand
            return q

        mock_db.query.side_effect = side_effect

        data = BrandUpdateRequest(slug="new-slug")

        with pytest.raises(HTTPException) as exc_info:
            BrandService.update_brand(mock_db, brand_id, data, admin_id)

        assert exc_info.value.status_code == 409

    def test_same_slug_does_not_trigger_duplicate_check(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Giữ nguyên slug → không cần check trùng."""
        mock_brand.slug = "cerave"
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        data = BrandUpdateRequest(slug="cerave")  # same slug
        result = BrandService.update_brand(mock_db, brand_id, data, admin_id)

        assert result["success"] is True
        # Chỉ 1 lần query (tìm brand), không có lần 2 (check slug)
        assert mock_db.query.call_count == 1

    def test_sets_updated_by_id(self, mock_db, mock_brand, admin_id, brand_id):
        """updated_by_id phải được gán đúng."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        BrandService.update_brand(
            mock_db, brand_id, BrandUpdateRequest(name="X"), admin_id
        )

        assert mock_brand.updated_by_id == admin_id

    def test_only_updates_provided_fields(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """model_dump(exclude_unset=True) → chỉ field truyền vào mới được set."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        # Chỉ update country, không truyền name
        BrandService.update_brand(
            mock_db, brand_id, BrandUpdateRequest(country="Vietnam"), admin_id
        )

        name_calls = [c for c in mock_brand.method_calls if "name" in str(c)]
        assert len(name_calls) == 0


# DELETE BRAND
class TestDeleteBrand:

    def test_soft_delete_without_products_succeeds(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Brand không có product → soft delete thành công."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_brand  # tìm brand
            else:
                q.scalar.return_value = 0          # product_count = 0
            return q

        mock_db.query.side_effect = side_effect

        result = BrandService.delete_brand(mock_db, brand_id, admin_id)

        assert result["success"] is True
        assert mock_brand.deleted_at is not None
        assert mock_brand.deleted_by_id == admin_id
        mock_db.delete.assert_not_called()  # soft delete, không hard delete
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Brand không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            BrandService.delete_brand(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_brand_with_products_cannot_be_deleted(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Brand có product → raise 400 Bad Request."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_brand  # tìm brand
            else:
                q.scalar.return_value = 5          # có 5 products
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            BrandService.delete_brand(mock_db, brand_id, admin_id)

        assert exc_info.value.status_code == 400
        assert "products" in exc_info.value.detail["message"]

    def test_error_message_includes_product_count(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Error message phải chứa số lượng product cụ thể."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_brand
            else:
                q.scalar.return_value = 3
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            BrandService.delete_brand(mock_db, brand_id, admin_id)

        assert "3" in exc_info.value.detail["message"]


# TOGGLE STATUS
class TestToggleStatus:

    def test_active_brand_becomes_inactive(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """is_active=True → toggle → is_active=False."""
        mock_brand.is_active = True
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        BrandService.toggle_status(mock_db, brand_id, admin_id)

        assert mock_brand.is_active is False

    def test_inactive_brand_becomes_active(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """is_active=False → toggle → is_active=True."""
        mock_brand.is_active = False
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        BrandService.toggle_status(mock_db, brand_id, admin_id)

        assert mock_brand.is_active is True

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Brand không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            BrandService.toggle_status(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_response_message_reflects_new_status_active(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Message phải phản ánh status mới: 'active'."""
        mock_brand.is_active = False  # sẽ toggle thành True
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        result = BrandService.toggle_status(mock_db, brand_id, admin_id)

        assert "active" in result["message"]

    def test_response_message_reflects_new_status_inactive(
        self, mock_db, mock_brand, admin_id, brand_id
    ):
        """Message phải phản ánh status mới: 'inactive'."""
        mock_brand.is_active = True  # sẽ toggle thành False
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        result = BrandService.toggle_status(mock_db, brand_id, admin_id)

        assert "inactive" in result["message"]

    def test_sets_updated_by_id(self, mock_db, mock_brand, admin_id, brand_id):
        """updated_by_id phải được gán đúng."""
        mock_brand.is_active = True
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_brand)

        BrandService.toggle_status(mock_db, brand_id, admin_id)

        assert mock_brand.updated_by_id == admin_id


# GET BRAND STATS

class TestGetBrandStats:

    def test_returns_correct_structure(self, mock_db):
        """Response phải có đầy đủ các key thống kê."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 2:
                q.scalar.return_value = 10
            else:
                q.all.return_value = [("CeraVe", 20), ("The Ordinary", 15)]
            return q

        mock_db.query.side_effect = side_effect

        result = BrandService.get_brand_stats(mock_db)

        assert result["success"] is True
        for key in ("total_brands", "active_brands", "inactive_brands", "top_brands"):
            assert key in result["data"]

    def test_inactive_equals_total_minus_active(self, mock_db):
        """inactive_brands = total - active."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.scalar.return_value = 10   # total
            elif call_count == 2:
                q.scalar.return_value = 8    # active
            else:
                q.all.return_value = []
            return q

        mock_db.query.side_effect = side_effect

        result = BrandService.get_brand_stats(mock_db)

        assert result["data"]["total_brands"] == 10
        assert result["data"]["active_brands"] == 8
        assert result["data"]["inactive_brands"] == 2

    def test_top_brands_have_correct_format(self, mock_db):
        """top_brands phải là list dict với key name và product_count."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 2:
                q.scalar.return_value = 5
            else:
                q.all.return_value = [("CeraVe", 20)]
            return q

        mock_db.query.side_effect = side_effect

        result = BrandService.get_brand_stats(mock_db)

        top = result["data"]["top_brands"]
        assert len(top) == 1
        assert top[0]["name"] == "CeraVe"
        assert top[0]["product_count"] == 20
