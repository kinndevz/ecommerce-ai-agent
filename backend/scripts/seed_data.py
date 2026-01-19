import json
import sys
import os
import uuid
from decimal import Decimal
import logging
import random
from pathlib import Path
from app.models.product import Product, ProductImage, ProductVariant, Tag
from app.models.category import Category
from app.models.brand import Brand
from app.db.database import SessionLocal
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# Constants
DATA_FILE = Path(__file__).parent / "data.json"


def now():
    return datetime.now(timezone.utc)


def load_data(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[ERROR] Data file not found at: {filename}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON format: {str(e)}")
        sys.exit(1)


def seed_brands(db, brands_data):
    print("--------------------------------------------------")
    print("[INFO] Seeding Brands...")

    brands = []
    for data in brands_data:
        existing = db.query(Brand).filter(Brand.slug == data["slug"]).first()
        if not existing:
            brand = Brand(id=str(uuid.uuid4()), **data, is_active=True,
                          created_at=now(),
                          updated_at=now())
            db.add(brand)
            brands.append(brand)
        else:
            brands.append(existing)

    db.commit()
    return brands


def seed_categories(db, categories_data):
    print("--------------------------------------------------")
    print("[INFO] Seeding Categories...")

    # 1. Seed Parents
    parents_data = categories_data["parents"]
    parent_map = {}

    for i, data in enumerate(parents_data):
        existing = db.query(Category).filter(
            Category.slug == data["slug"]).first()
        if not existing:
            cat = Category(id=str(uuid.uuid4()),
                           **data,
                           display_order=i,
                           is_active=True,
                           created_at=now(),
                           updated_at=now())
            db.add(cat)
            db.flush()
            parent_map[data["slug"]] = cat
        else:
            parent_map[data["slug"]] = existing

    # 2. Seed Children
    children_data = categories_data["children"]
    categories = []

    for i, data in enumerate(children_data):
        # Create a copy to not modify the original data structure
        child_data = data.copy()
        p_slug = child_data.pop("parent")

        existing = db.query(Category).filter(
            Category.slug == child_data["slug"]).first()
        if not existing:
            if p_slug in parent_map:
                cat = Category(
                    id=str(uuid.uuid4()),
                    **child_data,
                    parent_id=parent_map[p_slug].id,
                    display_order=i,
                    is_active=True,
                    created_at=now(),
                    updated_at=now()
                )
                db.add(cat)
                categories.append(cat)
            else:
                print(
                    f"[WARN] Parent category '{p_slug}' not found for '{child_data['slug']}'")
        else:
            categories.append(existing)

    db.commit()
    return categories


def seed_tags(db, tags_data):
    print("--------------------------------------------------")
    print("[INFO] Seeding Tags...")

    tags = []
    for data in tags_data:
        existing = db.query(Tag).filter(Tag.slug == data["slug"]).first()
        if not existing:
            t = Tag(id=str(uuid.uuid4()),
                    **data,
                    created_at=now(),
                    updated_at=now())
            db.add(t)
            tags.append(t)
        else:
            tags.append(existing)

    db.commit()
    return tags


def seed_products(db, brands, categories, tags, products_data):
    print("--------------------------------------------------")
    print("[INFO] Seeding Products...")

    # Create lookup maps for FK relationships
    brand_map = {b.slug: b for b in brands}
    cat_map = {c.slug: c for c in categories}
    tag_map = {t.slug: t for t in tags}

    products = []
    for p_data in products_data:
        # Create a copy to verify popping doesn't ruin re-runs
        item = p_data.copy()

        b_slug = item.pop("brand")
        c_slug = item.pop("category")
        t_slugs = item.pop("tags", [])

        # Validation
        if c_slug not in cat_map:
            print(
                f"[WARN] Skip {item['name']}: Category '{c_slug}' not found.")
            continue
        if b_slug not in brand_map:
            print(f"[WARN] Skip {item['name']}: Brand '{b_slug}' not found.")
            continue

        existing = db.query(Product).filter(
            Product.slug == item["slug"]).first()
        if existing:
            products.append(existing)
            continue

        # Create product
        product = Product(
            id=str(uuid.uuid4()),
            brand_id=brand_map[b_slug].id,
            category_id=cat_map[c_slug].id,
            name=item["name"],
            slug=item["slug"],
            sku=item["sku"],
            short_description=item["desc"][:150],
            description=item["desc"],
            how_to_use="Apply as directed on packaging.",
            price=Decimal(item["price"]),
            stock_quantity=item["stock"],
            is_available=True,
            is_featured=random.choice([True, False]),
            rating_average=Decimal(str(random.uniform(4.0, 5.0))[:3]),
            review_count=random.randint(50, 5000),
            skin_types=item["skin_types"],
            concerns=item["concerns"],
            benefits=item["benefits"],
            ingredients=item["ingredients"],
            created_at=now(),
            updated_at=now()
        )

        # Associate Tags
        for ts in t_slugs:
            if ts in tag_map:
                product.tags.append(tag_map[ts])

        db.add(product)
        products.append(product)

    db.commit()
    print(f"[INFO] Successfully created {len(products)} products.")
    return products


def seed_images_and_variants(db, products):
    print("--------------------------------------------------")
    print("[INFO] Seeding Images & Variants...")

    for p in products:
        # 1. Generate Placeholder Images
        if not db.query(ProductImage).filter(ProductImage.product_id == p.id).first():
            color = random.choice(["4A90E2", "E24A4A", "4AE265", "E2BC4A"])
            img1 = ProductImage(
                id=str(uuid.uuid4()), product_id=p.id, is_primary=True, display_order=0,
                image_url=f"https://via.placeholder.com/800/{color}/FFFFFF?text={p.slug}",
                alt_text=f"{p.name} Primary"
            )
            img2 = ProductImage(
                id=str(uuid.uuid4()), product_id=p.id, is_primary=False, display_order=1,
                image_url=f"https://via.placeholder.com/800/{color}/FFFFFF?text={p.slug}-texture",
                alt_text=f"{p.name} Texture"
            )
            db.add(img1)
            db.add(img2)

        # 2. Generate Variants based on product type
        if not db.query(ProductVariant).filter(ProductVariant.product_id == p.id).first():
            v1 = ProductVariant(
                id=str(uuid.uuid4()), product_id=p.id,
                name=f"{p.name} 30ml", sku=f"{p.sku}-30",
                price=p.price, size="30", size_unit="ml",
                stock_quantity=100, is_available=True
            )
            v2 = ProductVariant(
                id=str(uuid.uuid4()), product_id=p.id,
                name=f"{p.name} 50ml", sku=f"{p.sku}-50",
                price=p.price * Decimal("1.5"), size="50", size_unit="ml",
                stock_quantity=50, is_available=True
            )
            db.add(v1)
            db.add(v2)
        elif "cleanser" in p.slug or "toner" in p.slug:
            v1 = ProductVariant(
                id=str(uuid.uuid4()), product_id=p.id,
                name=f"{p.name} 150ml", sku=f"{p.sku}-150",
                price=p.price, size="150", size_unit="ml",
                stock_quantity=100, is_available=True
            )
            db.add(v1)

    db.commit()
    print("[INFO] Images & Variants creation completed.")


def main():
    print("==================================================")
    print("           SEED DATA INITIALIZATION")
    print("==================================================")

    # 1. Load data from JSON
    seed_data = load_data(DATA_FILE)

    db = SessionLocal()
    try:
        # 2. Pass loaded data to functions
        brands = seed_brands(db, seed_data["brands"])
        categories = seed_categories(db, seed_data["categories"])
        tags = seed_tags(db, seed_data["tags"])

        products = seed_products(
            db, brands, categories, tags, seed_data["products"])

        # Variants logic remains in python
        seed_images_and_variants(db, products)

        print("\n[SUCCESS] All data has been seeded successfully!")
    except Exception as e:
        print(f"\n[ERROR] Seeding failed: {str(e)}")
        db.rollback()
    finally:
        db.close()
        print("==================================================")


if __name__ == "__main__":
    main()
