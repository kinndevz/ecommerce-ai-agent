# Test Plan — Module: Users

## Tổng quan

| Layer    | File                   | Test Classes | Test Cases |
| -------- | ---------------------- | ------------ | ---------- |
| Service  | `test_user_service.py` | 7            | 27         |
| Router   | `test_user_router.py`  | 7            | 24         |
| **Tổng** |                        | **14**       | **51**     |

---

## SERVICE LAYER — `test_user_service.py`

### `TestGetAllUsers` (6 cases)

| #   | Test Case                                          | Mô tả                    | Expected                                                              |
| --- | -------------------------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| 1   | `test_no_filter_returns_paginated_list`            | Không truyền filter nào  | `success=True`, có `meta` với `total`, `page`, `limit`, `total_pages` |
| 2   | `test_with_search_applies_filter`                  | Truyền `search="test"`   | `filter()` được gọi trên query                                        |
| 3   | `test_empty_db_returns_empty_list`                 | DB không có user         | `data=[]`, `total=0`, `total_pages=0`                                 |
| 4   | `test_pagination_calculates_total_pages_correctly` | 25 users, `limit=10`     | `total_pages=3`                                                       |
| 5   | `test_with_status_filter_applies_filter`           | Truyền `status="ACTIVE"` | `filter()` được gọi thêm                                              |
| 6   | `test_with_role_filter_joins_role_table`           | Truyền `role="ADMIN"`    | `join()` được gọi để join bảng Role                                   |

---

### `TestGetUser` (2 cases)

| #   | Test Case                            | Mô tả            | Expected                         |
| --- | ------------------------------------ | ---------------- | -------------------------------- |
| 1   | `test_existing_id_returns_user_data` | ID tồn tại       | `success=True`, `data=mock_user` |
| 2   | `test_not_found_raises_404`          | ID không tồn tại | Raise `HTTPException 404`        |

---

### `TestCreateUser` (4 cases)

| #   | Test Case                                | Mô tả                                       | Expected                                                 |
| --- | ---------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| 1   | `test_valid_data_returns_created_user`   | Payload hợp lệ, email chưa có, role tồn tại | `success=True`, `db.add()` và `db.commit()` được gọi     |
| 2   | `test_duplicate_email_raises_409`        | Email đã tồn tại trong DB                   | Raise `HTTPException 409`, message chứa "already exists" |
| 3   | `test_role_not_found_raises_404`         | `role_id` không tồn tại                     | Raise `HTTPException 404`, message chứa "Role"           |
| 4   | `test_password_is_hashed_not_plain_text` | Password plain text được truyền vào         | `hash_password()` được gọi, User lưu password đã hash    |

---

### `TestUpdateUser` (4 cases)

| #   | Test Case                              | Mô tả                                               | Expected                               |
| --- | -------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| 1   | `test_valid_data_updates_successfully` | Payload hợp lệ, user tồn tại                        | `success=True`, `db.commit()` được gọi |
| 2   | `test_not_found_raises_404`            | User ID không tồn tại                               | Raise `HTTPException 404`              |
| 3   | `test_only_updates_provided_fields`    | Chỉ truyền `phone_number`, không truyền `full_name` | `full_name` không bị `setattr`         |
| 4   | `test_sets_updated_by_id_correctly`    | Gọi update với `admin_id`                           | `user.updated_by_id == admin_id`       |

---

### `TestDeleteUser` (4 cases)

| #   | Test Case                                                     | Mô tả                      | Expected                                            |
| --- | ------------------------------------------------------------- | -------------------------- | --------------------------------------------------- |
| 1   | `test_soft_delete_sets_deleted_at_and_does_not_remove_record` | Xóa user hợp lệ            | `deleted_at` được set, `db.delete()` KHÔNG được gọi |
| 2   | `test_not_found_raises_404`                                   | User ID không tồn tại      | Raise `HTTPException 404`                           |
| 3   | `test_cannot_delete_self_raises_400`                          | `user_id == deleted_by_id` | Raise `HTTPException 400`, message chứa "yourself"  |
| 4   | `test_sets_deleted_by_id`                                     | Xóa user với `admin_id`    | `user.deleted_by_id == admin_id`                    |

---

### `TestToggleStatus` (5 cases)

| #   | Test Case                            | Mô tả                      | Expected                                             |
| --- | ------------------------------------ | -------------------------- | ---------------------------------------------------- |
| 1   | `test_active_becomes_inactive`       | User đang `ACTIVE`         | `user.status == INACTIVE`                            |
| 2   | `test_inactive_becomes_active`       | User đang `INACTIVE`       | `user.status == ACTIVE`                              |
| 3   | `test_cannot_toggle_self_raises_400` | `user_id == updated_by_id` | Raise `HTTPException 400`, message chứa "own status" |
| 4   | `test_not_found_raises_404`          | User ID không tồn tại      | Raise `HTTPException 404`                            |
| 5   | `test_sets_updated_by_id`            | Toggle với `admin_id`      | `user.updated_by_id == admin_id`                     |

---

### `TestGetUserStats` (2 cases)

