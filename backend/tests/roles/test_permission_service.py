import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.services.role import PermissionService
from app.schemas.roles import PermissionCreateRequest, PermissionUpdateRequest
from app.core.enums import HTTPMethod


# HELPER

def build_query_chain(first=None, all_result=None, count_val=0):
    q = MagicMock()
    for attr in ("filter", "options", "order_by", "offset",
                 "limit", "ilike", "group_by"):
        getattr(q, attr).return_value = q
    q.first.return_value = first
    q.all.return_value = all_result or []
    q.count.return_value = count_val
    return q


# GET ALL PERMISSIONS

class TestGetAllPermissions:

    def test_no_filter_returns_paginated_list(self, mock_db, mock_permission):
        """Happy path: không filter, trả về paginated list."""
        q = build_query_chain(all_result=[mock_permission], count_val=1)
        mock_db.query.return_value = q

        result = PermissionService.get_all_permissions(
            mock_db, page=1, limit=10)

        assert result["success"] is True
        assert result["meta"]["total"] == 1

    def test_with_search_filters_by_name_and_path(
        self, mock_db, mock_permission
    ):
        """search param → filter ilike trên cả name và path."""
        q = build_query_chain(all_result=[mock_permission], count_val=1)
        mock_db.query.return_value = q

        result = PermissionService.get_all_permissions(mock_db, search="user")

        assert result["success"] is True
        assert q.filter.called

    def test_with_module_filter(self, mock_db, mock_permission):
        """module param → filter theo Permission.module."""
        q = build_query_chain(all_result=[mock_permission], count_val=1)
        mock_db.query.return_value = q

        result = PermissionService.get_all_permissions(mock_db, module="Users")

        assert result["success"] is True
        assert q.filter.called

    def test_with_valid_http_method_filter(self, mock_db, mock_permission):
        """method="GET" hợp lệ → filter theo HTTPMethod.GET."""
        q = build_query_chain(all_result=[mock_permission], count_val=1)
        mock_db.query.return_value = q

        result = PermissionService.get_all_permissions(mock_db, method="GET")

        assert result["success"] is True
        assert q.filter.called

    def test_with_invalid_http_method_raises_400(self, mock_db):
        """method="INVALID" → raise 400."""
        q = build_query_chain(all_result=[], count_val=0)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            PermissionService.get_all_permissions(mock_db, method="INVALID")

        assert exc_info.value.status_code == 400


# GET PERMISSION BY ID

class TestGetPermissionById:

    def test_existing_id_returns_permission(
        self, mock_db, mock_permission, permission_id
    ):
        """Permission tồn tại → trả về data."""
        q = build_query_chain(first=mock_permission)
        mock_db.query.return_value = q

        result = PermissionService.get_permission_by_id(mock_db, permission_id)

        assert result["success"] is True
        assert result["data"] == mock_permission

    def test_not_found_raises_404(self, mock_db):
        """Permission không tồn tại → raise 404."""
        q = build_query_chain(first=None)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            PermissionService.get_permission_by_id(mock_db, "ghost-id")

        assert exc_info.value.status_code == 404


# CREATE PERMISSION

