# Test Plan — Module: Categories

## Tổng quan

| Layer | File | Test Classes | Test Cases |
|---|---|---|---|
| Service | `test_category_service.py` | 9 | 42 |
| Router | `test_category_router.py` | 9 | 31 |
| **Tổng** | | **18** | **73** |

> **Lưu ý đặc thù module Categories:**
> - Cấu trúc **hierarchical** (parent → children) — mọi test liên quan đến parent_id cần mock thêm
> - **3 public endpoints**: `GET /categories`, `GET /categories/tree`, `GET /categories/{id}`
> - `delete_category` có **recursive cascade** xuống children + guard có products
> - `update_category` và `move_category` đều validate **cannot be own parent**
> - `create_category` validate **parent_id tồn tại** trước khi tạo
> - `get_all_categories` trả về **flat list** kèm `children_count`
> - `get_category_tree` trả về **nested tree** với `children: []`

---

## SERVICE LAYER — `test_category_service.py`

### `TestGetAllCategories` (5 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_active_categories_by_default` | Gọi với `include_inactive=False` | Chỉ trả về category active, `total >= 1` |
| 2 | `test_include_inactive_returns_all` | Gọi với `include_inactive=True` | `success=True`, không filter `is_active` |
| 3 | `test_empty_db_returns_empty_list` | Không có category nào | `categories=[]`, `total=0` |
| 4 | `test_response_includes_product_count_and_children_count` | Category có products và children | `product_count` và `children_count` có trong response |
| 5 | `test_message_is_correct` | Gọi bình thường | `message == "Categories retrieved successfully"` |

---

### `TestGetCategoryTree` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_tree_structure_with_children_key` | DB có categories | Mỗi item có key `"children"` |
| 2 | `test_root_categories_have_no_parent` | Category root (`parent_id=None`) | Nằm ở top-level của tree |
| 3 | `test_empty_db_returns_empty_list` | Không có category | `data=[]` |
| 4 | `test_message_is_correct` | Gọi bình thường | `message == "Category tree retrieved successfully"` |

---

### `TestGetCategoryById` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_existing_id_returns_category_with_counts` | ID tồn tại | `success=True`, có `product_count` và `children_count` |
| 2 | `test_not_found_raises_404` | ID không tồn tại | Raise `HTTPException 404`, `detail.success=False` |
| 3 | `test_children_count_is_queried_separately` | Category có 3 children | `children_count == 3` |
| 4 | `test_message_contains_category` | ID tồn tại | `"Category"` có trong `message` |

---

### `TestCreateCategory` (6 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_data_without_parent_creates_root_category` | `parent_id=None`, slug chưa có | `success=True`, `db.add()` và `db.commit()` được gọi |
| 2 | `test_valid_data_with_parent_creates_child_category` | `parent_id` hợp lệ, slug chưa có | `success=True`, category được tạo với `parent_id` |
| 3 | `test_duplicate_slug_raises_409` | Slug đã tồn tại | Raise `HTTPException 409`, message chứa `"slug"` |
| 4 | `test_parent_not_found_raises_404` | `parent_id` không tồn tại | Raise `HTTPException 404`, message chứa `"Parent category"` |
| 5 | `test_created_category_has_is_active_true` | Tạo category mới | Category được add có `is_active=True` |
| 6 | `test_created_category_has_correct_created_by_id` | Tạo với `admin_id` | `created_by_id == admin_id` |

---

### `TestUpdateCategory` (8 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_data_updates_successfully` | Category tồn tại, data hợp lệ | `success=True`, `db.commit()` được gọi |
| 2 | `test_not_found_raises_404` | Category ID không tồn tại | Raise `HTTPException 404` |
| 3 | `test_duplicate_slug_on_another_category_raises_409` | Slug mới thuộc category khác | Raise `HTTPException 409` |
| 4 | `test_same_slug_does_not_trigger_duplicate_check` | Truyền slug trùng slug hiện tại | `success=True`, không query check slug |
| 5 | `test_parent_id_equal_self_raises_400` | `parent_id == category_id` | Raise `HTTPException 400`, message chứa `"own parent"` |
| 6 | `test_parent_not_found_raises_404` | `parent_id` không tồn tại | Raise `HTTPException 404`, message chứa `"Parent category"` |
| 7 | `test_sets_updated_by_id` | Update với `admin_id` | `category.updated_by_id == admin_id` |
| 8 | `test_only_updates_provided_fields` | Chỉ truyền `name`, không truyền `slug` | `slug` không bị `setattr` |

