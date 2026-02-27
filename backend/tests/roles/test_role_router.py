import pytest
import uuid
from unittest.mock import patch
from fastapi import HTTPException


# HELPERS

def make_id() -> str:
    return str(uuid.uuid4())


def make_permission_data(pid: str = None) -> dict:
    return {
        "id": pid or make_id(),
        "name": "Get Users",
        "description": "Permission to list users",
        "path": "/api/v1/users",
        "method": "GET",
        "module": "Users",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }


def make_role_data(rid: str = None) -> dict:
    return {
        "id": rid or make_id(),
        "name": "MANAGER",
        "description": "Store manager",
        "is_active": True,
        "permissions": [],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
        "created_by_id": None,
        "updated_by_id": None,
    }


def role_response(rid: str = None, message: str = "Role retrieved successfully") -> dict:
    return {"success": True, "message": message, "data": make_role_data(rid)}


def permission_response(pid: str = None, message: str = "Permission retrieved successfully") -> dict:
    return {"success": True, "message": message, "data": make_permission_data(pid)}


def list_response(resource: str = "Role", count: int = 2) -> dict:
    items = [make_role_data() for _ in range(count)] if resource == "Role" \
        else [make_permission_data() for _ in range(count)]
    return {
        "success": True,
        "message": f"{resource}s list retrieved successfully",
        "data": items,
        "meta": {"total": count, "page": 1, "limit": 20, "total_pages": 1}
    }


def not_found_exc(resource: str = "Role", rid: str = "x") -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"success": False,
                "message": f"{resource} with id '{rid}' not found"}
    )


# GET /roles

class TestGetAllRolesEndpoint:

    def test_returns_200_with_list(self, client):
        with patch("app.routes.role.RoleService.get_all_roles",
                   return_value=list_response()):
            res = client.get("/roles")

        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "data" in body
        assert "meta" in body

    def test_forwards_pagination_params(self, client):
        with patch("app.routes.role.RoleService.get_all_roles",
                   return_value=list_response()) as svc:
            client.get("/roles?page=2&limit=5")
            kw = svc.call_args.kwargs
            assert kw["page"] == 2
            assert kw["limit"] == 5

    def test_forwards_search_param(self, client):
        with patch("app.routes.role.RoleService.get_all_roles",
                   return_value=list_response()) as svc:
            client.get("/roles?search=admin")
            assert svc.call_args.kwargs["search"] == "admin"

    def test_forwards_include_permissions_param(self, client):
        with patch("app.routes.role.RoleService.get_all_roles",
                   return_value=list_response()) as svc:
            client.get("/roles?include_permissions=true")
            assert svc.call_args.kwargs["include_permissions"] is True

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/roles")
        assert res.status_code == 401


# GET /roles/stats

class TestGetRoleStatsEndpoint:

    def test_returns_200_with_stats(self, client):
        mock_stats = {
            "success": True,
            "message": "Role statistics retrieved successfully",
            "data": {
                "total_roles": 5, "active_roles": 4,
                "inactive_roles": 1,
                "users_per_role": {"ADMIN": 3, "CUSTOMER": 50}
            }
        }
        with patch("app.routes.role.RoleService.get_role_stats",
                   return_value=mock_stats):
            res = client.get("/roles/stats")

        assert res.status_code == 200
        assert res.json()["data"]["total_roles"] == 5

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/roles/stats")
        assert res.status_code == 401


# GET /roles/{role_id}

class TestGetRoleByIdEndpoint:

    def test_existing_role_returns_200(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.get_role_by_id",
                   return_value=role_response(rid)) as svc:
            res = client.get(f"/roles/{rid}")
            assert svc.call_args[0][1] == rid

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.get_role_by_id",
                   side_effect=not_found_exc("Role", rid)):
            res = client.get(f"/roles/{rid}")

        assert res.status_code == 404


# POST /roles

class TestCreateRoleEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "name": "MANAGER",
            "description": "Store manager",
            "is_active": True,
            "permission_ids": [],
        }
        return {**base, **overrides}

    def test_valid_payload_returns_201(self, client, mock_current_user):
        rid = make_id()
        with patch("app.routes.role.RoleService.create_role",
                   return_value=role_response(rid, "Role created successfully")) as svc:
            res = client.post("/roles", json=self._payload())
            assert svc.call_args[0][2] == mock_current_user.id

        assert res.status_code == 201

    def test_missing_name_returns_422(self, client):
        payload = self._payload()
        del payload["name"]
        res = client.post("/roles", json=payload)
        assert res.status_code == 422

    def test_duplicate_name_returns_409(self, client):
        with patch("app.routes.role.RoleService.create_role",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "Role with this name already exists"}
                   )):
            res = client.post("/roles", json=self._payload())

        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post("/roles", json=self._payload())
        assert res.status_code == 401


