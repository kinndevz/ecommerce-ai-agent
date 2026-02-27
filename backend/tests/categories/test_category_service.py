import pytest
from unittest.mock import MagicMock, patch, call
from fastapi import HTTPException
from app.services.categories import CategoryService
from app.schemas.categories import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryMoveRequest,
)


# HELPER

def build_query_chain(first=None, all_result=None, scalar_val=0):
    """Mock toàn bộ SQLAlchemy query chain."""
    q = MagicMock()
    for attr in ("filter", "join", "outerjoin", "group_by",
                 "order_by", "limit", "options", "asc",
                 "desc", "nullsfirst"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.scalar.return_value = scalar_val
    q.count.return_value = scalar_val
    return q


def make_cat_result(cat_mock, product_count=0):
    """Tuple (category, product_count) như outerjoin trả về."""
    return (cat_mock, product_count)


# GET ALL CATEGORIES

class TestGetAllCategories:

    def test_returns_active_categories_by_default(
        self, mock_db, mock_category
    ):
        """Mặc định chỉ trả về category active."""
        q = build_query_chain(all_result=[make_cat_result(mock_category)])
        mock_db.query.return_value = q

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": mock_category.id}):
            result = CategoryService.get_all_categories(
                mock_db, include_inactive=False
            )

        assert result["success"] is True
        assert result["data"]["total"] == 1
        assert len(result["data"]["categories"]) == 1

    def test_include_inactive_returns_all(self, mock_db, mock_category):
        """include_inactive=True → không filter is_active."""
        q = build_query_chain(all_result=[make_cat_result(mock_category)])
        mock_db.query.return_value = q

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": mock_category.id}):
            result = CategoryService.get_all_categories(
                mock_db, include_inactive=True
            )

        assert result["success"] is True

    def test_empty_db_returns_empty_list(self, mock_db):
        """Không có category nào → data rỗng."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = CategoryService.get_all_categories(mock_db)

        assert result["data"]["categories"] == []
        assert result["data"]["total"] == 0

    def test_response_includes_product_count_and_children_count(
        self, mock_db, mock_category
    ):
        """Mỗi category phải có product_count và children_count."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                # query chính trả về list categories
                q.all.return_value = [make_cat_result(mock_category, 5)]
            else:
                # query đếm children
                q.scalar.return_value = 3
            return q

        mock_db.query.side_effect = side_effect

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": mock_category.id}):
            result = CategoryService.get_all_categories(mock_db)

        cat = result["data"]["categories"][0]
        assert cat["product_count"] == 5
        assert cat["children_count"] == 3

    def test_message_is_correct(self, mock_db):
        """Message phải đúng."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = CategoryService.get_all_categories(mock_db)

        assert result["message"] == "Categories retrieved successfully"


# GET CATEGORY TREE

class TestGetCategoryTree:

    def test_returns_tree_structure_with_children_key(
        self, mock_db, mock_category
    ):
        """Mỗi item trong tree phải có key 'children'."""
        q = build_query_chain(all_result=[make_cat_result(mock_category)])
        mock_db.query.return_value = q

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": mock_category.id, "parent_id": None}):
            result = CategoryService.get_category_tree(mock_db)

        assert result["success"] is True
        assert "children" in result["data"][0]

    def test_root_categories_have_no_parent(self, mock_db, mock_category):
        """Category root (parent_id=None) phải nằm ở top-level."""
        mock_category.parent_id = None
        q = build_query_chain(all_result=[make_cat_result(mock_category)])
        mock_db.query.return_value = q

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": mock_category.id, "parent_id": None}):
            result = CategoryService.get_category_tree(mock_db)

        assert len(result["data"]) == 1
        assert result["data"][0]["parent_id"] is None

    def test_empty_db_returns_empty_list(self, mock_db):
        """Không có category → data=[]."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = CategoryService.get_category_tree(mock_db)

        assert result["data"] == []

    def test_message_is_correct(self, mock_db):
        """Message phải đúng."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = CategoryService.get_category_tree(mock_db)

        assert result["message"] == "Category tree retrieved successfully"


# GET CATEGORY BY ID

class TestGetCategoryById:

    def test_existing_id_returns_category_with_counts(
        self, mock_db, mock_category, category_id
    ):
        """Category tồn tại → trả về data kèm product_count và children_count."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = make_cat_result(mock_category, 4)
            else:
                q.scalar.return_value = 2  # children_count
            return q

        mock_db.query.side_effect = side_effect

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": category_id}):
            result = CategoryService.get_category_by_id(mock_db, category_id)

        assert result["success"] is True
        assert result["data"]["product_count"] == 4
        assert result["data"]["children_count"] == 2

    def test_not_found_raises_404(self, mock_db):
        """Category không tồn tại → raise 404."""
        q = build_query_chain(first=None)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.get_category_by_id(mock_db, "ghost-id")

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail["success"] is False

    def test_children_count_is_queried_separately(
        self, mock_db, mock_category, category_id
    ):
        """children_count phải được query riêng (không lấy từ outerjoin)."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = make_cat_result(mock_category)
            else:
                q.scalar.return_value = 3
            return q

        mock_db.query.side_effect = side_effect

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": category_id}):
            result = CategoryService.get_category_by_id(mock_db, category_id)

        assert result["data"]["children_count"] == 3
        # Phải có ít nhất 2 lần query: 1 cho category, 1 cho children_count
        assert mock_db.query.call_count >= 2

    def test_message_contains_category(
        self, mock_db, mock_category, category_id
    ):
        """Message phải chứa 'Category'."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = make_cat_result(
                mock_category) if call_count == 1 else None
            q.scalar.return_value = 0
            return q

        mock_db.query.side_effect = side_effect

        with patch("app.services.categories.model_to_dict",
                   return_value={"id": category_id}):
            result = CategoryService.get_category_by_id(mock_db, category_id)

        assert "Category" in result["message"]


