# Test Plan — Module: Roles & Permissions

## Tổng quan

| Layer | File | Test Classes | Test Cases |
|---|---|---|---|
| Service (Role) | `test_role_service.py` | 8 | 35 |
| Service (Permission) | `test_permission_service.py` | 6 | 18 |
| Router | `test_role_router.py` | 14 | 45 |
| **Tổng** | | **28** | **98** |

> **Lưu ý đặc thù module Roles & Permissions:**
> - **Tất cả endpoints đều PROTECTED** — không có public endpoint nào
> - Module có **2 service class** (`RoleService`, `PermissionService`) trong cùng 1 router
> - `delete_role` có **2 guard**: không xóa system roles (ADMIN/CUSTOMER/SELLER) + không xóa nếu có users
> - `update_role` có **guard đổi tên system role**: ADMIN, CUSTOMER, SELLER không được đổi tên
> - `create_role` validate **permission_ids tồn tại** trước khi assign
> - `assign_permissions` **không tạo duplicate** — chỉ append permission chưa có
> - `create_permission` validate **HTTP method hợp lệ** + check **path+method trùng**
> - `get_all_roles` có param `include_permissions` → dùng `joinedload` hoặc `noload`
> - `get_role_stats` gọi `db.query(Role.name, func.count(...))` với **2 args** → `side_effect(*args)`

---

## SERVICE LAYER — `test_role_service.py`

### `TestGetAllRoles` (6 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_no_filter_returns_paginated_list` | Không truyền filter | `success=True`, có `meta` với `total`, `page`, `limit` |
| 2 | `test_with_search_filters_by_name` | Truyền `search="admin"` | `success=True`, `q.filter()` được gọi |
| 3 | `test_with_is_active_filter` | Truyền `is_active=True` | `success=True`, `q.filter()` được gọi thêm |
| 4 | `test_include_permissions_true_uses_joinedload` | `include_permissions=True` | `joinedload()` được gọi, `options()` được gọi |
| 5 | `test_include_permissions_false_uses_noload` | `include_permissions=False` | `noload()` được gọi, `options()` được gọi |
| 6 | `test_pagination_calculates_correctly` | 25 roles, `page=3`, `limit=10` | `total=25`, `page=3`, `total_pages=3` |

---

### `TestGetRoleById` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_existing_id_returns_role_with_permissions` | ID tồn tại | `success=True`, `data == mock_role` |
| 2 | `test_not_found_raises_404` | ID không tồn tại | Raise `HTTPException 404` |

---

### `TestCreateRole` (5 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_data_without_permissions_creates_role` | `permission_ids=[]` | `success=True`, `db.add()` và `db.commit()` được gọi |
| 2 | `test_valid_data_with_permissions_assigns_them` | `permission_ids` hợp lệ | `success=True`, `db.commit()` được gọi |
| 3 | `test_duplicate_name_raises_409` | Tên role đã tồn tại | Raise `HTTPException 409`, message chứa `"name"` |
| 4 | `test_invalid_permission_ids_raises_400` | Một số `permission_ids` không tồn tại | Raise `HTTPException 400`, message chứa `"invalid"` |
| 5 | `test_created_role_has_correct_created_by_id` | Tạo với `admin_id` | `added_role.created_by_id == admin_id` |

---

### `TestUpdateRole` (7 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_data_updates_successfully` | Role tồn tại, data hợp lệ | `success=True`, `db.commit()` được gọi |
| 2 | `test_not_found_raises_404` | Role ID không tồn tại | Raise `HTTPException 404` |
| 3 | `test_rename_system_role_raises_400` | Đổi tên role `"ADMIN"` thành tên khác | Raise `HTTPException 400`, message chứa `"ADMIN"` |
| 4 | `test_duplicate_name_raises_409` | Tên mới đã thuộc role khác | Raise `HTTPException 409` |
| 5 | `test_update_permissions_replaces_all` | Truyền `permission_ids` mới | `role.permissions == [mock_permission]` (thay thế hoàn toàn) |
| 6 | `test_invalid_permission_ids_raises_400` | Một số `permission_ids` không tồn tại | Raise `HTTPException 400` |
| 7 | `test_sets_updated_by_id` | Update với `admin_id` | `role.updated_by_id == admin_id` |

---

