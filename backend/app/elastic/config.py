# from elasticsearch import Elasticsearch
import urllib3
from app.core.config import settings
from opensearchpy import OpenSearch as Elasticsearch
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ELASTIC_PASSWORD = settings.ELASTIC_PASSWORD
ELASTIC_ACCOUNT = settings.ELASTIC_ACCOUNT
ELASTIC_URL = settings.ELASTIC_URL
PRODUCT_INDEX = settings.PRODUCT_DOCUMENT_INDEX

es_client = Elasticsearch(
    hosts=[ELASTIC_URL],
    http_auth=(ELASTIC_ACCOUNT, ELASTIC_PASSWORD),
    use_ssl=True,
    verify_certs=False,
    ssl_show_warn=False
)


# Create product index
def create_product_index():
    """create index mapping if not exist"""
    if not es_client.indices.exists(index=PRODUCT_INDEX):
        es_client.indices.create(
            index=PRODUCT_INDEX,
            body={
                "settings": {
                    "analysis": {
                        "normalizer": {
                            "lowercase_normalizer": {
                                "type": "custom",
                                "filter": ["lowercase"]
                            }
                        }
                    }
                },
                "mappings": {
                    "properties": {
                        "id": {"type": "keyword"},
                        "name": {
                            "type": "text",
                            "analyzer": "standard",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "slug": {"type": "keyword"},
                        "price": {"type": "double"},
                        "stock_quantity": {"type": "integer"},
                        "product_image": {"type": "text"},
                        "is_available": {"type": "boolean"},
                        "brand_name": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "category_name": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "concerns": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "skin_types": {
                            "type": "keyword",
                            "normalizer": "lowercase_normalizer"
                        },
                        "benefits": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "tags": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "description": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "normalizer": "lowercase_normalizer"
                                }
                            }
                        },
                        "rating_average": {"type": "float"}
                    }
                }
            }
        )


def reset_product_index():
    """Delete index if exists and recreate it (Clean slate)"""
    if es_client.indices.exists(index=PRODUCT_INDEX):
        es_client.indices.delete(index=PRODUCT_INDEX)
        print(f"[Elastic] Deleted old index: {PRODUCT_INDEX}")

    create_product_index()
    print(f"[Elastic] Created new index: {PRODUCT_INDEX}")
