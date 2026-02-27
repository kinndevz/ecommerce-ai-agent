# Test Plan — Module: Brands

## Tổng quan

| Layer    | File                    | Test Classes | Test Cases |
| -------- | ----------------------- | ------------ | ---------- |
| Service  | `test_brand_service.py` | 7            | 31         |
| Router   | `test_brand_router.py`  | 7            | 25         |
| **Tổng** |                         | **14**       | **56**     |

> **Lưu ý đặc thù module Brands:**
>
> - Có **2 loại endpoint**: Public (`GET /brands`, `GET /brands/{id}`) và Protected (còn lại)
> - Fixture `public_client` dùng cho public endpoints, `client` dùng cho protected endpoints
> - `get_all_brands` dùng `outerjoin` với Product để đếm `product_count`
> - `delete_brand` có guard: không được xóa nếu brand còn product

---

## SERVICE LAYER — `test_brand_service.py`

### `TestGetAllBrands` (5 cases)

| #   | Test Case                                   | Mô tả                            | Expected                                            |
| --- | ------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| 1   | `test_returns_active_brands_by_default`     | Gọi với `include_inactive=False` | Chỉ trả về brand active, `total=1`, `len(brands)=1` |
| 2   | `test_include_inactive_skips_active_filter` | Gọi với `include_inactive=True`  | `success=True`, không filter `is_active`            |
| 3   | `test_empty_result_returns_empty_list`      | Không có brand nào               | `brands=[]`, `total=0`                              |
| 4   | `test_response_includes_product_count`      | Brand có 5 products              | `brands[0]["product_count"] == 5`                   |
| 5   | `test_message_is_correct`                   | Gọi bình thường                  | `message == "Brands retrieved successfully"`        |

---

### `TestGetBrandById` (3 cases)

| #   | Test Case                                           | Mô tả                     | Expected                                          |
| --- | --------------------------------------------------- | ------------------------- | ------------------------------------------------- |
| 1   | `test_existing_id_returns_brand_with_product_count` | ID tồn tại, có 7 products | `success=True`, `data["product_count"] == 7`      |
| 2   | `test_not_found_raises_404`                         | ID không tồn tại          | Raise `HTTPException 404`, `detail.success=False` |
| 3   | `test_message_contains_brand`                       | ID tồn tại                | `"Brand"` có trong `message`                      |

---

### `TestCreateBrand` (4 cases)

| #   | Test Case                                      | Mô tả                          | Expected                                             |
| --- | ---------------------------------------------- | ------------------------------ | ---------------------------------------------------- |
| 1   | `test_valid_data_creates_brand_successfully`   | Slug chưa tồn tại, data hợp lệ | `success=True`, `db.add()` và `db.commit()` được gọi |
| 2   | `test_duplicate_slug_raises_409`               | Slug đã tồn tại trong DB       | Raise `HTTPException 409`, message chứa `"slug"`     |
| 3   | `test_created_brand_has_is_active_true`        | Tạo brand mới                  | Brand được add vào DB có `is_active=True`            |
| 4   | `test_created_brand_has_correct_created_by_id` | Tạo với `admin_id`             | Brand được add có `created_by_id == admin_id`        |

---

### `TestUpdateBrand` (6 cases)

| #   | Test Case                                         | Mô tả                                     | Expected                                                                       |
| --- | ------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | `test_valid_data_updates_successfully`            | Brand tồn tại, data hợp lệ                | `success=True`, message `"Brand updated successfully"`, `db.commit()` được gọi |
| 2   | `test_not_found_raises_404`                       | Brand ID không tồn tại                    | Raise `HTTPException 404`                                                      |
| 3   | `test_duplicate_slug_on_another_brand_raises_409` | Slug mới đã thuộc brand khác              | Raise `HTTPException 409`                                                      |
| 4   | `test_same_slug_does_not_trigger_duplicate_check` | Truyền slug trùng với slug hiện tại       | `success=True`, `db.query` chỉ được gọi **1 lần**                              |
| 5   | `test_sets_updated_by_id`                         | Update với `admin_id`                     | `brand.updated_by_id == admin_id`                                              |
| 6   | `test_only_updates_provided_fields`               | Chỉ truyền `country`, không truyền `name` | `name` không bị `setattr`                                                      |

---

### `TestDeleteBrand` (4 cases)

| #   | Test Case                                    | Mô tả                  | Expected                                                                    |
| --- | -------------------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| 1   | `test_soft_delete_without_products_succeeds` | Brand không có product | `deleted_at` được set, `deleted_by_id == admin_id`, `db.delete()` KHÔNG gọi |
| 2   | `test_not_found_raises_404`                  | Brand ID không tồn tại | Raise `HTTPException 404`                                                   |
| 3   | `test_brand_with_products_cannot_be_deleted` | Brand có 5 products    | Raise `HTTPException 400`, message chứa `"products"`                        |
| 4   | `test_error_message_includes_product_count`  | Brand có 3 products    | Message chứa `"3"` (số lượng cụ thể)                                        |

---

### `TestToggleStatus` (6 cases)

| #   | Test Case                                            | Mô tả                  | Expected                          |
| --- | ---------------------------------------------------- | ---------------------- | --------------------------------- |
| 1   | `test_active_brand_becomes_inactive`                 | `is_active=True`       | `brand.is_active == False`        |
| 2   | `test_inactive_brand_becomes_active`                 | `is_active=False`      | `brand.is_active == True`         |
| 3   | `test_not_found_raises_404`                          | Brand ID không tồn tại | Raise `HTTPException 404`         |
| 4   | `test_response_message_reflects_new_status_active`   | Toggle từ False → True | `"active"` có trong `message`     |
| 5   | `test_response_message_reflects_new_status_inactive` | Toggle từ True → False | `"inactive"` có trong `message`   |
| 6   | `test_sets_updated_by_id`                            | Toggle với `admin_id`  | `brand.updated_by_id == admin_id` |

