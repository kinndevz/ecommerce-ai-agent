from app.models.product import Product, ProductImage, ProductVariant, Tag
from app.models.category import Category
from app.models.brand import Brand
from app.db.database import SessionLocal
import sys
import os
import uuid
from decimal import Decimal
import logging
import random

# Add project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def seed_brands(db):
    print("--------------------------------------------------")
    print("[INFO] Seeding Brands...")

    brands_data = [
        {"name": "CeraVe", "slug": "cerave", "country": "USA",
            "description": "Dermatologist-developed skincare.", "website_url": "https://cerave.com"},
        {"name": "The Ordinary", "slug": "the-ordinary", "country": "Canada",
            "description": "Clinical formulations with integrity.", "website_url": "https://theordinary.com"},
        {"name": "La Roche-Posay", "slug": "la-roche-posay", "country": "France",
            "description": "Life-changing dermatological skincare.", "website_url": "https://laroche-posay.com"},
        {"name": "Paula's Choice", "slug": "paulas-choice", "country": "USA",
            "description": "Smart, safe, effective skincare.", "website_url": "https://paulaschoice.com"},
        {"name": "COSRX", "slug": "cosrx", "country": "South Korea",
            "description": "Expecting Tomorrow.", "website_url": "https://cosrx.com"},
        {"name": "Skin1004", "slug": "skin1004", "country": "South Korea",
            "description": "Untouched Nature.", "website_url": "https://skin1004.com"},
        {"name": "Klairs", "slug": "klairs", "country": "South Korea",
            "description": "Simple but enough.", "website_url": "https://klairscosmetics.com"},
        {"name": "Bioderma", "slug": "bioderma", "country": "France",
            "description": "Biology at the service of dermatology.", "website_url": "https://bioderma.com"},
        {"name": "Obagi", "slug": "obagi", "country": "USA",
            "description": "Medical-grade skincare.", "website_url": "https://obagi.com"},
        {"name": "Vichy", "slug": "vichy", "country": "France",
            "description": "Health is vital. Start with your skin.", "website_url": "https://vichy.com"},
    ]

    brands = []
    for data in brands_data:
        # Check if brand already exists to avoid duplicates
        existing = db.query(Brand).filter(Brand.slug == data["slug"]).first()
        if not existing:
            brand = Brand(id=str(uuid.uuid4()), **data, is_active=True)
            db.add(brand)
            brands.append(brand)
        else:
            brands.append(existing)

    db.commit()
    return brands


def seed_categories(db):
    print("--------------------------------------------------")
    print("[INFO] Seeding Categories...")

    # Define Parent Categories
    parents_data = [
        {"name": "Skincare", "slug": "skincare"},
        {"name": "Body Care", "slug": "body-care"},
    ]

    parent_map = {}
    for i, data in enumerate(parents_data):
        existing = db.query(Category).filter(
            Category.slug == data["slug"]).first()
        if not existing:
            cat = Category(id=str(uuid.uuid4()), **data,
                           display_order=i, is_active=True)
            db.add(cat)
            db.flush()  # Flush to generate ID for children
            parent_map[data["slug"]] = cat
        else:
            parent_map[data["slug"]] = existing

    # Define Child Categories
    children_data = [
        {"name": "Cleansers", "slug": "cleansers", "parent": "skincare"},
        {"name": "Toners", "slug": "toners", "parent": "skincare"},
        {"name": "Serums", "slug": "serums", "parent": "skincare"},
        {"name": "Moisturizers", "slug": "moisturizers", "parent": "skincare"},
        {"name": "Sunscreens", "slug": "sunscreens", "parent": "skincare"},
        {"name": "Exfoliators", "slug": "exfoliators", "parent": "skincare"},
        {"name": "Masks", "slug": "masks", "parent": "skincare"},
    ]

    categories = []
    for i, data in enumerate(children_data):
        p_slug = data.pop("parent")
        existing = db.query(Category).filter(
            Category.slug == data["slug"]).first()
        if not existing:
            cat = Category(
                id=str(uuid.uuid4()),
                **data,
                parent_id=parent_map[p_slug].id,
                display_order=i,
                is_active=True
            )
            db.add(cat)
            categories.append(cat)
        else:
            categories.append(existing)

    db.commit()
    return categories


