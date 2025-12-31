import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductVariant
from app.utils.responses import ResponseHandler


class CartService:
    # mapping
    @staticmethod
    def _format_cart(cart: Cart):
        """Format cart response"""

        items_data = []
        subtotal = Decimal('0.00')

        for item in cart.items:
            # Get primary image
            primary_image = next(
                (img.image_url for img in item.product.images if img.is_primary),
                item.product.images[0].image_url if item.product.images else None
            )

            item_subtotal = item.price * item.quantity
            subtotal += item_subtotal

            items_data.append({
                "id": item.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "price": float(item.price),
                "product_name": item.product.name,
                "product_slug": item.product.slug,
                "product_image": primary_image,
                "variant_name": item.variant.name if item.variant else None,
                "subtotal": float(item_subtotal),
                "created_at": item.created_at,
                "updated_at": item.updated_at
            })

        return {
            "id": cart.id,
            "user_id": cart.user_id,
            "items": items_data,
            "total_items": len(items_data),
            "subtotal": float(subtotal),
            "created_at": cart.created_at,
            "updated_at": cart.updated_at
        }

    @staticmethod
    def get_or_create_cart(db: Session, user_id: str):
        """Get or create cart for user"""
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()

        if not cart:
            cart = Cart(
                id=str(uuid.uuid4()),
                user_id=user_id,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(cart)
            db.commit()
            db.refresh(cart)

        return cart

    @staticmethod
    def get_cart(db: Session, user_id: str):
        """Get user's cart with items"""
        cart = db.query(Cart).options(
            joinedload(Cart.items).joinedload(CartItem.product),
            joinedload(Cart.items).joinedload(CartItem.variant),
        ).filter(Cart.user_id == user_id).first()

        if not cart:
            # Create empty cart
            cart = CartService.get_or_create_cart(db, user_id)

        # Format response
        cart_data = CartService._format_cart(cart)

        return ResponseHandler.success(
            message="Cart retrieved successfully!",
            data=cart_data
        )

    @staticmethod
    def add_to_cart(db: Session, user_id: str, product_id: str, variant_id: str = None, quantity: int = 1):
        """Add item to cart"""

        # Get or create cart
        cart = CartService.get_or_create_cart(db, user_id)

        # Verify product exists
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.deleted_at.is_(None),
            Product.is_available == True
        ).first()

        if not product:
            ResponseHandler.not_found_error("Product", product_id)

        # If variant specified, verify it exists
        variant = None
        if variant_id:
            variant = db.query(ProductVariant).filter(
                ProductVariant.id == variant_id,
                ProductVariant.product_id == product_id,
                ProductVariant.deleted_at.is_(None)
            ).first()

            if not variant:
                ResponseHandler.not_found_error("Variant", variant_id)

        # Check stock
        available_stock = variant.stock_quantity if variant else product.stock_quantity
        if available_stock < quantity:
            ResponseHandler.bad_request(
                f"Only {available_stock} items available in stock")

        # Check if item already in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
            CartItem.variant_id == variant_id
        ).with_for_update().first()

        if existing_item:
            # Update quantity
            new_quantity = existing_item.quantity + quantity

            if new_quantity > available_stock:
                ResponseHandler.bad_request(
                    f"Cannot add {quantity} more. Only {available_stock - existing_item.quantity} items available")

            existing_item.quantity = new_quantity
            existing_item.updated_at = datetime.now(timezone.utc)

            db.commit()
            db.refresh(existing_item)
        else:
            # Add new item
            price = variant.sale_price if variant and variant.sale_price else variant.price if variant else product.sale_price if product.sale_price else product.price

            cart_item = CartItem(
                id=str(uuid.uuid4()),
                cart_id=cart.id,
                product_id=product_id,
                variant_id=variant_id,
                quantity=quantity,
                price=price,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )

            db.add(cart_item)
            db.commit()
            db.refresh(cart_item)

        message = "Item added to cart"

        # Get updated cart
        db.refresh(cart)
        cart_data = CartService._format_cart(cart)
        return ResponseHandler.success(message=message, data=cart_data)

    @staticmethod
    def update_cart_item(db: Session, user_id: str, item_id: str, quantity: int):
        """Update cart item quantity"""

        # Get cart item
        cart_item = db.query(CartItem).join(Cart).filter(
            CartItem.id == item_id,
            Cart.user_id == user_id
        ).first()

        if not cart_item:
            ResponseHandler.not_found_error("Cart item", item_id)

        # Check stock
        if cart_item.variant:
            available_stock = cart_item.variant.stock_quantity
        else:
            available_stock = cart_item.product.stock_quantity

        if quantity > available_stock:
            ResponseHandler.bad_request(
                f"Only {available_stock} items available in stock")

        # Update quantity
        cart_item.quantity = quantity
        cart_item.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(cart_item)

        # Get updated cart
        cart = cart_item.cart
        db.refresh(cart)
        cart_data = CartService._format_cart(cart)

        return ResponseHandler.success(
            message="Cart item updated",
            data=cart_data
        )

    @staticmethod
    def remove_cart_item(db: Session, user_id: str, item_id: str):
        """Remove item from cart"""
        # Get cart item
        cart_item = db.query(CartItem).join(Cart).filter(
            CartItem.id == item_id,
            Cart.user_id == user_id
        ).first()

        if not cart_item:
            ResponseHandler.not_found_error("Cart item", item_id)

        cart = cart_item.cart
        # Delete item
        db.delete(cart_item)
        db.commit()

        # Get updated cart
        db.refresh(cart)
        cart_data = CartService._format_cart(cart)

        return ResponseHandler.success(
            message="Item removed from cart",
            data=cart_data
        )

    @staticmethod
    def clear_cart(db: Session, user_id: str):
        """Clear all items from cart"""

        cart = db.query(Cart).filter(Cart.user_id == user_id).first()

        if not cart:
            ResponseHandler.not_found_error("Cart", user_id)

        # Delete all items
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()

        db.refresh(cart)
        cart_data = CartService._format_cart(cart)

        return ResponseHandler.success(
            message="Cart cleared",
            data=cart_data
        )