---

### `TestGetBrandStats` (3 cases)

| #   | Test Case                                 | Mô tả               | Expected                                                                              |
| --- | ----------------------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| 1   | `test_returns_correct_structure`          | Gọi get_brand_stats | Response có đủ keys: `total_brands`, `active_brands`, `inactive_brands`, `top_brands` |
| 2   | `test_inactive_equals_total_minus_active` | total=10, active=8  | `inactive_brands = 10 - 8 = 2`                                                        |
| 3   | `test_top_brands_have_correct_format`     | DB có 1 top brand   | `top_brands[0]` có `name="CeraVe"` và `product_count=20`                              |

---

## ROUTER LAYER — `test_brand_router.py`

> - `public_client`: TestClient **không có auth** → test public endpoints
> - `client`: TestClient **có auth bypass** → test protected endpoints
> - Service được mock bằng `patch()`

### `TestGetAllBrandsEndpoint` (3 cases) — PUBLIC

| #   | Test Case                                       | Mô tả                               | Expected                                     |
| --- | ----------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| 1   | `test_public_endpoint_returns_200_without_auth` | `GET /brands` không có token        | `200`, body có `data.brands` và `data.total` |
| 2   | `test_forwards_include_inactive_param`          | `GET /brands?include_inactive=true` | Service nhận `include_inactive=True`         |
| 3   | `test_include_inactive_defaults_to_false`       | `GET /brands` không truyền param    | Service nhận `include_inactive=False`        |

---

### `TestGetBrandStatsEndpoint` (2 cases) — PROTECTED

| #   | Test Case                                          | Mô tả                              | Expected                         |
| --- | -------------------------------------------------- | ---------------------------------- | -------------------------------- |
| 1   | `test_returns_200_with_stats`                      | `GET /brands/stats` với auth       | `200`, `data.total_brands == 10` |
| 2   | `test_protected_endpoint_without_auth_returns_401` | `GET /brands/stats` không có token | `401`                            |

---

### `TestGetBrandDetailEndpoint` (2 cases) — PUBLIC

| #   | Test Case                         | Mô tả                                  | Expected                            |
| --- | --------------------------------- | -------------------------------------- | ----------------------------------- |
| 1   | `test_existing_brand_returns_200` | `GET /brands/{id}` — brand tồn tại     | `200`, service nhận đúng `brand_id` |
| 2   | `test_not_found_returns_404`      | `GET /brands/{id}` — service raise 404 | `404`, `detail.success=False`       |

---

### `TestCreateBrandEndpoint` (6 cases) — PROTECTED

| #   | Test Case                         | Mô tả                         | Expected                                   |
| --- | --------------------------------- | ----------------------------- | ------------------------------------------ |
| 1   | `test_valid_payload_returns_201`  | `POST /brands` hợp lệ         | `201`, service nhận đúng `current_user.id` |
| 2   | `test_missing_name_returns_422`   | Thiếu field `name`            | `422`                                      |
| 3   | `test_missing_slug_returns_422`   | Thiếu field `slug`            | `422`                                      |
| 4   | `test_name_too_long_returns_422`  | `name` > 200 ký tự            | `422` — vi phạm `Field(max_length=200)`    |
| 5   | `test_duplicate_slug_returns_409` | Service raise 409             | `409`                                      |
| 6   | `test_without_auth_returns_401`   | `POST /brands` không có token | `401`                                      |

---

### `TestUpdateBrandEndpoint` (5 cases) — PROTECTED

| #   | Test Case                         | Mô tả                             | Expected                                               |
| --- | --------------------------------- | --------------------------------- | ------------------------------------------------------ |
| 1   | `test_valid_payload_returns_200`  | `PUT /brands/{id}` hợp lệ         | `200`, service nhận đúng `brand_id` và `updated_by_id` |
| 2   | `test_empty_name_returns_422`     | `name = ""`                       | `422` — vi phạm `Field(min_length=1)`                  |
| 3   | `test_not_found_returns_404`      | Service raise 404                 | `404`                                                  |
| 4   | `test_duplicate_slug_returns_409` | Service raise 409                 | `409`                                                  |
| 5   | `test_without_auth_returns_401`   | `PUT /brands/{id}` không có token | `401`                                                  |

---

### `TestDeleteBrandEndpoint` (4 cases) — PROTECTED

| #   | Test Case                              | Mô tả                                | Expected                                               |
| --- | -------------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| 1   | `test_delete_returns_200`              | `DELETE /brands/{id}` hợp lệ         | `200`, service nhận đúng `brand_id` và `deleted_by_id` |
| 2   | `test_not_found_returns_404`           | Service raise 404                    | `404`                                                  |
| 3   | `test_brand_with_products_returns_400` | Service raise 400                    | `400`, message chứa `"products"`                       |
| 4   | `test_without_auth_returns_401`        | `DELETE /brands/{id}` không có token | `401`                                                  |

---

### `TestToggleBrandStatusEndpoint` (3 cases) — PROTECTED

| #   | Test Case                             | Mô tả                                             | Expected                                               |
| --- | ------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| 1   | `test_returns_200_with_updated_brand` | `PATCH /brands/{id}/toggle-status`                | `200`, service nhận đúng `brand_id` và `updated_by_id` |
| 2   | `test_not_found_returns_404`          | Service raise 404                                 | `404`                                                  |
| 3   | `test_without_auth_returns_401`       | `PATCH /brands/{id}/toggle-status` không có token | `401`                                                  |