# PUT /roles/{role_id}

class TestUpdateRoleEndpoint:

    def test_valid_payload_returns_200(self, client, mock_current_user):
        rid = make_id()
        with patch("app.routes.role.RoleService.update_role",
                   return_value=role_response(rid, "Role updated successfully")) as svc:
            res = client.put(f"/roles/{rid}", json={"description": "Updated"})
            args = svc.call_args[0]
            assert args[1] == rid
            assert args[3] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.update_role",
                   side_effect=not_found_exc("Role", rid)):
            res = client.put(f"/roles/{rid}", json={"description": "X"})

        assert res.status_code == 404

    def test_system_role_rename_returns_400(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.update_role",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "Cannot rename system role 'ADMIN'"}
                   )):
            res = client.put(f"/roles/{rid}", json={"name": "SUPER_ADMIN"})

        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put(
            f"/roles/{make_id()}", json={"description": "X"})
        assert res.status_code == 401


# DELETE /roles/{role_id}

class TestDeleteRoleEndpoint:

    def test_delete_returns_200(self, client, mock_current_user):
        rid = make_id()
        mock_res = {"success": True, "message": "Role deleted successfully"}

        with patch("app.routes.role.RoleService.delete_role",
                   return_value=mock_res) as svc:
            res = client.delete(f"/roles/{rid}")
            args = svc.call_args[0]
            assert args[1] == rid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.delete_role",
                   side_effect=not_found_exc("Role", rid)):
            res = client.delete(f"/roles/{rid}")

        assert res.status_code == 404

    def test_system_role_returns_400(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.delete_role",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "Cannot delete system role 'ADMIN'"}
                   )):
            res = client.delete(f"/roles/{rid}")

        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(f"/roles/{make_id()}")
        assert res.status_code == 401


# POST /roles/{role_id}/permissions/assign

class TestAssignPermissionsEndpoint:

    def test_assign_returns_200(self, client):
        rid = make_id()
        pid = make_id()
        with patch("app.routes.role.RoleService.assign_permissions",
                   return_value=role_response(rid, "Permissions assigned to role 'MANAGER' successfully")) as svc:
            res = client.post(
                f"/roles/{rid}/permissions/assign",
                json={"permission_ids": [pid]}
            )
            assert svc.call_args[0][1] == rid

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.assign_permissions",
                   side_effect=not_found_exc("Role", rid)):
            res = client.post(
                f"/roles/{rid}/permissions/assign",
                json={"permission_ids": [make_id()]}
            )

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            f"/roles/{make_id()}/permissions/assign",
            json={"permission_ids": [make_id()]}
        )
        assert res.status_code == 401


# POST /roles/{role_id}/permissions/remove

class TestRemovePermissionsEndpoint:

    def test_remove_returns_200(self, client):
        rid = make_id()
        pid = make_id()
        with patch("app.routes.role.RoleService.remove_permissions",
                   return_value=role_response(rid, "Permissions removed from role 'MANAGER' successfully")) as svc:
            res = client.post(
                f"/roles/{rid}/permissions/remove",
                json={"permission_ids": [pid]}
            )
            assert svc.call_args[0][1] == rid

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        rid = make_id()
        with patch("app.routes.role.RoleService.remove_permissions",
                   side_effect=not_found_exc("Role", rid)):
            res = client.post(
                f"/roles/{rid}/permissions/remove",
                json={"permission_ids": [make_id()]}
            )

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post(
            f"/roles/{make_id()}/permissions/remove",
            json={"permission_ids": [make_id()]}
        )
        assert res.status_code == 401


# GET /roles/permissions/all

class TestGetAllPermissionsEndpoint:

    def test_returns_200_with_list(self, client):
        with patch("app.routes.role.PermissionService.get_all_permissions",
                   return_value=list_response("Permission")):
            res = client.get("/roles/permissions/all")

        assert res.status_code == 200
        assert res.json()["success"] is True

    def test_forwards_filters(self, client):
        with patch("app.routes.role.PermissionService.get_all_permissions",
                   return_value=list_response("Permission")) as svc:
            client.get("/roles/permissions/all?module=Users&method=GET")
            kw = svc.call_args.kwargs
            assert kw["module"] == "Users"
            assert kw["method"] == "GET"

    def test_invalid_method_returns_400(self, client):
        with patch("app.routes.role.PermissionService.get_all_permissions",
                   side_effect=HTTPException(
                       status_code=400,
                       detail={"success": False,
                               "message": "Invalid HTTP method: INVALID"}
                   )):
            res = client.get("/roles/permissions/all?method=INVALID")

        assert res.status_code == 400

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/roles/permissions/all")
        assert res.status_code == 401


