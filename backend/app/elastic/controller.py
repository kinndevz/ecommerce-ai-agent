from sqlalchemy import event
from sqlalchemy.orm import joinedload
from app.db.database import SessionLocal
from app.models.product import Product
from app.elastic.config import create_product_index, reset_product_index
from app.elastic.service import index_product, delete_product, product_to_doc


def sync_all_products():
    """Synchronize all products from Database to Elasticsearch (Runs on app startup)."""
    try:
        reset_product_index()
    except Exception as e:
        print(f"[Elastic Error] Could not reset index: {e}")
        return

    db = SessionLocal()
    try:
        print("Checking data sync...")
        products = db.query(Product).options(
            joinedload(Product.brand),
            joinedload(Product.category),
            joinedload(Product.tags),
            joinedload(Product.images)
        ).all()

        count = 0
        for p in products:
            index_product(p)
            count += 1

        print(f"Full sync completed: {count} products")
    except Exception as e:
        print(f"Sync warning: {e}")
    finally:
        db.close()


def register_es_events():
    """Register SQLAlchemy event listeners for real-time Elasticsearch synchronization."""

    @event.listens_for(Product, 'after_insert')
    def after_insert(mapper, connection, target):
        index_product(target)

    @event.listens_for(Product, 'after_update')
    def after_update(mapper, connection, target):
        index_product(target)

    @event.listens_for(Product, 'after_delete')
    def after_delete(mapper, connection, target):
        delete_product(str(target.id))

    print("Real-time sync listener active")


async def init_elasticsearch():
    """Main initialization function to be called within the application lifespan."""
    create_product_index()
    sync_all_products()
    register_es_events()