---

### `TestDeleteCategory` (6 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_soft_delete_without_products_and_children` | Không có product, không có children | `deleted_at` được set, `db.delete()` KHÔNG gọi, `db.commit()` được gọi |
| 2 | `test_not_found_raises_404` | Category ID không tồn tại | Raise `HTTPException 404` |
| 3 | `test_category_with_products_raises_400` | Category có products | Raise `HTTPException 400`, message chứa `"products"` |
| 4 | `test_error_message_includes_product_count` | Category có 4 products | Message chứa `"4"` |
| 5 | `test_category_with_children_deletes_children_recursively` | Category có children (không có product) | Children bị soft delete, sau đó category cha bị soft delete |
| 6 | `test_sets_deleted_by_id` | Delete với `admin_id` | `category.deleted_by_id == admin_id` |

---

### `TestToggleStatus` (5 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_active_category_becomes_inactive` | `is_active=True` | `category.is_active == False` |
| 2 | `test_inactive_category_becomes_active` | `is_active=False` | `category.is_active == True` |
| 3 | `test_not_found_raises_404` | Category ID không tồn tại | Raise `HTTPException 404` |
| 4 | `test_response_message_reflects_new_status` | Toggle từ True → False | `"inactive"` có trong `message` |
| 5 | `test_sets_updated_by_id` | Toggle với `admin_id` | `category.updated_by_id == admin_id` |

---

### `TestMoveCategory` (6 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_move_to_new_parent_successfully` | Category và parent đều tồn tại | `success=True`, `category.parent_id == new_parent_id` |
| 2 | `test_move_to_root_sets_parent_id_none` | `new_parent_id=None` | `category.parent_id == None` |
| 3 | `test_not_found_raises_404` | Category ID không tồn tại | Raise `HTTPException 404` |
| 4 | `test_new_parent_not_found_raises_404` | `new_parent_id` không tồn tại | Raise `HTTPException 404`, message chứa `"Parent category"` |
| 5 | `test_move_to_self_raises_400` | `new_parent_id == category_id` | Raise `HTTPException 400`, message chứa `"own parent"` |
| 6 | `test_sets_updated_by_id` | Move với `admin_id` | `category.updated_by_id == admin_id` |

---

### `TestGetCategoryStats` (4 cases)
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_correct_structure` | Gọi get_category_stats | Response có đủ keys: `total_categories`, `active_categories`, `parent_categories`, `child_categories`, `top_categories` |
| 2 | `test_child_count_equals_total_minus_parent` | total=10, parent=4 | `child_categories = 10 - 4 = 6` |
| 3 | `test_top_categories_have_correct_format` | DB có 1 top category | `top_categories[0]` có `name` và `product_count` |
| 4 | `test_inactive_equals_total_minus_active` | total=10, active=7 | `active_categories == 7` |

---

## ROUTER LAYER — `test_category_router.py`

> - `public_client`: TestClient **không có auth** → test public endpoints
> - `client`: TestClient **có auth bypass** → test protected endpoints
> - Service được mock bằng `patch()`

### `TestGetAllCategoriesEndpoint` (3 cases) — PUBLIC
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_public_endpoint_returns_200_without_auth` | `GET /categories` không có token | `200`, body có `data.categories` và `data.total` |
| 2 | `test_forwards_include_inactive_param` | `GET /categories?include_inactive=true` | Service nhận `include_inactive=True` |
| 3 | `test_include_inactive_defaults_to_false` | `GET /categories` không truyền param | Service nhận `include_inactive=False` |