# CREATE CATEGORY

class TestCreateCategory:

    def _make_request(self, parent_id=None):
        return CategoryCreateRequest(
            name="Cleanser",
            slug="cleanser",
            description="Face cleansers",
            parent_id=parent_id,
            image_url=None,
            display_order=0,
        )

    def _setup_query(self, mock_db, slug_exists=False,
                     parent_exists=True, mock_category=None, mock_parent=None):
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                # check slug
                q.first.return_value = mock_category if slug_exists else None
            elif call_count == 2:
                # check parent
                q.first.return_value = mock_parent if parent_exists else None
            else:
                q.first.return_value = mock_category
            return q

        mock_db.query.side_effect = side_effect

    def test_valid_data_without_parent_creates_root_category(
        self, mock_db, mock_category, admin_id
    ):
        """parent_id=None, slug chưa có → tạo root category thành công."""
        self._setup_query(mock_db, slug_exists=False,
                          mock_category=mock_category)

        result = CategoryService.create_category(
            mock_db, self._make_request(parent_id=None), admin_id
        )

        assert result["success"] is True
        assert result["message"] == "Category created successfully"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_valid_data_with_parent_creates_child_category(
        self, mock_db, mock_category, mock_child_category,
        admin_id, parent_category_id
    ):
        """parent_id hợp lệ → tạo child category thành công."""
        mock_parent = MagicMock()
        mock_parent.id = parent_category_id
        self._setup_query(mock_db, slug_exists=False,
                          parent_exists=True,
                          mock_category=mock_category,
                          mock_parent=mock_parent)

        result = CategoryService.create_category(
            mock_db, self._make_request(parent_id=parent_category_id), admin_id
        )

        assert result["success"] is True
        added = mock_db.add.call_args[0][0]
        assert added.parent_id == parent_category_id

    def test_duplicate_slug_raises_409(
        self, mock_db, mock_category, admin_id
    ):
        """Slug đã tồn tại → raise 409."""
        self._setup_query(mock_db, slug_exists=True,
                          mock_category=mock_category)

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.create_category(
                mock_db, self._make_request(), admin_id
            )

        assert exc_info.value.status_code == 409
        assert "slug" in exc_info.value.detail["message"]

    def test_parent_not_found_raises_404(
        self, mock_db, mock_category, admin_id, parent_category_id
    ):
        """parent_id không tồn tại → raise 404."""
        self._setup_query(mock_db, slug_exists=False,
                          parent_exists=False, mock_category=mock_category)

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.create_category(
                mock_db, self._make_request(
                    parent_id=parent_category_id), admin_id
            )

        assert exc_info.value.status_code == 404
        assert "Parent category" in exc_info.value.detail["message"]

    def test_created_category_has_is_active_true(
        self, mock_db, mock_category, admin_id
    ):
        """Category mới phải có is_active=True."""
        self._setup_query(mock_db, slug_exists=False,
                          mock_category=mock_category)

        CategoryService.create_category(
            mock_db, self._make_request(), admin_id
        )

        added = mock_db.add.call_args[0][0]
        assert added.is_active is True

    def test_created_category_has_correct_created_by_id(
        self, mock_db, mock_category, admin_id
    ):
        """created_by_id phải là admin_id."""
        self._setup_query(mock_db, slug_exists=False,
                          mock_category=mock_category)

        CategoryService.create_category(
            mock_db, self._make_request(), admin_id
        )

        added = mock_db.add.call_args[0][0]
        assert added.created_by_id == admin_id