### `TestDeleteRole` (5 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_soft_delete_non_system_role_without_users` | Non-system role, không có users | `deleted_at` được set, `db.delete()` KHÔNG gọi, `db.commit()` được gọi |
| 2 | `test_not_found_raises_404` | Role ID không tồn tại | Raise `HTTPException 404` |
| 3 | `test_delete_system_role_raises_400` | Role tên `"ADMIN"` | Raise `HTTPException 400`, message chứa `"ADMIN"` |
| 4 | `test_role_with_users_raises_400` | Role đang có 3 users | Raise `HTTPException 400`, message chứa `"3"` |
| 5 | `test_sets_deleted_by_id` | Delete với `admin_id` | `role.deleted_by_id == admin_id` |

---

### `TestAssignPermissions` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_assign_new_permissions_successfully` | Role chưa có permission, assign mới | `success=True`, `mock_permission in role.permissions` |
| 2 | `test_does_not_add_duplicate_permissions` | Permission đã có trong role → assign lại | `role.permissions.count(mock_permission) == 1` |
| 3 | `test_not_found_raises_404` | Role ID không tồn tại | Raise `HTTPException 404` |
| 4 | `test_invalid_permission_ids_raises_400` | permission_ids không tồn tại | Raise `HTTPException 400` |

---

### `TestRemovePermissions` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_remove_permissions_successfully` | Role có permission → remove | `success=True`, `mock_permission not in role.permissions` |
| 2 | `test_remove_nonexistent_permission_does_not_raise` | Remove permission không có trong role | Không raise, `success=True` |
| 3 | `test_not_found_raises_404` | Role ID không tồn tại | Raise `HTTPException 404` |

---

### `TestGetRoleStats` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_correct_structure` | Gọi `get_role_stats` | Response có đủ keys: `total_roles`, `active_roles`, `inactive_roles`, `users_per_role` |
| 2 | `test_inactive_equals_total_minus_active` | `total=10`, `active=7` | `inactive_roles == 3` |
| 3 | `test_users_per_role_is_dict` | DB có 2 roles có users | `users_per_role` là `dict`, `{"ADMIN": 3, "CUSTOMER": 50}` |

> ⚠️ `side_effect` phải dùng `*args` (không phải `model`) vì query lần 3 nhận 2 positional args.

---

## SERVICE LAYER — `test_permission_service.py`

### `TestGetAllPermissions` (5 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_no_filter_returns_paginated_list` | Không truyền filter | `success=True`, có `meta.total == 1` |
| 2 | `test_with_search_filters_by_name_and_path` | Truyền `search="user"` | `success=True`, `q.filter()` được gọi |
| 3 | `test_with_module_filter` | Truyền `module="Users"` | `success=True`, `q.filter()` được gọi |
| 4 | `test_with_valid_http_method_filter` | Truyền `method="GET"` | `success=True`, `q.filter()` được gọi |
| 5 | `test_with_invalid_http_method_raises_400` | Truyền `method="INVALID"` | Raise `HTTPException 400` |

---

### `TestGetPermissionById` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_existing_id_returns_permission` | ID tồn tại | `success=True`, `data == mock_permission` |
| 2 | `test_not_found_raises_404` | ID không tồn tại | Raise `HTTPException 404` |

---

### `TestCreatePermission` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_data_creates_permission` | method hợp lệ, path+method chưa tồn tại | `success=True`, `db.add()` và `db.commit()` được gọi |
| 2 | `test_invalid_http_method_raises_400` | `method="INVALID"` | Raise `HTTPException 400`, `db.query()` KHÔNG được gọi |
| 3 | `test_duplicate_path_and_method_raises_409` | Path+method đã tồn tại | Raise `HTTPException 409` |
| 4 | `test_created_permission_has_correct_method_enum` | Truyền `method="post"` (lowercase) | `added.method == HTTPMethod.POST` |

---

### `TestUpdatePermission` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_data_updates_successfully` | Permission tồn tại | `success=True`, `db.commit()` được gọi |
| 2 | `test_not_found_raises_404` | Permission ID không tồn tại | Raise `HTTPException 404` |
| 3 | `test_sets_updated_by_id` | Update với `admin_id` | `permission.updated_by_id == admin_id` |

---

