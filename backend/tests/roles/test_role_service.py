import pytest
from unittest.mock import MagicMock, patch, call
from fastapi import HTTPException
from app.services.role import RoleService
from app.schemas.roles import (
    RoleCreateRequest,
    RoleUpdateRequest,
    AssignPermissionsRequest,
    RemovePermissionsRequest,
)


# HELPER

def build_query_chain(first=None, all_result=None, count_val=0):
    q = MagicMock()
    for attr in ("filter", "options", "order_by", "offset",
                 "limit", "join", "group_by", "ilike"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.count.return_value = count_val
    return q


# GET ALL ROLES

class TestGetAllRoles:

    def test_no_filter_returns_paginated_list(self, mock_db, mock_role):
        """Happy path: không filter, trả về paginated list."""
        q = build_query_chain(all_result=[mock_role], count_val=1)
        mock_db.query.return_value = q

        result = RoleService.get_all_roles(mock_db, page=1, limit=10)

        assert result["success"] is True
        assert result["meta"]["total"] == 1
        assert result["meta"]["page"] == 1
        assert result["meta"]["limit"] == 10

    def test_with_search_filters_by_name(self, mock_db, mock_role):
        """search param → filter ilike được gọi."""
        q = build_query_chain(all_result=[mock_role], count_val=1)
        mock_db.query.return_value = q

        result = RoleService.get_all_roles(mock_db, search="admin")

        assert result["success"] is True
        assert q.filter.called

    def test_with_is_active_filter(self, mock_db, mock_role):
        """is_active param → filter thêm được gọi."""
        q = build_query_chain(all_result=[mock_role], count_val=1)
        mock_db.query.return_value = q

        result = RoleService.get_all_roles(mock_db, is_active=True)

        assert result["success"] is True
        assert q.filter.called

    def test_include_permissions_true_uses_joinedload(self, mock_db, mock_role):
        """include_permissions=True → options(joinedload) được gọi."""
        q = build_query_chain(all_result=[mock_role], count_val=1)
        mock_db.query.return_value = q

        with patch("app.services.role.joinedload") as mock_joinedload:
            RoleService.get_all_roles(mock_db, include_permissions=True)
            mock_joinedload.assert_called_once()

        q.options.assert_called()

    def test_include_permissions_false_uses_noload(self, mock_db, mock_role):
        """include_permissions=False → options(noload) được gọi."""
        q = build_query_chain(all_result=[mock_role], count_val=1)
        mock_db.query.return_value = q

        with patch("app.services.role.noload") as mock_noload:
            RoleService.get_all_roles(mock_db, include_permissions=False)
            mock_noload.assert_called_once()

        q.options.assert_called()

    def test_pagination_calculates_correctly(self, mock_db, mock_role):
        """25 roles, page=3, limit=10 → offset=20, total_pages=3."""
        q = build_query_chain(all_result=[mock_role], count_val=25)
        mock_db.query.return_value = q

        result = RoleService.get_all_roles(mock_db, page=3, limit=10)

        assert result["meta"]["total"] == 25
        assert result["meta"]["page"] == 3
        assert result["meta"]["total_pages"] == 3


# GET ROLE BY ID

class TestGetRoleById:

    def test_existing_id_returns_role_with_permissions(
        self, mock_db, mock_role, role_id
    ):
        """Role tồn tại → trả về data kèm permissions."""
        q = build_query_chain(first=mock_role)
        mock_db.query.return_value = q

        result = RoleService.get_role_by_id(mock_db, role_id)

        assert result["success"] is True
        assert result["data"] == mock_role

    def test_not_found_raises_404(self, mock_db):
        """Role không tồn tại → raise 404."""
        q = build_query_chain(first=None)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            RoleService.get_role_by_id(mock_db, "ghost-id")

        assert exc_info.value.status_code == 404


# CREATE ROLE

class TestCreateRole:

    def _make_request(self, permission_ids=None):
        return RoleCreateRequest(
            name="MANAGER",
            description="Store manager",
            is_active=True,
            permission_ids=permission_ids or [],
        )

    def _setup_query(self, mock_db, name_exists=False,
                     mock_role=None, mock_perms=None, reload_role=None):
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                # check name exists
                q.first.return_value = mock_role if name_exists else None
            elif call_count == 2:
                # query permissions
                q.all.return_value = mock_perms or []
            else:
                # reload after create
                q.first.return_value = reload_role or mock_role
            return q

        mock_db.query.side_effect = side_effect

    def test_valid_data_without_permissions_creates_role(
        self, mock_db, mock_role, admin_id
    ):
        """permission_ids=[] → role tạo thành công không có permission."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = None      # name chưa tồn tại
            else:
                q.first.return_value = mock_role  # reload
            return q

        mock_db.query.side_effect = side_effect

        result = RoleService.create_role(
            mock_db, self._make_request(permission_ids=[]), admin_id
        )

        assert result["success"] is True
        assert result["message"] == "Role created successfully"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_valid_data_with_permissions_assigns_them(
        self, mock_db, mock_role, mock_permission, admin_id, permission_id
    ):
        """permission_ids hợp lệ → permissions được assign."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = None           # name chưa tồn tại
            elif call_count == 2:
                q.all.return_value = [mock_permission]  # permissions tồn tại
            else:
                q.first.return_value = mock_role       # reload
            return q

        mock_db.query.side_effect = side_effect

        result = RoleService.create_role(
            mock_db, self._make_request(
                permission_ids=[permission_id]), admin_id
        )

        assert result["success"] is True
        mock_db.commit.assert_called_once()

    def test_duplicate_name_raises_409(self, mock_db, mock_role, admin_id):
        """Tên role đã tồn tại → raise 409."""
        q = build_query_chain(first=mock_role)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            RoleService.create_role(
                mock_db, self._make_request(), admin_id
            )

        assert exc_info.value.status_code == 409
        assert "name" in exc_info.value.detail["message"]

    def test_invalid_permission_ids_raises_400(
        self, mock_db, admin_id, permission_id
    ):
        """Một số permission_ids không tồn tại → raise 400."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = None  # name ok
            else:
                q.all.return_value = []      # không tìm thấy permissions
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            RoleService.create_role(
                mock_db,
                self._make_request(permission_ids=[permission_id, "fake-id"]),
                admin_id,
            )

        assert exc_info.value.status_code == 400
        assert "invalid" in exc_info.value.detail["message"]

    def test_created_role_has_correct_created_by_id(
        self, mock_db, mock_role, admin_id
    ):
        """created_by_id phải là admin_id."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = None
            else:
                q.first.return_value = mock_role
            return q

        mock_db.query.side_effect = side_effect

        RoleService.create_role(
            mock_db, self._make_request(), admin_id
        )

        added_role = mock_db.add.call_args[0][0]
        assert added_role.created_by_id == admin_id


# UPDATE ROLE

class TestUpdateRole:

    def test_valid_data_updates_successfully(
        self, mock_db, mock_custom_role, admin_id
    ):
        """Happy path: cập nhật role thành công."""
        role_id = mock_custom_role.id

        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_custom_role
            return q

        mock_db.query.side_effect = side_effect

        data = RoleUpdateRequest(description="Updated description")
        result = RoleService.update_role(mock_db, role_id, data, admin_id)

        assert result["success"] is True
        assert result["message"] == "Role updated successfully"
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Role không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            RoleService.update_role(
                mock_db, "ghost-id", RoleUpdateRequest(name="X"), admin_id
            )

        assert exc_info.value.status_code == 404

    def test_rename_system_role_raises_400(
        self, mock_db, mock_role, admin_id, role_id
    ):
        """Đổi tên system role (ADMIN) → raise 400."""
        mock_role.name = "ADMIN"
        mock_db.query.return_value = build_query_chain(first=mock_role)

        with pytest.raises(HTTPException) as exc_info:
            RoleService.update_role(
                mock_db, role_id,
                RoleUpdateRequest(name="SUPER_ADMIN"), admin_id
            )

        assert exc_info.value.status_code == 400
        assert "ADMIN" in exc_info.value.detail["message"]

    def test_duplicate_name_raises_409(
        self, mock_db, mock_custom_role, admin_id
    ):
        """Tên mới đã thuộc role khác → raise 409."""
        other_role = MagicMock()
        other_role.id = "other-id"
        other_role.name = "EXISTING"
        role_id = mock_custom_role.id
        mock_custom_role.name = "MANAGER"
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_custom_role
            else:
                q.first.return_value = other_role
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            RoleService.update_role(
                mock_db, role_id,
                RoleUpdateRequest(name="EXISTING"), admin_id
            )

        assert exc_info.value.status_code == 409

    def test_update_permissions_replaces_all(
        self, mock_db, mock_custom_role, mock_permission, admin_id, permission_id
    ):
        """Truyền permission_ids → role.permissions bị thay thế hoàn toàn."""
        role_id = mock_custom_role.id
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_custom_role
            elif call_count == 2:
                q.all.return_value = [mock_permission]
            else:
                q.first.return_value = mock_custom_role
            return q

        mock_db.query.side_effect = side_effect

        RoleService.update_role(
            mock_db, role_id,
            RoleUpdateRequest(permission_ids=[permission_id]), admin_id
        )

        assert mock_custom_role.permissions == [mock_permission]

    def test_invalid_permission_ids_raises_400(
        self, mock_db, mock_custom_role, admin_id, permission_id
    ):
        """permission_ids không hợp lệ → raise 400."""
        role_id = mock_custom_role.id
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_custom_role
            else:
                q.all.return_value = []  # permissions không tìm thấy
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            RoleService.update_role(
                mock_db, role_id,
                RoleUpdateRequest(permission_ids=["fake-id"]), admin_id
            )

        assert exc_info.value.status_code == 400

    def test_sets_updated_by_id(
        self, mock_db, mock_custom_role, admin_id
    ):
        """updated_by_id phải là admin_id."""
        role_id = mock_custom_role.id

        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            q.first.return_value = mock_custom_role
            return q

        mock_db.query.side_effect = side_effect

        RoleService.update_role(
            mock_db, role_id,
            RoleUpdateRequest(description="X"), admin_id
        )

        assert mock_custom_role.updated_by_id == admin_id


# DELETE ROLE

class TestDeleteRole:

    def test_soft_delete_non_system_role_without_users(
        self, mock_db, mock_custom_role, admin_id
    ):
        """Non-system role, không có users → soft delete thành công."""
        role_id = mock_custom_role.id
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_custom_role  # tìm role
            else:
                q.count.return_value = 0                 # user_count = 0
            return q

        mock_db.query.side_effect = side_effect

        result = RoleService.delete_role(mock_db, role_id, admin_id)

        assert result["success"] is True
        assert mock_custom_role.deleted_at is not None
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Role không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            RoleService.delete_role(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404

    def test_delete_system_role_raises_400(
        self, mock_db, mock_role, admin_id, role_id
    ):
        """System role (ADMIN) → raise 400."""
        mock_role.name = "ADMIN"
        mock_db.query.return_value = build_query_chain(first=mock_role)

        with pytest.raises(HTTPException) as exc_info:
            RoleService.delete_role(mock_db, role_id, admin_id)

        assert exc_info.value.status_code == 400
        assert "ADMIN" in exc_info.value.detail["message"]

    def test_role_with_users_raises_400(
        self, mock_db, mock_custom_role, admin_id
    ):
        """Role có users đang dùng → raise 400."""
        role_id = mock_custom_role.id
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_custom_role
            else:
                q.count.return_value = 3  # 3 users đang dùng role này
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            RoleService.delete_role(mock_db, role_id, admin_id)

        assert exc_info.value.status_code == 400
        assert "3" in exc_info.value.detail["message"]

    def test_sets_deleted_by_id(
        self, mock_db, mock_custom_role, admin_id
    ):
        """deleted_by_id phải là admin_id."""
        role_id = mock_custom_role.id
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_custom_role
            else:
                q.count.return_value = 0
            return q

        mock_db.query.side_effect = side_effect

        RoleService.delete_role(mock_db, role_id, admin_id)

        assert mock_custom_role.deleted_by_id == admin_id


# ASSIGN PERMISSIONS

class TestAssignPermissions:

    def test_assign_new_permissions_successfully(
        self, mock_db, mock_role, mock_permission, admin_id, role_id, permission_id
    ):
        """Role tồn tại, permissions hợp lệ → append thành công."""
        mock_role.permissions = []  # chưa có permission nào
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_role
            elif call_count == 2:
                q.all.return_value = [mock_permission]
            else:
                q.first.return_value = mock_role
            return q

        mock_db.query.side_effect = side_effect

        data = AssignPermissionsRequest(permission_ids=[permission_id])
        result = RoleService.assign_permissions(
            mock_db, role_id, data, admin_id)

        assert result["success"] is True
        assert mock_permission in mock_role.permissions

    def test_does_not_add_duplicate_permissions(
        self, mock_db, mock_role, mock_permission, admin_id, role_id, permission_id
    ):
        """Permission đã có trong role → không thêm lần 2."""
        mock_role.permissions = [mock_permission]  # đã có sẵn
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_role
            elif call_count == 2:
                q.all.return_value = [mock_permission]
            else:
                q.first.return_value = mock_role
            return q

        mock_db.query.side_effect = side_effect

        data = AssignPermissionsRequest(permission_ids=[permission_id])
        RoleService.assign_permissions(mock_db, role_id, data, admin_id)

        # Vẫn chỉ có 1 permission, không bị thêm lần 2
        assert mock_role.permissions.count(mock_permission) == 1

    def test_not_found_raises_404(self, mock_db, admin_id, permission_id):
        """Role không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            RoleService.assign_permissions(
                mock_db, "ghost-id",
                AssignPermissionsRequest(permission_ids=[permission_id]),
                admin_id
            )

        assert exc_info.value.status_code == 404

    def test_invalid_permission_ids_raises_400(
        self, mock_db, mock_role, admin_id, role_id
    ):
        """permission_ids không tồn tại → raise 400."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_role
            else:
                q.all.return_value = []  # permissions không tìm thấy
            return q

        mock_db.query.side_effect = side_effect

        with pytest.raises(HTTPException) as exc_info:
            RoleService.assign_permissions(
                mock_db, role_id,
                AssignPermissionsRequest(permission_ids=["fake-id"]),
                admin_id
            )

        assert exc_info.value.status_code == 400


# REMOVE PERMISSIONS

class TestRemovePermissions:

    def test_remove_permissions_successfully(
        self, mock_db, mock_role, mock_permission, admin_id, role_id, permission_id
    ):
        """Role có permissions → remove một số → không còn trong list."""
        mock_role.permissions = [mock_permission]
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_role
            else:
                q.first.return_value = mock_role
            return q

        mock_db.query.side_effect = side_effect

        data = RemovePermissionsRequest(permission_ids=[permission_id])
        result = RoleService.remove_permissions(
            mock_db, role_id, data, admin_id)

        assert result["success"] is True
        assert mock_permission not in mock_role.permissions

    def test_remove_nonexistent_permission_does_not_raise(
        self, mock_db, mock_role, admin_id, role_id
    ):
        """Remove permission không có trong role → không raise, silent skip."""
        mock_role.permissions = []
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = mock_role
            else:
                q.first.return_value = mock_role
            return q

        mock_db.query.side_effect = side_effect

        data = RemovePermissionsRequest(permission_ids=["non-existent-perm"])

        # Không raise exception
        result = RoleService.remove_permissions(
            mock_db, role_id, data, admin_id)
        assert result["success"] is True

    def test_not_found_raises_404(self, mock_db, admin_id, permission_id):
        """Role không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            RoleService.remove_permissions(
                mock_db, "ghost-id",
                RemovePermissionsRequest(permission_ids=[permission_id]),
                admin_id
            )

        assert exc_info.value.status_code == 404


# GET ROLE STATS

class TestGetRoleStats:

    def test_returns_correct_structure(self, mock_db):
        """Response phải có đủ keys thống kê."""
        call_count = 0

        def side_effect(*args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 2:
                q.count.return_value = 10
            else:
                q.all.return_value = [("ADMIN", 5), ("USER", 20)]
            return q

        mock_db.query.side_effect = side_effect

        result = RoleService.get_role_stats(mock_db)

        assert result["success"] is True
        for key in ("total_roles", "active_roles", "inactive_roles", "users_per_role"):
            assert key in result["data"]

    def test_inactive_equals_total_minus_active(self, mock_db):
        """inactive_roles = total_roles - active_roles."""
        call_count = 0

        def side_effect(*args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.count.return_value = 10   # total
            elif call_count == 2:
                q.count.return_value = 7    # active
            else:
                q.all.return_value = []
            return q

        mock_db.query.side_effect = side_effect

        result = RoleService.get_role_stats(mock_db)

        assert result["data"]["total_roles"] == 10
        assert result["data"]["active_roles"] == 7
        assert result["data"]["inactive_roles"] == 3

    def test_users_per_role_is_dict(self, mock_db):
        """users_per_role phải là dict {role_name: count}."""
        call_count = 0

        def side_effect(*args):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count <= 2:
                q.count.return_value = 5
            else:
                q.all.return_value = [("ADMIN", 3), ("CUSTOMER", 50)]
            return q

        mock_db.query.side_effect = side_effect

        result = RoleService.get_role_stats(mock_db)

        users_per_role = result["data"]["users_per_role"]
        assert isinstance(users_per_role, dict)
        assert users_per_role.get("ADMIN") == 3
        assert users_per_role.get("CUSTOMER") == 50