---

### `TestGetCategoryTreeEndpoint` (3 cases) — PUBLIC
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_public_endpoint_returns_200_without_auth` | `GET /categories/tree` không có token | `200`, `success=True` |
| 2 | `test_forwards_include_inactive_param` | `GET /categories/tree?include_inactive=true` | Service nhận `include_inactive=True` |
| 3 | `test_include_inactive_defaults_to_false` | `GET /categories/tree` không truyền param | Service nhận `include_inactive=False` |

---

### `TestGetCategoryStatsEndpoint` (2 cases) — PROTECTED
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_200_with_stats` | `GET /categories/stats` với auth | `200`, data có đủ keys thống kê |
| 2 | `test_without_auth_returns_401` | `GET /categories/stats` không có token | `401` |

---

### `TestGetCategoryDetailEndpoint` (2 cases) — PUBLIC
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_existing_category_returns_200` | `GET /categories/{id}` — tồn tại | `200`, service nhận đúng `category_id` |
| 2 | `test_not_found_returns_404` | `GET /categories/{id}` — service raise 404 | `404`, `detail.success=False` |

---

### `TestCreateCategoryEndpoint` (7 cases) — PROTECTED
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_payload_returns_201` | `POST /categories` hợp lệ | `201`, service nhận đúng `current_user.id` |
| 2 | `test_missing_name_returns_422` | Thiếu field `name` | `422` |
| 3 | `test_missing_slug_returns_422` | Thiếu field `slug` | `422` |
| 4 | `test_name_too_long_returns_422` | `name` > 200 ký tự | `422` — vi phạm `Field(max_length=200)` |
| 5 | `test_display_order_negative_returns_422` | `display_order=-1` | `422` — vi phạm `Field(ge=0)` |
| 6 | `test_duplicate_slug_returns_409` | Service raise 409 | `409` |
| 7 | `test_without_auth_returns_401` | `POST /categories` không có token | `401` |

---

### `TestUpdateCategoryEndpoint` (5 cases) — PROTECTED
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_valid_payload_returns_200` | `PUT /categories/{id}` hợp lệ | `200`, service nhận đúng `category_id` và `updated_by_id` |
| 2 | `test_empty_name_returns_422` | `name=""` | `422` — vi phạm `Field(min_length=1)` |
| 3 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 4 | `test_self_parent_returns_400` | Service raise 400 | `400` |
| 5 | `test_without_auth_returns_401` | `PUT /categories/{id}` không có token | `401` |

---

### `TestDeleteCategoryEndpoint` (4 cases) — PROTECTED
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_delete_returns_200` | `DELETE /categories/{id}` hợp lệ | `200`, service nhận đúng `category_id` và `deleted_by_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_category_with_products_returns_400` | Service raise 400 | `400`, message chứa `"products"` |
| 4 | `test_without_auth_returns_401` | `DELETE /categories/{id}` không có token | `401` |

---

### `TestToggleCategoryStatusEndpoint` (3 cases) — PROTECTED
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_returns_200_with_updated_category` | `PATCH /categories/{id}/toggle-status` | `200`, service nhận đúng `category_id` và `updated_by_id` |
| 2 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 3 | `test_without_auth_returns_401` | Không có token | `401` |

---

### `TestMoveCategoryEndpoint` (5 cases) — PROTECTED
| # | Test Case | Mô tả | Expected |
|---|---|---|---|
| 1 | `test_move_to_new_parent_returns_200` | `PATCH /categories/{id}/move` với `new_parent_id` hợp lệ | `200`, service nhận đúng `new_parent_id` và `updated_by_id` |
| 2 | `test_move_to_root_returns_200` | `new_parent_id=null` | `200` |
| 3 | `test_not_found_returns_404` | Service raise 404 | `404` |
| 4 | `test_self_parent_returns_400` | Service raise 400 | `400` |
| 5 | `test_without_auth_returns_401` | Không có token | `401` |