def seed_tags(db):
    print("--------------------------------------------------")
    print("[INFO] Seeding Tags...")

    tags_data = [
        {"name": "Vegan", "slug": "vegan"},
        {"name": "Cruelty-Free", "slug": "cruelty-free"},
        {"name": "Alcohol-Free", "slug": "alcohol-free"},
        {"name": "Fragrance-Free", "slug": "fragrance-free"},
        {"name": "Paraben-Free", "slug": "paraben-free"},
        {"name": "Best Seller", "slug": "best-seller"},
        {"name": "New Arrival", "slug": "new-arrival"},
    ]

    tags = []
    for data in tags_data:
        existing = db.query(Tag).filter(Tag.slug == data["slug"]).first()
        if not existing:
            t = Tag(id=str(uuid.uuid4()), **data)
            db.add(t)
            tags.append(t)
        else:
            tags.append(existing)

    db.commit()
    return tags


def seed_products(db, brands, categories, tags):
    print("--------------------------------------------------")
    print("[INFO] Seeding Products...")

    # Create lookup maps for FK relationships
    brand_map = {b.slug: b for b in brands}
    cat_map = {c.slug: c for c in categories}
    tag_map = {t.slug: t for t in tags}

    # Sample product data
    products_data = [
        # 1. CeraVe Cleanser
        {
            "brand": "cerave", "category": "cleansers",
            "name": "CeraVe Hydrating Facial Cleanser", "slug": "cerave-hydrating-cleanser",
            "sku": "CERAVE-HC-001", "price": "16.99", "stock": 100,
            "desc": "A gentle face wash with ceramides and hyaluronic acid that cleanses without disrupting the skin barrier.",
            "skin_types": ["normal", "dry", "sensitive"],
            "concerns": ["dryness", "sensitivity"],
            "benefits": ["moisturizing", "gentle cleansing", "barrier repair"],
            "tags": ["fragrance-free", "best-seller"],
            "ingredients": {"key": ["Ceramides", "Hyaluronic Acid"], "full": ["Water", "Glycerin", "Cetearyl Alcohol"]}
        },
        # 2. Paula's Choice BHA
        {
            "brand": "paulas-choice", "category": "exfoliators",
            "name": "Skin Perfecting 2% BHA Liquid Exfoliant", "slug": "paulas-choice-2-bha",
            "sku": "PC-BHA-02", "price": "34.00", "stock": 50,
            "desc": "The cult-favorite daily leave-on exfoliant with salicylic acid to unclog pores and smooth wrinkles.",
            "skin_types": ["oily", "combination", "acne-prone"],
            "concerns": ["acne", "blackheads", "large pores", "texture"],
            "benefits": ["exfoliating", "pore clearing", "smoothing"],
            "tags": ["cruelty-free", "best-seller"],
            "ingredients": {"key": ["Salicylic Acid 2%", "Green Tea"], "full": ["Water", "Methylpropanediol", "Salicylic Acid"]}
        },
        # 3. La Roche-Posay Sunscreen
        {
            "brand": "la-roche-posay", "category": "sunscreens",
            "name": "Anthelios Melt-in Milk Sunscreen SPF 60", "slug": "lrp-anthelios-spf60",
            "sku": "LRP-SUN-60", "price": "36.99", "stock": 80,
            "desc": "Broad spectrum SPF 60 protection. Oxybenzone-free and suitable for face and body.",
            "skin_types": ["all", "sensitive"],
            "concerns": ["sun damage", "aging"],
            "benefits": ["sun protection", "water resistant"],
            "tags": ["paraben-free", "fragrance-free"],
            "ingredients": {"key": ["Cell-Ox Shield", "Thermal Spring Water"], "full": ["Water", "Styrene/Acrylates Copolymer"]}
        },
        # 4. The Ordinary Niacinamide
        {
            "brand": "the-ordinary", "category": "serums",
            "name": "Niacinamide 10% + Zinc 1%", "slug": "to-niacinamide",
            "sku": "TO-NIA-10", "price": "6.00", "stock": 200,
            "desc": "A high-strength vitamin and mineral blemish formula to reduce skin congestion.",
            "skin_types": ["oily", "combination"],
            "concerns": ["acne", "oiliness", "enlarged pores"],
            "benefits": ["oil control", "brightening"],
            "tags": ["vegan", "alcohol-free", "best-seller"],
            "ingredients": {"key": ["Niacinamide", "Zinc PCA"], "full": ["Aqua", "Niacinamide", "Zinc PCA"]}
        },
        # 5. Skin1004 Centella Ampoule
        {
            "brand": "skin1004", "category": "serums",
            "name": "Madagascar Centella Ampoule", "slug": "skin1004-centella-ampoule",
            "sku": "SKIN1004-CA", "price": "18.00", "stock": 120,
            "desc": "Made with 100% Centella Asiatica Extract to calm and repair damaged skin.",
            "skin_types": ["sensitive", "acne-prone", "all"],
            "concerns": ["redness", "irritation", "sensitivity"],
            "benefits": ["calming", "soothing", "hydrating"],
            "tags": ["cruelty-free", "vegan"],
            "ingredients": {"key": ["Centella Asiatica Extract 100%"], "full": ["Centella Asiatica Extract"]}
        },
        # 6. Klairs Toner
        {
            "brand": "klairs", "category": "toners",
            "name": "Supple Preparation Unscented Toner", "slug": "klairs-unscented-toner",
            "sku": "KLAIRS-TONER-U", "price": "22.00", "stock": 90,
            "desc": "A non-irritating toner that rejuvenates and restores hydration to the skin.",
            "skin_types": ["sensitive", "normal", "dry"],
            "concerns": ["dehydration", "sensitivity"],
            "benefits": ["hydrating", "balancing"],
            "tags": ["vegan", "alcohol-free", "fragrance-free"],
            "ingredients": {"key": ["Sodium Hyaluronate", "Centella Asiatica"], "full": ["Water", "Butylene Glycol"]}
        },
        # 7. COSRX Snail Mucin
        {
            "brand": "cosrx", "category": "serums",
            "name": "Advanced Snail 96 Mucin Power Essence", "slug": "cosrx-snail-96",
            "sku": "COSRX-SN-96", "price": "25.00", "stock": 150,
            "desc": "Lightweight essence which absorbs into skin fast to give skin natural glow from inside.",
            "skin_types": ["dry", "dehydrated", "aging"],
            "concerns": ["dullness", "dehydration", "dark spots"],
            "benefits": ["hydrating", "repairing", "glowing"],
            "tags": ["cruelty-free", "paraben-free"],
            "ingredients": {"key": ["Snail Secretion Filtrate 96%"], "full": ["Snail Secretion Filtrate", "Betaine"]}
        },
        # 8. Bioderma Micellar Water
        {
            "brand": "bioderma", "category": "cleansers",
            "name": "Sensibio H2O Micellar Water", "slug": "bioderma-sensibio-h2o",
            "sku": "BIO-H2O-500", "price": "18.99", "stock": 100,
            "desc": "A dermatological micellar water perfectly compatible with the skin.",
            "skin_types": ["sensitive", "all"],
            "concerns": ["sensitivity", "redness"],
            "benefits": ["cleansing", "soothing", "makeup removal"],
            "tags": ["fragrance-free", "alcohol-free"],
            "ingredients": {"key": ["Micelles", "Cucumber Extract"], "full": ["Water", "PEG-6 Caprylic/Capric Glycerides"]}
        },
        # 9. Obagi Retinol
        {
            "brand": "obagi", "category": "serums",
            "name": "Obagi360 Retinol 1.0", "slug": "obagi-retinol-1-0",
            "sku": "OBAGI-RET-10", "price": "75.00", "stock": 30,
            "desc": "High-concentration retinol formula minimizes the appearance of fine lines and wrinkles.",
            "skin_types": ["aging", "combination"],
            "concerns": ["aging", "wrinkles", "fine lines"],
            "benefits": ["anti-aging", "smoothing"],
            "tags": [],
            "ingredients": {"key": ["Retinol 1.0%", "Shea Butter"], "full": ["Water", "Caprylic/Capric Triglyceride"]}
        },
        # 10. Vichy Vitamin C
        {
            "brand": "vichy", "category": "serums",
            "name": "LiftActiv Vitamin C Serum", "slug": "vichy-vit-c",
            "sku": "VICHY-VITC", "price": "28.50", "stock": 60,
            "desc": "Pure Vitamin C serum to brighten skin and reduce fine lines.",
            "skin_types": ["dull", "aging", "all"],
            "concerns": ["dullness", "aging", "uneven skin tone"],
            "benefits": ["brightening", "firming"],
            "tags": ["paraben-free"],
            "ingredients": {"key": ["Vitamin C 15%", "Hyaluronic Acid"], "full": ["Aqua", "Ascorbic Acid"]}
        },
        # 11. La Roche-Posay Cicaplast
        {
            "brand": "la-roche-posay", "category": "moisturizers",
            "name": "Cicaplast Baume B5", "slug": "lrp-cicaplast-b5",
            "sku": "LRP-CICA-B5", "price": "15.99", "stock": 100,
            "desc": "Multi-purpose balm for dry skin irritations. Suitable for adults, children, and babies.",
            "skin_types": ["dry", "irritated", "sensitive"],
            "concerns": ["dryness", "irritation", "damaged barrier"],
            "benefits": ["repairing", "soothing", "protecting"],
            "tags": ["fragrance-free", "paraben-free"],
            "ingredients": {"key": ["Panthenol (Vitamin B5)", "Madecassoside"], "full": ["Aqua", "Hydrogenated Polyisobutene"]}
        },
        # 12. CeraVe Salicylic Acid Cleanser
        {
            "brand": "cerave", "category": "cleansers",
            "name": "Renewing SA Cleanser", "slug": "cerave-sa-cleanser",
            "sku": "CERAVE-SA-CL", "price": "14.99", "stock": 85,
            "desc": "Salicylic acid cleanser to exfoliate and smooth rough skin while removing oil and dirt.",
            "skin_types": ["normal", "acne-prone", "rough"],
            "concerns": ["rough texture", "acne"],
            "benefits": ["exfoliating", "smoothing"],
            "tags": ["fragrance-free", "non-comedogenic"],
            "ingredients": {"key": ["Salicylic Acid", "Ceramides", "Niacinamide"], "full": ["Aqua", "Cocamidopropyl Hydroxysultaine"]}
        },
    ]

    products = []
    for p_data in products_data:
        # Extract related fields to resolve FKs
        b_slug = p_data.pop("brand")
        c_slug = p_data.pop("category")
        t_slugs = p_data.pop("tags", [])

        # Validation: Ensure category exists
        if c_slug not in cat_map:
            print(
                f"[WARN] Skip {p_data['name']}: Category '{c_slug}' not found.")
            continue

        # Check if product exists to prevent duplicates
        existing = db.query(Product).filter(
            Product.slug == p_data["slug"]).first()
        if existing:
            products.append(existing)
            continue

        # Create new product object
        product = Product(
            id=str(uuid.uuid4()),
            brand_id=brand_map[b_slug].id,
            category_id=cat_map[c_slug].id,
            name=p_data["name"],
            slug=p_data["slug"],
            sku=p_data["sku"],
            short_description=p_data["desc"][:150],
            description=p_data["desc"],
            how_to_use="Apply as directed on packaging.",
            price=Decimal(p_data["price"]),
            stock_quantity=p_data["stock"],
            is_available=True,
            is_featured=random.choice([True, False]),
            rating_average=Decimal(str(random.uniform(4.0, 5.0))[:3]),
            review_count=random.randint(50, 5000),
            skin_types=p_data["skin_types"],
            concerns=p_data["concerns"],
            benefits=p_data["benefits"],
            ingredients=p_data["ingredients"]
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
            # Use random colors for variety
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
            if "serum" in p.slug or "ampoule" in p.slug:
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

    db = SessionLocal()
    try:
        brands = seed_brands(db)
        categories = seed_categories(db)
        tags = seed_tags(db)
        products = seed_products(db, brands, categories, tags)
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
