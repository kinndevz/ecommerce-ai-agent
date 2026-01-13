from app.utils.serializers import model_to_dict


def format_brand(brand):
    """Format brand data"""
    return {
        "id": brand.id,
        "name": brand.name,
        "slug": brand.slug
    }


def format_category(category):
    """Format category data"""
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug
    }


def format_tag(tag):
    """Format tag data"""
    return {
        "id": tag.id,
        "name": tag.name,
        "slug": tag.slug
    }


def format_product_image(image):
    """Format product image"""
    return {
        **model_to_dict(image, exclude=[])
    }


def format_product_variant(variant):
    """Format product variant"""
    return {
        **model_to_dict(
            variant,
            exclude=['deleted_at', 'created_by_id',
                     'updated_by_id', 'deleted_by_id', 'product_id']
        )
    }


def format_product_list_item(product):
    """Format product for list view"""
    primary_image = None
    if product.images:
        primary = next((img for img in product.images if img.is_primary), None)
        primary_image = primary.image_url if primary else product.images[0].image_url

    return {
        **model_to_dict(
            product,
            exclude=['deleted_at', 'created_by_id', 'updated_by_id', 'deleted_by_id',
                     'description', 'how_to_use', 'ingredients',
                     'brand_id', 'category_id']
        ),
        "brand": format_brand(product.brand),
        "category": format_category(product.category),
        "product_image": primary_image,
        "tags": [format_tag(tag) for tag in product.tags]
    }


def format_product_detail(product):
    """Format product for detail view"""
    sorted_images = sorted(
        product.images,
        key=lambda x: (not x.is_primary, x.display_order)
    )

    return {
        **model_to_dict(
            product,
            exclude=['deleted_at', 'created_by_id',
                     'updated_by_id', 'deleted_by_id']
        ),
        "brand": format_brand(product.brand),
        "category": format_category(product.category),
        "images": [format_product_image(img) for img in sorted_images],
        "variants": [format_product_variant(var) for var in product.variants],
        "tags": [format_tag(tag) for tag in product.tags]
    }