### `TestDeletePermission` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_soft_delete_sets_deleted_at` | Permission tồn tại | `deleted_at` được set, `deleted_by_id == admin_id`, `db.delete()` KHÔNG gọi |
| 2 | `test_not_found_raises_404` | Permission ID không tồn tại | Raise `HTTPException 404` |

---

### `TestGetPermissionsByModule` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_permissions_grouped_by_module` | DB có permissions thuộc module `"Users"` | `success=True`, `data` là `dict`, `"Users" in data` |
| 2 | `test_empty_db_returns_empty_dict` | Không có permission | `data == {}` |

---

## ROUTER LAYER — `test_role_router.py`

> **Tất cả endpoints đều PROTECTED.**
> - `client`: TestClient có auth bypass — dùng cho mọi happy path test
> - `public_client`: TestClient không auth — chỉ dùng để verify 401

### `TestGetAllRolesEndpoint` (5 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_200_with_list` | `GET /roles` | `200`, body có `data` và `meta` |
| 2 | `test_forwards_pagination_params` | `GET /roles?page=2&limit=5` | Service nhận `page=2`, `limit=5` |
| 3 | `test_forwards_search_param` | `GET /roles?search=admin` | Service nhận `search="admin"` |
| 4 | `test_forwards_include_permissions_param` | `GET /roles?include_permissions=true` | Service nhận `include_permissions=True` |
| 5 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestGetRoleStatsEndpoint` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_200_with_stats` | `GET /roles/stats` | `200`, `data.total_roles == 5` |
| 2 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestGetRoleByIdEndpoint` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_existing_role_returns_200` | `GET /roles/{id}` — tồn tại | `200`, service nhận đúng `role_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |

---

### `TestCreateRoleEndpoint` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_payload_returns_201` | `POST /roles` hợp lệ | `201`, service nhận đúng `current_user.id` |
| 2 | `test_missing_name_returns_422` | Thiếu field `name` | `422` |
| 3 | `test_duplicate_name_returns_409` | Service raise 409 | `409` |
| 4 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestUpdateRoleEndpoint` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_payload_returns_200` | `PUT /roles/{id}` hợp lệ | `200`, service nhận đúng `role_id` và `updated_by_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_system_role_rename_returns_400` | Service raise 400 | `400` |
| 4 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestDeleteRoleEndpoint` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_delete_returns_200` | `DELETE /roles/{id}` hợp lệ | `200`, service nhận đúng `role_id` và `deleted_by_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_system_role_returns_400` | Service raise 400 | `400` |
| 4 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestAssignPermissionsEndpoint` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_assign_returns_200` | `POST /roles/{id}/permissions/assign` | `200`, service nhận đúng `role_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestRemovePermissionsEndpoint` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_remove_returns_200` | `POST /roles/{id}/permissions/remove` | `200`, service nhận đúng `role_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestGetAllPermissionsEndpoint` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_200_with_list` | `GET /roles/permissions/all` | `200`, body có `data` và `meta` |
| 2 | `test_forwards_filters` | `GET /roles/permissions/all?module=Users&method=GET` | Service nhận đúng `module="Users"`, `method="GET"` |
| 3 | `test_invalid_method_returns_400` | Service raise 400 | `400` |
| 4 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestGetPermissionsByModuleEndpoint` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_200_grouped_by_module` | `GET /roles/permissions/grouped` | `200`, `success=True` |
| 2 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestGetPermissionByIdEndpoint` (2 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_existing_permission_returns_200` | `GET /roles/permissions/{id}` — tồn tại | `200`, service nhận đúng `permission_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |

---

### `TestCreatePermissionEndpoint` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_payload_returns_201` | `POST /roles/permissions` hợp lệ | `201`, service nhận đúng `current_user.id` |
| 2 | `test_missing_required_fields_returns_422` | Thiếu field `name` | `422` |
| 3 | `test_duplicate_path_method_returns_409` | Service raise 409 | `409` |
| 4 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestUpdatePermissionEndpoint` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_payload_returns_200` | `PUT /roles/permissions/{id}` hợp lệ | `200`, service nhận đúng `permission_id` và `updated_by_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestDeletePermissionEndpoint` (3 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_delete_returns_200` | `DELETE /roles/permissions/{id}` | `200`, service nhận đúng `permission_id` và `deleted_by_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_without_auth_returns_401` | Không có token | `401` |