class TestCreatePermission:

    def _make_request(self, method="GET", path="/api/v1/users"):
        return PermissionCreateRequest(
            name="Get Users",
            description="Permission to list users",
            path=path,
            method=method,
            module="Users",
        )

    def test_valid_data_creates_permission(
        self, mock_db, mock_permission, admin_id
    ):
        """method hợp lệ, path+method chưa tồn tại → tạo thành công."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = None            # chưa tồn tại
            else:
                q.first.return_value = mock_permission  # reload
            return q

        mock_db.query.side_effect = side_effect

        result = PermissionService.create_permission(
            mock_db, self._make_request(), admin_id
        )

        assert result["success"] is True
        assert result["message"] == "Permission created successfully"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_invalid_http_method_raises_400(self, mock_db, admin_id):
        """method không hợp lệ → raise 400 trước khi query DB."""
        with pytest.raises(HTTPException) as exc_info:
            PermissionService.create_permission(
                mock_db, self._make_request(method="INVALID"), admin_id
            )

        assert exc_info.value.status_code == 400
        mock_db.query.assert_not_called()

    def test_duplicate_path_and_method_raises_409(
        self, mock_db, mock_permission, admin_id
    ):
        """Path+method đã tồn tại → raise 409."""
        q = build_query_chain(first=mock_permission)
        mock_db.query.return_value = q

        with pytest.raises(HTTPException) as exc_info:
            PermissionService.create_permission(
                mock_db, self._make_request(), admin_id
            )

        assert exc_info.value.status_code == 409

    def test_created_permission_has_correct_method_enum(
        self, mock_db, mock_permission, admin_id
    ):
        """method='post' (lowercase) → lưu thành HTTPMethod.POST."""
        call_count = 0

        def side_effect(model):
            nonlocal call_count
            q = build_query_chain()
            call_count += 1
            if call_count == 1:
                q.first.return_value = None
            else:
                q.first.return_value = mock_permission
            return q

        mock_db.query.side_effect = side_effect

        PermissionService.create_permission(
            mock_db,
            self._make_request(method="post"),
            admin_id
        )

        added = mock_db.add.call_args[0][0]
        assert added.method == HTTPMethod.POST


# UPDATE PERMISSION

class TestUpdatePermission:

    def test_valid_data_updates_successfully(
        self, mock_db, mock_permission, admin_id, permission_id
    ):
        """Happy path: cập nhật thành công."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_permission
        )

        data = PermissionUpdateRequest(name="Updated Name")
        result = PermissionService.update_permission(
            mock_db, permission_id, data, admin_id
        )

        assert result["success"] is True
        assert result["message"] == "Permission updated successfully"
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Permission không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            PermissionService.update_permission(
                mock_db, "ghost-id", PermissionUpdateRequest(
                    name="X"), admin_id
            )

        assert exc_info.value.status_code == 404

    def test_sets_updated_by_id(
        self, mock_db, mock_permission, admin_id, permission_id
    ):
        """updated_by_id phải là admin_id."""
        mock_db.query.side_effect = lambda m: build_query_chain(
            first=mock_permission
        )

        PermissionService.update_permission(
            mock_db, permission_id, PermissionUpdateRequest(name="X"), admin_id
        )

        assert mock_permission.updated_by_id == admin_id


# DELETE PERMISSION

class TestDeletePermission:

    def test_soft_delete_sets_deleted_at(
        self, mock_db, mock_permission, admin_id, permission_id
    ):
        """Permission tồn tại → soft delete thành công."""
        mock_db.query.return_value = build_query_chain(first=mock_permission)

        result = PermissionService.delete_permission(
            mock_db, permission_id, admin_id
        )

        assert result["success"] is True
        assert mock_permission.deleted_at is not None
        assert mock_permission.deleted_by_id == admin_id
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_called_once()

    def test_not_found_raises_404(self, mock_db, admin_id):
        """Permission không tồn tại → raise 404."""
        mock_db.query.return_value = build_query_chain(first=None)

        with pytest.raises(HTTPException) as exc_info:
            PermissionService.delete_permission(mock_db, "ghost-id", admin_id)

        assert exc_info.value.status_code == 404


# GET PERMISSIONS BY MODULE

class TestGetPermissionsByModule:

    def test_returns_permissions_grouped_by_module(
        self, mock_db, mock_permission
    ):
        """DB có permissions → trả về dict groupBy module."""
        mock_permission.module = "Users"
        q = build_query_chain(all_result=[mock_permission])
        mock_db.query.return_value = q

        result = PermissionService.get_permissions_by_module(mock_db)

        assert result["success"] is True
        assert isinstance(result["data"], dict)
        assert "Users" in result["data"]

    def test_empty_db_returns_empty_dict(self, mock_db):
        """Không có permission → data = {}."""
        q = build_query_chain(all_result=[])
        mock_db.query.return_value = q

        result = PermissionService.get_permissions_by_module(mock_db)

        assert result["data"] == {}
