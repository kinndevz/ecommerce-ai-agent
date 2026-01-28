from typing import Iterable, List, Optional

from app.models.product import Product
from app.elastic.config import es_client, PRODUCT_INDEX


def product_to_doc(p: Product):
    """Convert SQLAlchemy Model -> ES Dict"""

    primary_image_url = ""
    if p.images:
        primary_img = next((img for img in p.images if img.is_primary), None)
        if primary_img:
            primary_image_url = primary_img.image_url
        else:
            primary_image_url = p.images[0].image_url

    return {
        "id": str(p.id),
        "name": p.name,
        "slug": p.slug,
        "price": float(p.price),
        "stock_quantity": p.stock_quantity,
        "product_image": primary_image_url,
        "is_available": p.is_available,
        "brand_name": p.brand.name if p.brand else "",
        "category_name": p.category.name if p.category else "",
        "concerns": p.concerns if p.concerns else [],
        "skin_types": p.skin_types if p.skin_types else [],
        "benefits": p.benefits if p.benefits else [],
        "tags": [t.name for t in p.tags] if p.tags else [],
        "description": p.description,
        "rating_average": float(p.rating_average) if p.rating_average else 0
    }


def index_product(product: Product):
    """Upsert a product"""
    try:
        doc = product_to_doc(product)
        es_client.index(index=PRODUCT_INDEX, id=str(product.id), body=doc)
    except Exception as e:
        print(f"Indexing failed: {e}")


def delete_product(product_id: str):
    """Delete a product"""
    try:
        es_client.delete(index=PRODUCT_INDEX, id=product_id)
        print(f"Deleted: {product_id}")
    except Exception:
        pass


def search_products_query(
    keyword,
    min_price,
    max_price,
    limit,
    page,
    brand: Optional[Iterable[str]] = None,
    category: Optional[Iterable[str]] = None,
    skin_types: Optional[Iterable[str]] = None,
    concerns: Optional[Iterable[str]] = None,
    benefits: Optional[Iterable[str]] = None,
    tags: Optional[Iterable[str]] = None,
    is_available: Optional[bool] = True
):
    """Logic Query DSL"""
    query_conditions = []

    if keyword:
        query_conditions.append({
            "multi_match": {
                "query": keyword,
                "fields": [
                    "name^3",
                    "brand_name^2",
                    "category_name^2",
                    "concerns",
                    "skin_types",
                    "benefits",
                    "tags",
                    "description"
                ],
                "fuzziness": "AUTO",
                "operator": "and"
            }
        })

    filter_conditions = []
    if is_available is not None:
        filter_conditions.append({"term": {"is_available": is_available}})

    if min_price is not None:
        filter_conditions.append({"range": {"price": {"gte": min_price}}})
    if max_price is not None:
        filter_conditions.append({"range": {"price": {"lte": max_price}}})

    brand_values = _normalize_list(brand)
    if brand_values:
        filter_conditions.append(_build_terms_filter("brand_name.keyword", brand_values))

    category_values = _normalize_list(category)
    if category_values:
        filter_conditions.append(_build_terms_filter("category_name.keyword", category_values))

    skin_type_values = _normalize_list(skin_types)
    if skin_type_values:
        filter_conditions.append(_build_terms_filter("skin_types", skin_type_values))

    concern_values = _normalize_list(concerns)
    if concern_values:
        filter_conditions.append(_build_terms_filter("concerns.keyword", concern_values))

    benefit_values = _normalize_list(benefits)
    if benefit_values:
        filter_conditions.append(_build_terms_filter("benefits.keyword", benefit_values))

    tag_values = _normalize_list(tags)
    if tag_values:
        filter_conditions.append(_build_terms_filter("tags.keyword", tag_values))

    body = {
        "from": (page - 1) * limit,
        "size": limit,
        "query": {
            "bool": {
                "must": query_conditions if query_conditions else [{"match_all": {}}],
                "filter": filter_conditions or []
            }
        }
    }

    return es_client.search(index=PRODUCT_INDEX, body=body)


def _normalize_list(values: Optional[Iterable[str]]) -> List[str]:
    if not values:
        return []

    if isinstance(values, str):
        items = [item for item in values.split(",") if item]
    else:
        items = list(values)

    cleaned: List[str] = []
    for item in items:
        if item is None:
            continue
        value = str(item).strip().lower()
        if value:
            cleaned.append(value)
    return cleaned


def _build_terms_filter(field: str, values: List[str]) -> dict:
    if len(values) == 1:
        return {"term": {field: values[0]}}
    return {"terms": {field: values}}
