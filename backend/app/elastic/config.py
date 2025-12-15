from elasticsearch import Elasticsearch
import urllib3
from app.core.config import settings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ELASTIC_PASSWORD = settings.ELASTIC_PASSWORD
ELASTIC_ACCOUNT = settings.ELASTIC_ACCOUNT
ELASTIC_URL = settings.ELASTIC_URL
PRODUCT_INDEX = settings.PRODUCT_DOCUMENT_INDEX

es_client = Elasticsearch(
    ELASTIC_URL,
    basic_auth=(ELASTIC_ACCOUNT, ELASTIC_PASSWORD),
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
                "mappings": {
                    "properties": {
                        "id": {"type": "keyword"},
                        "name": {"type": "text", "analyzer": "standard"},
                        "slug": {"type": "keyword"},
                        "price": {"type": "double"},
                        "stock_quantity": {"type": "integer"},
                        "is_available": {"type": "boolean"},
                        "brand_name": {"type": "text"},
                        "category_name": {"type": "text"},
                        "concerns": {"type": "text"},
                        "skin_types": {"type": "keyword"},
                        "benefits": {"type": "text"},
                        "tags": {"type": "text"},
                        "description": {"type": "text"},
                        "rating_average": {"type": "float"}
                    }
                }
            }
        )