# UPDATE CATEGORY

class TestUpdateCategory:

    def test_valid_data_updates_successfully(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Happy path: cập nhật thành công."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        data = CategoryUpdateRequest(name="Updated Skincare")
        result = CategoryService.update_category(
            mock_db, category_id, data, admin_id
        )

        assert result["success"] is True
        assert result["message"] == "Category updated successfully"
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Category không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.update_category(
                mock_db, "ghost-id",
                CategoryUpdateRequest(name="X"), admin_id
            )

        assert exc_info.value.status_code == 404

    def test_duplicate_slug_on_another_category_raises_409(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Slug mới thuộc category khác → raise 409."""
        other_cat = MagicMock()
        other_cat.id = "other-cat-id"
        mock_category.slug = "old-slug"
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_category if call_count == 1 else other_cat
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.update_category(
                mock_db, category_id,
                CategoryUpdateRequest(slug="new-slug"), admin_id
            )

        assert exc_info.value.status_code == 409

    def test_same_slug_does_not_trigger_duplicate_check(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Giữ nguyên slug → không query check trùng."""
        mock_category.slug = "skincare"
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        data = CategoryUpdateRequest(slug="skincare")
        result = CategoryService.update_category(
            mock_db, category_id, data, admin_id
        )

        assert result["success"] is True
        assert mock_db.query.call_count == 1

    def test_parent_id_equal_self_raises_400(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """parent_id == category_id → raise 400."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.update_category(
                mock_db, category_id,
                CategoryUpdateRequest(parent_id=category_id), admin_id
            )

        assert exc_info.value.status_code == 400
        assert "own parent" in exc_info.value.detail["message"]

    def test_parent_not_found_raises_404(
        self, mock_db, mock_category, admin_id, category_id, parent_category_id
    ):
        """parent_id không tồn tại → raise 404."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            # Lần 1: tìm category → có
            # Lần 2: tìm parent → không có
            q.first.return_value = mock_category if call_count == 1 else None
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.update_category(
                mock_db, category_id,
                CategoryUpdateRequest(parent_id=parent_category_id), admin_id
            )

        assert exc_info.value.status_code == 404
        assert "Parent category" in exc_info.value.detail["message"]

    def test_sets_updated_by_id(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """updated_by_id phải được gán đúng."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        CategoryService.update_category(
            mock_db, category_id,
            CategoryUpdateRequest(name="X"), admin_id
        )

        assert mock_category.updated_by_id == admin_id

    def test_only_updates_provided_fields(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """model_dump(exclude_unset=True) → chỉ field truyền vào mới được set."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        # Chỉ truyền name, không truyền slug
        CategoryService.update_category(
            mock_db, category_id,
            CategoryUpdateRequest(name="Updated"), admin_id
        )

        slug_calls = [
            c for c in mock_category.method_calls if "slug" in str(c)]
        assert len(slug_calls) == 0


# DELETE CATEGORY

class TestDeleteCategory:

    def test_soft_delete_without_products_and_children(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Không có product, không có children → soft delete thành công."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_category  # tìm category
            elif call_count == 2:
                q.scalar.return_value = 0             # product_count = 0
            else:
                q.all.return_value = []               # no children
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.delete_category(
            mock_db, category_id, admin_id)

        assert result["success"] is True
        assert mock_category.deleted_at is not None
        assert mock_category.deleted_by_id == admin_id
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Category không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.delete_category(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_category_with_products_raises_400(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Category có products → raise 400."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_category
            else:
                q.scalar.return_value = 5  # 5 products
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.delete_category(mock_db, category_id, admin_id)

        assert exc_info.value.status_code == 400
        assert "products" in exc_info.value.detail["message"]

    def test_error_message_includes_product_count(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Error message phải chứa số lượng product cụ thể."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_category
            else:
                q.scalar.return_value = 4
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.delete_category(mock_db, category_id, admin_id)

        assert "4" in exc_info.value.detail["message"]

    def test_category_with_children_deletes_children_recursively(
        self, mock_db, mock_category, mock_child_category, admin_id, category_id
    ):
        """Category có children → children bị soft delete trước, rồi đến cha."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_category      # tìm category cha
            elif call_count == 2:
                q.scalar.return_value = 0                 # cha không có product
            elif call_count == 3:
                q.all.return_value = [mock_child_category]  # cha có 1 child
            elif call_count == 4:
                q.first.return_value = mock_child_category  # tìm child trong recursive
            elif call_count == 5:
                q.scalar.return_value = 0                 # child không có product
            else:
                q.all.return_value = []                   # child không có children
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.delete_category(
            mock_db, category_id, admin_id)

        assert result["success"] is True
        # Child phải bị soft delete
        assert mock_child_category.deleted_at is not None
        assert mock_child_category.deleted_by_id == admin_id
        # Cha cũng phải bị soft delete
        assert mock_category.deleted_at is not None

    def test_sets_deleted_by_id(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """deleted_by_id phải là admin_id."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_category
            elif call_count == 2:
                q.scalar.return_value = 0
            else:
                q.all.return_value = []
            return q

        mock_db.query.side_effect = side_effect

        CategoryService.delete_category(mock_db, category_id, admin_id)

        assert mock_category.deleted_by_id == admin_id


# TOGGLE STATUS

class TestToggleStatus:

    def test_active_category_becomes_inactive(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """is_active=True → toggle → is_active=False."""
        mock_category.is_active = True
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        CategoryService.toggle_status(mock_db, category_id, admin_id)

        assert mock_category.is_active is False

    def test_inactive_category_becomes_active(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """is_active=False → toggle → is_active=True."""
        mock_category.is_active = False
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        CategoryService.toggle_status(mock_db, category_id, admin_id)

        assert mock_category.is_active is True

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Category không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.toggle_status(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_response_message_reflects_new_status(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """Message phải phản ánh status mới."""
        mock_category.is_active = True  # sẽ toggle → inactive
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        result = CategoryService.toggle_status(mock_db, category_id, admin_id)

        assert "inactive" in result["message"]

    def test_sets_updated_by_id(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """updated_by_id phải là admin_id."""
        mock_category.is_active = True
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        CategoryService.toggle_status(mock_db, category_id, admin_id)

        assert mock_category.updated_by_id == admin_id


# MOVE CATEGORY

class TestMoveCategory:

    def test_move_to_new_parent_successfully(
        self, mock_db, mock_category, admin_id, category_id, parent_category_id
    ):
        """Category và parent tồn tại → move thành công."""
        mock_parent = MagicMock()
        mock_parent.id = parent_category_id
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_category if call_count == 1 else mock_parent
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.move_category(
            mock_db, category_id, parent_category_id, admin_id
        )

        assert result["success"] is True
        assert mock_category.parent_id == parent_category_id

    def test_move_to_root_sets_parent_id_none(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """new_parent_id=None → category trở thành root."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        result = CategoryService.move_category(
            mock_db, category_id, None, admin_id
        )

        assert result["success"] is True
        assert mock_category.parent_id is None

    def test_not_found_raises_404(self, mock_db, admin_id, parent_category_id):
        """Category không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.move_category(
                mock_db, "ghost-id", parent_category_id, admin_id
            )

        assert exc_info.value.status_code == 404

    def test_new_parent_not_found_raises_404(
        self, mock_db, mock_category, admin_id, category_id, parent_category_id
    ):
        """new_parent_id không tồn tại → raise 404."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_category if call_count == 1 else None
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.move_category(
                mock_db, category_id, parent_category_id, admin_id
            )

        assert exc_info.value.status_code == 404
        assert "Parent category" in exc_info.value.detail["message"]

    def test_move_to_self_raises_400(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """new_parent_id == category_id → raise 400."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        with pytest.raises(HTTPException) as exc_info:
            CategoryService.move_category(
                mock_db, category_id, category_id, admin_id
            )

        assert exc_info.value.status_code == 400
        assert "own parent" in exc_info.value.detail["message"]

    def test_sets_updated_by_id(
        self, mock_db, mock_category, admin_id, category_id
    ):
        """updated_by_id phải là admin_id sau khi move."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_category
        )

        CategoryService.move_category(mock_db, category_id, None, admin_id)

        assert mock_category.updated_by_id == admin_id


# GET CATEGORY STATS

class TestGetCategoryStats:

    def test_returns_correct_structure(self, mock_db):
        """Response phải có đủ các key thống kê."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 3:
                q.scalar.return_value = 10
            else:
                q.all.return_value = [("Skincare", 20)]
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.get_category_stats(mock_db)

        assert result["success"] is True
        for key in ("total_categories", "active_categories",
                    "parent_categories", "child_categories", "top_categories"):
            assert key in result["data"]

    def test_child_count_equals_total_minus_parent(self, mock_db):
        """child_categories = total - parent_categories."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.scalar.return_value = 10  # total
            elif call_count == 2:
                q.scalar.return_value = 7   # active
            elif call_count == 3:
                q.scalar.return_value = 4   # parent_count
            else:
                q.all.return_value = []
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.get_category_stats(mock_db)

        assert result["data"]["total_categories"] == 10
        assert result["data"]["parent_categories"] == 4
        assert result["data"]["child_categories"] == 6  # 10 - 4

    def test_top_categories_have_correct_format(self, mock_db):
        """top_categories phải là list dict với name và product_count."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 3:
                q.scalar.return_value = 5
            else:
                q.all.return_value = [("Skincare", 30)]
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.get_category_stats(mock_db)

        top = result["data"]["top_categories"]
        assert len(top) == 1
        assert top[0]["name"] == "Skincare"
        assert top[0]["product_count"] == 30

    def test_inactive_equals_total_minus_active(self, mock_db):
        """active_categories được query riêng (không tính ngược)."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.scalar.return_value = 10
            elif call_count == 2:
                q.scalar.return_value = 7
            elif call_count == 3:
                q.scalar.return_value = 3
            else:
                q.all.return_value = []
            return q

        mock_db.query.side_effect = side_effect

        result = CategoryService.get_category_stats(mock_db)

        assert result["data"]["active_categories"] == 7
