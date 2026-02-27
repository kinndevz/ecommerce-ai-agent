# Test Plan — Module: Cart

## Tổng quan

| Layer    | File                   | Test Classes | Test Cases |
| -------- | ---------------------- | ------------ | ---------- |
| Service  | `test_cart_service.py` | 5            | 22         |
| Router   | `test_cart_router.py`  | 5            | 17         |
| **Tổng** |                        | **10**       | **39**     |

> **Lưu ý đặc thù module Cart:**
>
> - Auth dùng `get_current_user` (KHÔNG phải `require_permission()`) → mock user **không cần role**
> - `_format_cart` truy cập `item.product.images` (list) và `item.variant` → mock CartItem phải setup đủ
> - Price logic trong `add_to_cart` có **4 tầng**: `variant.sale_price` > `variant.price` > `product.sale_price` > `product.price`
> - `get_or_create_cart` được gọi **bên trong** `get_cart` và `add_to_cart` → query chain cần mock 2 bước
> - `update_cart_item` và `remove_cart_item` dùng `.join(Cart).filter(Cart.user_id)` → side_effect nhận `*args`
> - `clear_cart` dùng **bulk delete** `db.query(CartItem).filter(...).delete()` — không phải `db.delete(item)`
> - `remove_cart_item` mới dùng `db.delete(cart_item)` (single item delete)

---

## Fixtures cần thiết (`conftest.py`)

```python
# mock_cart: Cart object với user_id, items=[]
# mock_cart_item: CartItem với product, variant, quantity, price
#   - item.product.images = [mock_image]  ← BẮT BUỘC cho _format_cart
#   - item.variant = None hoặc mock_variant
# mock_product: Product với stock_quantity, sale_price, price, images
# mock_variant: ProductVariant với stock_quantity, price, sale_price=None
# mock_admin_user: User chỉ cần user.id — KHÔNG cần role
# client: override get_current_user (không phải require_permission)
```

---

## SERVICE LAYER — `test_cart_service.py`

### `TestGetCart` (4 cases)

| #   | Test Case                                     | Mô tả                  | Expected                                                      |
| --- | --------------------------------------------- | ---------------------- | ------------------------------------------------------------- |
| 1   | `test_existing_cart_returns_formatted_data`   | Cart tồn tại với items | `success=True`, `data.id == cart.id`, `data.items` có dữ liệu |
| 2   | `test_no_cart_creates_and_returns_empty_cart` | User chưa có cart      | Gọi `get_or_create_cart`, trả về cart mới với `items=[]`      |
| 3   | `test_message_is_correct`                     | Gọi bình thường        | `message == "Cart retrieved successfully!"`                   |
| 4   | `test_empty_cart_has_zero_subtotal`           | Cart không có item nào | `subtotal == 0.0`, `total_items == 0`                         |

---

### `TestAddToCart` (8 cases)

| #   | Test Case                                           | Mô tả                                           | Expected                                                     |
| --- | --------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| 1   | `test_add_new_item_without_variant`                 | Product tồn tại, không có variant, chưa có item | `db.add()` được gọi, `message == "Item added to cart"`       |
| 2   | `test_add_new_item_with_variant`                    | Có `variant_id` hợp lệ                          | CartItem được tạo với `variant_id`, dùng variant's price     |
| 3   | `test_product_not_found_raises_404`                 | Product không tồn tại hoặc `is_available=False` | Raise `HTTPException 404`, message chứa `"Product"`          |
| 4   | `test_variant_not_found_raises_404`                 | `variant_id` được truyền nhưng không tồn tại    | Raise `HTTPException 404`, message chứa `"Variant"`          |
| 5   | `test_insufficient_stock_raises_400`                | `quantity > product.stock_quantity`             | Raise `HTTPException 400`, message chứa số stock available   |
| 6   | `test_existing_item_updates_quantity`               | Item đã có trong cart → add thêm                | `existing_item.quantity` tăng lên, `db.add()` KHÔNG gọi thêm |
| 7   | `test_existing_item_exceeds_stock_raises_400`       | `existing.quantity + new_quantity > stock`      | Raise `HTTPException 400`                                    |
| 8   | `test_price_uses_product_sale_price_when_available` | Product có `sale_price`, không có variant       | `cart_item.price == product.sale_price`                      |

---

### `TestUpdateCartItem` (4 cases)

| #   | Test Case                                     | Mô tả                                       | Expected                                                            |
| --- | --------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| 1   | `test_valid_update_returns_updated_cart`      | Item tồn tại, `quantity <= stock`           | `success=True`, `cart_item.quantity` được cập nhật                  |
| 2   | `test_item_not_found_raises_404`              | Item ID không tồn tại hoặc không thuộc user | Raise `HTTPException 404`, message chứa `"Cart item"`               |
| 3   | `test_quantity_exceeds_stock_raises_400`      | `quantity > available_stock`                | Raise `HTTPException 400`, message chứa số stock                    |
| 4   | `test_uses_variant_stock_when_variant_exists` | `cart_item.variant` có giá trị              | Dùng `variant.stock_quantity` (không phải `product.stock_quantity`) |

