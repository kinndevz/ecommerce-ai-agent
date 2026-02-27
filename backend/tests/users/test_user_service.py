import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.users import UserService
from app.schemas.users import UserCreateRequest, UserUpdateRequest
from app.core.enums import UserStatus


# HELPER

def build_query_chain(first=None, all_result=None, count_val=0, scalar_val=0):
    q = MagicMock()
    for attr in ("options", "filter", "join", "order_by",
                 "offset", "limit", "group_by", "ilike"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.count.return_value = count_val
    q.scalar.return_value = scalar_val
    return q


# GET ALL USERS

class TestGetAllUsers:

    def test_no_filter_returns_paginated_list(self, mock_db, mock_user):
        """Happy path: không có filter, trả về danh sách có phân trang."""
        q = build_query_chain(all_result=[mock_user], count_val=1)
        mock_db.query.return_value = q

        result = UserService.get_all_users(mock_db, page=1, limit=10)

        assert result["success"] is True
        assert result["message"] == "Users list retrieved successfully"
        assert result["meta"]["total"] == 1
        assert result["meta"]["page"] == 1
        assert result["meta"]["limit"] == 10
        assert result["meta"]["total_pages"] == 1

    def test_with_search_applies_filter(self, mock_db, mock_user):
        """Khi có search param, query phải được filter theo tên/email."""
        q = build_query_chain(all_result=[mock_user], count_val=1)
        mock_db.query.return_value = q

        result = UserService.get_all_users(mock_db, search="test")

        assert result["success"] is True
        assert q.filter.called

    def test_empty_db_returns_empty_list(self, mock_db):
        """DB rỗng → data = [], total = 0."""
        q = build_query_chain(all_result=[], count_val=0)
        mock_db.query.return_value = q

        result = UserService.get_all_users(mock_db)

        assert result["data"] == []
        assert result["meta"]["total"] == 0
        assert result["meta"]["total_pages"] == 0

    def test_pagination_calculates_total_pages_correctly(self, mock_db, mock_user):
        """25 users, limit=10 → total_pages = 3."""
        q = build_query_chain(all_result=[mock_user] * 10, count_val=25)
        mock_db.query.return_value = q

        result = UserService.get_all_users(mock_db, page=1, limit=10)

        assert result["meta"]["total_pages"] == 3

    def test_with_status_filter_applies_filter(self, mock_db, mock_user):
        """Filter theo status → query phải được filter thêm."""
        q = build_query_chain(all_result=[mock_user], count_val=1)
        mock_db.query.return_value = q

        result = UserService.get_all_users(mock_db, status="ACTIVE")

        assert result["success"] is True
        assert q.filter.called

    def test_with_role_filter_joins_role_table(self, mock_db, mock_user):
        """Filter theo role → phải join bảng Role."""
        q = build_query_chain(all_result=[mock_user], count_val=1)
        mock_db.query.return_value = q

        result = UserService.get_all_users(mock_db, role="ADMIN")

        assert result["success"] is True
        assert q.join.called


# GET USER

class TestGetUser:

    def test_existing_id_returns_user_data(self, mock_db, mock_user, user_id):
        """Tìm user tồn tại → trả về đúng data."""
        q = build_query_chain(first=mock_user)
        mock_db.query.return_value = q

        result = UserService.get_user(mock_db, user_id)

        assert result["success"] is True
        assert result["message"] == "User retrieved successfully"
        assert result["data"] == mock_user

    def test_not_found_raises_404(self, mock_db):
        """User không tồn tại → raise HTTPException 404."""
        q = build_query_chain(first=None)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            UserService.get_user(mock_db, "non-existent-id")

        assert exc_info.value.status_code == 404
        assert exc_info.value.detail["success"] is False


# CREATE USER

class TestCreateUser:

    def _make_request(self, role_id: str) -> UserCreateRequest:
        return UserCreateRequest(
            email="newuser@example.com",
            password="secret123",
            full_name="New User",
            phone_number="0909999999",
            role_id=role_id,
            status=UserStatus.ACTIVE,
        )

    def _setup_query(self, mock_db, email_exists, role_exists, mock_user, mock_role):
        """
        Setup db.query side_effect cho 3 lần gọi:
          1. Check email → None hoặc mock_user
          2. Check role → None hoặc mock_role
          3. Reload user sau create → mock_user
        """
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_user if email_exists else None
            elif call_count == 2:
                q.first.return_value = mock_role if role_exists else None
            else:
                q.first.return_value = mock_user
            return q

        mock_db.query.side_effect = side_effect

    def test_valid_data_returns_created_user(
        self, mock_db, mock_user, mock_role, admin_id, role_id
    ):
        """Happy path: tạo user thành công."""
        self._setup_query(mock_db, email_exists=False, role_exists=True,
                          mock_user=mock_user, mock_role=mock_role)

        result = UserService.create_user(
            mock_db, self._make_request(role_id), admin_id)

        assert result["success"] is True
        assert result["message"] == "User created successfully"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_duplicate_email_raises_409(self, mock_db, mock_user, admin_id, role_id):
        """Email đã tồn tại → raise 409 Conflict."""
        self._setup_query(mock_db, email_exists=True, role_exists=True,
                          mock_user=mock_user, mock_role=None)

        with pytest.raises(HTTPException) as exc_info:
            UserService.create_user(
                mock_db, self._make_request(role_id), admin_id)

        assert exc_info.value.status_code == 409
        assert "already exists" in exc_info.value.detail["message"]

    def test_role_not_found_raises_404(self, mock_db, mock_user, admin_id, role_id):
        """Role không tồn tại → raise 404."""
        self._setup_query(mock_db, email_exists=False, role_exists=False,
                          mock_user=mock_user, mock_role=None)

        with pytest.raises(HTTPException) as exc_info:
            UserService.create_user(
                mock_db, self._make_request(role_id), admin_id)

        assert exc_info.value.status_code == 404
        assert "Role" in exc_info.value.detail["message"]

    def test_password_is_hashed_not_plain_text(
        self, mock_db, mock_user, mock_role, admin_id, role_id
    ):
        """Password phải được hash trước khi lưu."""
        self._setup_query(mock_db, email_exists=False, role_exists=True,
                          mock_user=mock_user, mock_role=mock_role)

        with patch("app.services.users.hash_password", return_value="$hashed$") as mock_hash:
            UserService.create_user(
                mock_db, self._make_request(role_id), admin_id)

            mock_hash.assert_called_once_with("secret123")
            added_user = mock_db.add.call_args[0][0]
            assert added_user.password == "$hashed$"


# UPDATE USER

class TestUpdateUser:

    def _setup_query(self, mock_db, mock_user):
        """2 lần query: lần 1 tìm user, lần 2 reload sau update."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_user)

    def test_valid_data_updates_successfully(self, mock_db, mock_user, admin_id, user_id):
        """Happy path: cập nhật thành công."""
        self._setup_query(mock_db, mock_user)

        data = UserUpdateRequest(
            full_name="Updated Name", phone_number="0911111111")
        result = UserService.update_user(mock_db, user_id, data, admin_id)

        assert result["success"] is True
        assert result["message"] == "User updated successfully"
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            UserService.update_user(
                mock_db, "ghost-id", UserUpdateRequest(full_name="X"), admin_id)

        assert exc_info.value.status_code == 404

    def test_only_updates_provided_fields(self, mock_db, mock_user, admin_id, user_id):
        """
        model_dump(exclude_unset=True) → chỉ field được truyền mới bị setattr.
        Truyền phone_number, KHÔNG truyền full_name → full_name không được set.
        """
        self._setup_query(mock_db, mock_user)

        data = UserUpdateRequest(phone_number="0922222222")
        UserService.update_user(mock_db, user_id, data, admin_id)

        set_calls = [str(c)
                     for c in mock_user.method_calls if "full_name" in str(c)]
        assert len(set_calls) == 0

    def test_sets_updated_by_id_correctly(self, mock_db, mock_user, admin_id, user_id):
        """updated_by_id phải được gán thành admin_id."""
        self._setup_query(mock_db, mock_user)

        UserService.update_user(
            mock_db, user_id, UserUpdateRequest(full_name="X"), admin_id)

        assert mock_user.updated_by_id == admin_id


# DELETE USER

class TestDeleteUser:

    def test_soft_delete_sets_deleted_at_and_does_not_remove_record(
        self, mock_db, mock_user, admin_id, user_id
    ):
        """Soft delete → deleted_at được set, db.delete() KHÔNG được gọi."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        result = UserService.delete_user(mock_db, user_id, admin_id)

        assert result["success"] is True
        assert mock_user.deleted_at is not None
        assert mock_user.deleted_by_id == admin_id
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            UserService.delete_user(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_cannot_delete_self_raises_400(self, mock_db, mock_user):
        """Admin không được tự xóa chính mình → raise 400."""
        same_id = mock_user.id
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with pytest.raises(HTTPException) as exc_info:
            UserService.delete_user(mock_db, same_id, same_id)

        assert exc_info.value.status_code == 400
        assert "yourself" in exc_info.value.detail["message"]

    def test_sets_deleted_by_id(self, mock_db, mock_user, admin_id, user_id):
        """deleted_by_id phải là ID của người thực hiện xóa."""
        mock_db.query.return_value = build_query_chain(first=mock_user)

        UserService.delete_user(mock_db, user_id, admin_id)

        assert mock_user.deleted_by_id == admin_id


# TOGGLE STATUS

class TestToggleStatus:

    def _setup_query(self, mock_db, mock_user):
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_user)

    def test_active_becomes_inactive(self, mock_db, mock_user, admin_id, user_id):
        """ACTIVE → toggle → INACTIVE."""
        mock_user.status = UserStatus.ACTIVE
        self._setup_query(mock_db, mock_user)

        UserService.toggle_status(mock_db, user_id, admin_id)

        assert mock_user.status == UserStatus.INACTIVE

    def test_inactive_becomes_active(self, mock_db, mock_user, admin_id, user_id):
        """INACTIVE → toggle → ACTIVE."""
        mock_user.status = UserStatus.INACTIVE
        self._setup_query(mock_db, mock_user)

        UserService.toggle_status(mock_db, user_id, admin_id)

        assert mock_user.status == UserStatus.ACTIVE

    def test_cannot_toggle_self_raises_400(self, mock_db, mock_user):
        """Không thể toggle status của chính mình → raise 400."""
        same_id = mock_user.id
        mock_db.query.return_value = build_query_chain(first=mock_user)

        with pytest.raises(HTTPException) as exc_info:
            UserService.toggle_status(mock_db, same_id, same_id)

        assert exc_info.value.status_code == 400
        assert "own status" in exc_info.value.detail["message"]

    def test_not_found_raises_404(self, mock_db, admin_id):
        """User không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            UserService.toggle_status(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_sets_updated_by_id(self, mock_db, mock_user, admin_id, user_id):
        """updated_by_id phải là admin_id sau khi toggle."""
        mock_user.status = UserStatus.ACTIVE
        self._setup_query(mock_db, mock_user)

        UserService.toggle_status(mock_db, user_id, admin_id)

        assert mock_user.updated_by_id == admin_id


# GET USER STATS

class TestGetUserStats:

    def test_returns_correct_structure(self, mock_db):
        """Response phải có đầy đủ các key thống kê."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain(scalar_val=10)
            call_count += 1
            if call_count >= 4:
                q.all.return_value = [("ADMIN", 5), ("USER", 5)]
            return q

        mock_db.query.side_effect = side_effect

        result = UserService.get_user_stats(mock_db)

        assert result["success"] is True
        stats = result["data"]
        for key in ("total_users", "active_users", "inactive_users",
                    "users_with_2fa", "users_by_role"):
            assert key in stats

    def test_inactive_equals_total_minus_active(self, mock_db):
        """inactive_users = total_users - active_users."""
        call_count = 0

        def side_effect(model, *args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.scalar.return_value = 10   # total
            elif call_count == 2:
                q.scalar.return_value = 7    # active
            elif call_count == 3:
                q.scalar.return_value = 2    # with_2fa
            else:
                q.all.return_value = [("ADMIN", 7), ("USER", 3)]
            return q

        mock_db.query.side_effect = side_effect

        result = UserService.get_user_stats(mock_db)

        assert result["data"]["total_users"] == 10
        assert result["data"]["active_users"] == 7
        assert result["data"]["inactive_users"] == 3