# GET /roles/permissions/grouped

class TestGetPermissionsByModuleEndpoint:

    def test_returns_200_grouped_by_module(self, client):
        mock_res = {
            "success": True,
            "message": "Permissions grouped by module retrieved successfully",
            "data": {"Users": [], "Products": []}
        }
        with patch("app.routes.role.PermissionService.get_permissions_by_module",
                   return_value=mock_res):
            res = client.get("/roles/permissions/grouped")

        assert res.status_code == 200
        assert res.json()["success"] is True

    def test_without_auth_returns_401(self, public_client):
        res = public_client.get("/roles/permissions/grouped")
        assert res.status_code == 401


# GET /roles/permissions/{permission_id}

class TestGetPermissionByIdEndpoint:

    def test_existing_permission_returns_200(self, client):
        pid = make_id()
        with patch("app.routes.role.PermissionService.get_permission_by_id",
                   return_value=permission_response(pid)) as svc:
            res = client.get(f"/roles/permissions/{pid}")
            assert svc.call_args[0][1] == pid

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        pid = make_id()
        with patch("app.routes.role.PermissionService.get_permission_by_id",
                   side_effect=not_found_exc("Permission", pid)):
            res = client.get(f"/roles/permissions/{pid}")

        assert res.status_code == 404


# POST /roles/permissions

class TestCreatePermissionEndpoint:

    def _payload(self, **overrides) -> dict:
        base = {
            "name": "Create Product",
            "description": "Permission to create products",
            "path": "/api/v1/products",
            "method": "POST",
            "module": "Products",
        }
        return {**base, **overrides}

    def test_valid_payload_returns_201(self, client, mock_current_user):
        pid = make_id()
        with patch("app.routes.role.PermissionService.create_permission",
                   return_value=permission_response(pid, "Permission created successfully")) as svc:
            res = client.post("/roles/permissions", json=self._payload())
            assert svc.call_args[0][2] == mock_current_user.id

        assert res.status_code == 201

    def test_missing_required_fields_returns_422(self, client):
        """Thiếu name → 422."""
        payload = self._payload()
        del payload["name"]
        res = client.post("/roles/permissions", json=payload)
        assert res.status_code == 422

    def test_duplicate_path_method_returns_409(self, client):
        with patch("app.routes.role.PermissionService.create_permission",
                   side_effect=HTTPException(
                       status_code=409,
                       detail={"success": False,
                               "message": "Permission with this POST /api/v1/products already exists"}
                   )):
            res = client.post("/roles/permissions", json=self._payload())

        assert res.status_code == 409

    def test_without_auth_returns_401(self, public_client):
        res = public_client.post("/roles/permissions", json=self._payload())
        assert res.status_code == 401


# PUT /roles/permissions/{permission_id}

class TestUpdatePermissionEndpoint:

    def test_valid_payload_returns_200(self, client, mock_current_user):
        pid = make_id()
        with patch("app.routes.role.PermissionService.update_permission",
                   return_value=permission_response(pid, "Permission updated successfully")) as svc:
            res = client.put(f"/roles/permissions/{pid}",
                             json={"name": "Updated Name"})
            args = svc.call_args[0]
            assert args[1] == pid
            assert args[3] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        pid = make_id()
        with patch("app.routes.role.PermissionService.update_permission",
                   side_effect=not_found_exc("Permission", pid)):
            res = client.put(f"/roles/permissions/{pid}",
                             json={"name": "X"})

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.put(f"/roles/permissions/{make_id()}",
                                json={"name": "X"})
        assert res.status_code == 401


# DELETE /roles/permissions/{permission_id}

class TestDeletePermissionEndpoint:

    def test_delete_returns_200(self, client, mock_current_user):
        pid = make_id()
        mock_res = {"success": True,
                    "message": "Permission deleted successfully"}

        with patch("app.routes.role.PermissionService.delete_permission",
                   return_value=mock_res) as svc:
            res = client.delete(f"/roles/permissions/{pid}")
            args = svc.call_args[0]
            assert args[1] == pid
            assert args[2] == mock_current_user.id

        assert res.status_code == 200

    def test_not_found_returns_404(self, client):
        pid = make_id()
        with patch("app.routes.role.PermissionService.delete_permission",
                   side_effect=not_found_exc("Permission", pid)):
            res = client.delete(f"/roles/permissions/{pid}")

        assert res.status_code == 404

    def test_without_auth_returns_401(self, public_client):
        res = public_client.delete(f"/roles/permissions/{make_id()}")
        assert res.status_code == 401
