from app.models.product import Product
from app.elastic.config import es_client, PRODUCT_INDEX


def product_to_doc(p: Product):
    """Convert SQLAlchemy Model -> ES Dict"""
    return {
        "id": str(p.id),
        "name": p.name,
        "slug": p.slug,
        "price": float(p.price),
        "stock_quantity": p.stock_quantity,
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
        es_client.index(index=PRODUCT_INDEX, id=str(product.id), document=doc)
    except Exception as e:
        print(f"Indexing failed: {e}")


def delete_product(product_id: str):
    """Delete a product"""
    try:
        es_client.delete(index=PRODUCT_INDEX, id=product_id)
        print(f"Deleted: {product_id}")
    except Exception:
        pass


def search_products_query(keyword, min_price, max_price, limit, page):
    """Logic Query DSL"""
    query_conditions = []

    if keyword:
        query_conditions.append({
            "multi_match": {
                "query": keyword,
                "fields": ["name^3", "brand_name^2", "category_name", "concerns", "skin_types", "tags", "description"],
                "fuzziness": "AUTO",
                "operator": "and"
            }
        })

    filter_conditions = [{"term": {"is_available": True}}]
    if min_price:
        filter_conditions.append({"range": {"price": {"gte": min_price}}})
    if max_price:
        filter_conditions.append({"range": {"price": {"lte": max_price}}})

    body = {
        "from": (page - 1) * limit,
        "size": limit,
        "query": {
            "bool": {
                "must": query_conditions if query_conditions else {"match_all": {}},
                "filter": filter_conditions
            }
        }
    }

    return es_client.search(index=PRODUCT_INDEX, body=body)