---

### `TestRemoveCartItem` (3 cases)

| #   | Test Case                                        | Mô tả                                    | Expected                                                                |
| --- | ------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------- |
| 1   | `test_remove_existing_item_returns_updated_cart` | Item tồn tại                             | `db.delete(cart_item)` được gọi, `db.commit()` được gọi, `success=True` |
| 2   | `test_item_not_found_raises_404`                 | Item không tồn tại hoặc không thuộc user | Raise `HTTPException 404`                                               |
| 3   | `test_message_is_correct`                        | Remove thành công                        | `message == "Item removed from cart"`                                   |

---

### `TestClearCart` (3 cases)

| #   | Test Case                                     | Mô tả              | Expected                                                                                 |
| --- | --------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| 1   | `test_clear_existing_cart_bulk_deletes_items` | Cart tồn tại       | `db.query(CartItem).filter(...).delete()` được gọi (bulk delete), `db.commit()` được gọi |
| 2   | `test_cart_not_found_raises_404`              | User không có cart | Raise `HTTPException 404`                                                                |
| 3   | `test_returns_empty_cart_after_clear`         | Clear thành công   | `data.items == []`, `message == "Cart cleared"`                                          |

---

## ROUTER LAYER — `test_cart_router.py`

> Tất cả endpoints dùng `get_current_user` → `client` override `get_current_user`.
> `public_client` không override → trả về 401.

### `TestGetCartEndpoint` (2 cases)

| #   | Test Case                         | Mô tả               | Expected                                                |
| --- | --------------------------------- | ------------------- | ------------------------------------------------------- |
| 1   | `test_returns_200_with_cart_data` | `GET /cart` có auth | `200`, body có `data.id`, `data.items`, `data.subtotal` |
| 2   | `test_without_auth_returns_401`   | Không có token      | `401`                                                   |

---

### `TestAddToCartEndpoint` (5 cases)

| #   | Test Case                             | Mô tả                         | Expected                                                             |
| --- | ------------------------------------- | ----------------------------- | -------------------------------------------------------------------- |
| 1   | `test_valid_payload_returns_201`      | `POST /cart/items` hợp lệ     | `201`, service nhận đúng `current_user.id`, `product_id`, `quantity` |
| 2   | `test_missing_product_id_returns_422` | Thiếu `product_id`            | `422`                                                                |
| 3   | `test_quantity_zero_returns_422`      | `quantity=0` (vi phạm `ge=1`) | `422`                                                                |
| 4   | `test_product_not_found_returns_404`  | Service raise 404             | `404`                                                                |
| 5   | `test_without_auth_returns_401`       | Không có token                | `401`                                                                |

---

### `TestUpdateCartItemEndpoint` (4 cases)

| #   | Test Case                         | Mô tả                         | Expected                                                  |
| --- | --------------------------------- | ----------------------------- | --------------------------------------------------------- |
| 1   | `test_valid_update_returns_200`   | `PUT /cart/items/{id}` hợp lệ | `200`, service nhận đúng `item_id`, `quantity`, `user_id` |
| 2   | `test_quantity_zero_returns_422`  | `quantity=0` (vi phạm `ge=1`) | `422`                                                     |
| 3   | `test_item_not_found_returns_404` | Service raise 404             | `404`                                                     |
| 4   | `test_without_auth_returns_401`   | Không có token                | `401`                                                     |

---

### `TestRemoveCartItemEndpoint` (3 cases)

| #   | Test Case                            | Mô tả                            | Expected                                        |
| --- | ------------------------------------ | -------------------------------- | ----------------------------------------------- |
| 1   | `test_returns_200_with_updated_cart` | `DELETE /cart/items/{id}` hợp lệ | `200`, service nhận đúng `item_id` và `user_id` |
| 2   | `test_item_not_found_returns_404`    | Service raise 404                | `404`                                           |
| 3   | `test_without_auth_returns_401`      | Không có token                   | `401`                                           |

---

### `TestClearCartEndpoint` (3 cases)

| #   | Test Case                          | Mô tả                 | Expected                           |
| --- | ---------------------------------- | --------------------- | ---------------------------------- |
| 1   | `test_returns_200_with_empty_cart` | `DELETE /cart` hợp lệ | `200`, service nhận đúng `user_id` |
| 2   | `test_cart_not_found_returns_404`  | Service raise 404     | `404`                              |
| 3   | `test_without_auth_returns_401`    | Không có token        | `401`                              |