| #   | Test Case                                 | Mô tả              | Expected                                                                                                |
| --- | ----------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| 1   | `test_returns_correct_structure`          | Gọi get_user_stats | Response có đủ keys: `total_users`, `active_users`, `inactive_users`, `users_with_2fa`, `users_by_role` |
| 2   | `test_inactive_equals_total_minus_active` | total=10, active=7 | `inactive_users = 10 - 7 = 3`                                                                           |

---

## ROUTER LAYER — `test_user_router.py`

> Auth được bypass qua `dependency_overrides[get_current_active_user]`.
> Service được mock bằng `patch()`.

### `TestGetAllUsersEndpoint` (6 cases)

| #   | Test Case                               | Mô tả                                 | Expected                                       |
| --- | --------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| 1   | `test_returns_200_with_list`            | `GET /users`                          | `200`, body có `success`, `data`, `meta`       |
| 2   | `test_forwards_pagination_params`       | `GET /users?page=2&limit=5`           | Service nhận đúng `page=2`, `limit=5`          |
| 3   | `test_forwards_search_param`            | `GET /users?search=john`              | Service nhận `search="john"`                   |
| 4   | `test_forwards_role_and_status_filters` | `GET /users?role=ADMIN&status=ACTIVE` | Service nhận `role="ADMIN"`, `status="ACTIVE"` |
| 5   | `test_page_less_than_1_returns_422`     | `GET /users?page=0`                   | `422` — vi phạm `Query(ge=1)`                  |
| 6   | `test_limit_over_100_returns_422`       | `GET /users?limit=101`                | `422` — vi phạm `Query(le=100)`                |

---

### `TestGetUserStatsEndpoint` (1 case)

| #   | Test Case                          | Mô tả              | Expected                         |
| --- | ---------------------------------- | ------------------ | -------------------------------- |
| 1   | `test_returns_200_with_stats_data` | `GET /users/stats` | `200`, `data.total_users == 100` |

---

### `TestGetUserByIdEndpoint` (2 cases)

| #   | Test Case                        | Mô tả                                 | Expected                           |
| --- | -------------------------------- | ------------------------------------- | ---------------------------------- |
| 1   | `test_existing_user_returns_200` | `GET /users/{id}` — user tồn tại      | `200`, service nhận đúng `user_id` |
| 2   | `test_not_found_returns_404`     | `GET /users/{id}` — service raise 404 | `404`, `detail.success == False`   |

---

### `TestCreateUserEndpoint` (6 cases)

| #   | Test Case                                               | Mô tả                    | Expected                                   |
| --- | ------------------------------------------------------- | ------------------------ | ------------------------------------------ |
| 1   | `test_valid_payload_calls_service_with_current_user_id` | `POST /users` hợp lệ     | `200`, service nhận đúng `current_user.id` |
| 2   | `test_missing_email_returns_422`                        | Thiếu field `email`      | `422`                                      |
| 3   | `test_password_too_short_returns_422`                   | `password` < 6 ký tự     | `422` — vi phạm `Field(min_length=6)`      |
| 4   | `test_invalid_email_format_returns_422`                 | `email = "not-an-email"` | `422`                                      |
| 5   | `test_duplicate_email_returns_409`                      | Service raise 409        | `409`                                      |
| 6   | `test_role_not_found_returns_404`                       | Service raise 404        | `404`                                      |

---

### `TestUpdateUserEndpoint` (3 cases)

| #   | Test Case                          | Mô tả                    | Expected                                              |
| --- | ---------------------------------- | ------------------------ | ----------------------------------------------------- |
| 1   | `test_valid_payload_returns_200`   | `PUT /users/{id}` hợp lệ | `200`, service nhận đúng `user_id` và `updated_by_id` |
| 2   | `test_empty_full_name_returns_422` | `full_name = ""`         | `422` — vi phạm `Field(min_length=1)`                 |
| 3   | `test_not_found_returns_404`       | Service raise 404        | `404`                                                 |

---

### `TestDeleteUserEndpoint` (3 cases)

| #   | Test Case                               | Mô tả                       | Expected                                              |
| --- | --------------------------------------- | --------------------------- | ----------------------------------------------------- |
| 1   | `test_returns_200_with_success_message` | `DELETE /users/{id}` hợp lệ | `200`, service nhận đúng `user_id` và `deleted_by_id` |
| 2   | `test_not_found_returns_404`            | Service raise 404           | `404`                                                 |
| 3   | `test_delete_self_returns_400`          | Service raise 400           | `400`, message chứa "yourself"                        |

---

### `TestToggleStatusEndpoint` (3 cases)

| #   | Test Case                            | Mô tả                           | Expected                                              |
| --- | ------------------------------------ | ------------------------------- | ----------------------------------------------------- |
| 1   | `test_returns_200_with_updated_user` | `PUT /users/{id}/toggle-status` | `200`, service nhận đúng `user_id` và `updated_by_id` |
| 2   | `test_toggle_self_returns_400`       | Service raise 400               | `400`                                                 |
| 3   | `test_not_found_returns_404`         | Service raise 404               | `404`                                                 |
