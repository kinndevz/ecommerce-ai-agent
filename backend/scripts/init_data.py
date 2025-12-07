import logging
import uuid
from decimal import Decimal
from app.core.config import settings
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User, UserStatus
from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant, Tag
from app.models.cart import Cart, CartItem
from app.models.order import Order, OrderItem
from app.models.review import Review
from app.models.wishlist import Wishlist
from app.models.conversation import Conversation, Message, UserPreference, ProductView
from app.db.database import SessionLocal
from sqlalchemy.orm import Session
from fastapi.routing import APIRoute
from app.models.role import Permission, HTTPMethod
from app.main import app
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_roles(db: Session):
    """Create default roles"""
    roles_data = [
        {"name": "ADMIN", "description": "Administrator with full access"},
        {"name": "CUSTOMER", "description": "Regular customer"},
        {"name": "SELLER", "description": "Product seller/vendor"},
    ]

    for role_data in roles_data:
        existing = db.query(Role).filter(
            Role.name == role_data["name"]).first()
        if not existing:
            role = Role(
                id=str(uuid.uuid4()),
                name=role_data["name"],
                description=role_data["description"]
            )
            db.add(role)

    db.commit()
    print("✅ Roles created")


def create_permissions(db: Session):
    """Create all permissions and store it in admin role"""
    # 1 Get ADMIN role
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not admin_role:
        logger.error("Admin Role not found. Run create_roles first")
        return

    all_permissions = []

    # 2 Get all routes in FastAPI
    for route in app.routes:
        if isinstance(route, APIRoute):
            for method in route.methods:
                if method == "HEAD":
                    continue
                module_name = route.tags[0] if route.tags else "Other"
                path = route.path
                http_method = HTTPMethod(method)

                existing_permission = db.query(Permission).filter(
                    Permission.path == path,
                    Permission.method == http_method
                ).first()

                if not existing_permission:
                    permission = Permission(
                        id=str(uuid.uuid4()),
                        name=route.name or f"{method} {path}",
                        description=route.summary or "",
                        path=path,
                        method=http_method,
                        module=module_name
                    )
                    db.add(permission)
                    db.commit()
                    db.refresh(permission)
                    existing_permission = permission
                    logger.info(f"Created permission: [{method}] {path}")

                all_permissions.append(existing_permission)

    # store all permissions in role admin
    current_admin_perm_ids = {p.id for p in admin_role.permissions}
    count_new = 0
    for perm in all_permissions:
        if perm.id not in current_admin_perm_ids:
            admin_role.permissions.append(perm)
            count_new += 1

    db.commit()
    logger.info(
        f"Add permissions. Added {count_new} new permissions to ADMIN.")


def create_admin_user(db: Session):
    """Create admin user"""
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()

    existing = db.query(User).filter(
        User.email == settings.ADMIN_EMAIL).first()
    if not existing:
        admin = User(
            id=str(uuid.uuid4()),
            email=settings.ADMIN_EMAIL,
            password=hash_password(settings.ADMIN_PASSWORD),
            full_name=settings.ADMIN_NAME,
            role_id=admin_role.id,
            status=UserStatus.ACTIVE
        )
        db.add(admin)
        db.commit()
        print(f"✅ Admin user created: {settings.ADMIN_EMAIL}")
    else:
        print("⚠️  Admin user already exists")


def seed_brands(db: Session):
    """Seed brands"""
    print("\n🏷️  Seeding brands...")

    brands_data = [
        {
            "name": "CeraVe",
            "slug": "cerave",
            "description": "Developed with dermatologists, CeraVe provides effective skincare solutions for all skin types.",
            "country": "USA",
            "website_url": "https://www.cerave.com",
        },
        {
            "name": "The Ordinary",
            "slug": "the-ordinary",
            "description": "Clinical formulations with integrity. High-quality actives at affordable prices.",
            "country": "Canada",
            "website_url": "https://theordinary.com",
        },
        {
            "name": "La Roche-Posay",
            "slug": "la-roche-posay",
            "description": "Dermatological beauty for sensitive skin. Recommended by dermatologists worldwide.",
            "country": "France",
            "website_url": "https://www.laroche-posay.com",
        },
        {
            "name": "Neutrogena",
            "slug": "neutrogena",
            "description": "Clinically proven skincare backed by science.",
            "country": "USA",
            "website_url": "https://www.neutrogena.com",
        },
        {
            "name": "Garnier",
            "slug": "garnier",
            "description": "Naturally inspired beauty products for hair and skin.",
            "country": "France",
            "website_url": "https://www.garnier.com",
        },
        {
            "name": "L'Oréal Paris",
            "slug": "loreal-paris",
            "description": "Because you're worth it. Leader in beauty innovation.",
            "country": "France",
            "website_url": "https://www.lorealparisusa.com",
        },
        {
            "name": "Paula's Choice",
            "slug": "paulas-choice",
            "description": "Research-backed skincare that delivers results.",
            "country": "USA",
            "website_url": "https://www.paulaschoice.com",
        },
        {
            "name": "COSRX",
            "slug": "cosrx",
            "description": "Korean skincare focused on efficacy and minimalism.",
            "country": "South Korea",
            "website_url": "https://www.cosrx.com",
        },
    ]

    brands = []
    for brand_data in brands_data:
        existing = db.query(Brand).filter(
            Brand.slug == brand_data["slug"]).first()
        if not existing:
            brand = Brand(
                id=str(uuid.uuid4()),
                **brand_data,
                is_active=True
            )
            db.add(brand)
            brands.append(brand)
        else:
            brands.append(existing)

    db.commit()
    print(f"✅ Created {len([b for b in brands if b.id])} brands")

    return brands


def seed_categories(db: Session):
    """Seed categories (hierarchical)"""
    print("\n📂 Seeding categories...")

    # Parent categories
    parent_categories = [
        {"name": "Skincare", "slug": "skincare",
            "description": "Complete skincare solutions"},
        {"name": "Makeup", "slug": "makeup",
            "description": "Enhance your natural beauty"},
        {"name": "Hair Care", "slug": "hair-care",
            "description": "Nourish and style your hair"},
        {"name": "Body Care", "slug": "body-care",
            "description": "Care for your body"},
    ]

    categories = []
    parent_map = {}

    for i, cat_data in enumerate(parent_categories):
        existing = db.query(Category).filter(
            Category.slug == cat_data["slug"]).first()
        if not existing:
            cat = Category(
                id=str(uuid.uuid4()),
                **cat_data,
                display_order=i + 1,
                is_active=True
            )
            db.add(cat)
            db.flush()
            categories.append(cat)
            parent_map[cat_data["name"]] = cat
        else:
            categories.append(existing)
            parent_map[cat_data["name"]] = existing

    # Child categories
    child_categories = [
        {"name": "Cleansers", "slug": "cleansers", "parent": "Skincare"},
        {"name": "Moisturizers", "slug": "moisturizers", "parent": "Skincare"},
        {"name": "Serums", "slug": "serums", "parent": "Skincare"},
        {"name": "Sunscreen", "slug": "sunscreen", "parent": "Skincare"},
        {"name": "Toners", "slug": "toners", "parent": "Skincare"},
        {"name": "Exfoliators", "slug": "exfoliators", "parent": "Skincare"},
        {"name": "Masks", "slug": "masks", "parent": "Skincare"},
        {"name": "Eye Care", "slug": "eye-care", "parent": "Skincare"},
        {"name": "Foundation", "slug": "foundation", "parent": "Makeup"},
        {"name": "Lipstick", "slug": "lipstick", "parent": "Makeup"},
        {"name": "Shampoo", "slug": "shampoo", "parent": "Hair Care"},
        {"name": "Conditioner", "slug": "conditioner", "parent": "Hair Care"},
        {"name": "Body Lotion", "slug": "body-lotion", "parent": "Body Care"},
        {"name": "Body Wash", "slug": "body-wash", "parent": "Body Care"},
    ]

    for i, cat_data in enumerate(child_categories):
        parent_name = cat_data.pop("parent")
        existing = db.query(Category).filter(
            Category.slug == cat_data["slug"]).first()
        if not existing:
            cat = Category(
                id=str(uuid.uuid4()),
                **cat_data,
                parent_id=parent_map[parent_name].id,
                display_order=i + 1,
                is_active=True
            )
            db.add(cat)
            categories.append(cat)
        else:
            categories.append(existing)

    db.commit()
    print(f"✅ Created categories")

    return categories


def seed_tags(db: Session):
    """Seed product tags"""
    print("\n🏷️  Seeding tags...")

    tags_data = [
        {"name": "Vegan", "slug": "vegan"},
        {"name": "Cruelty-Free", "slug": "cruelty-free"},
        {"name": "Organic", "slug": "organic"},
        {"name": "Paraben-Free", "slug": "paraben-free"},
        {"name": "Sulfate-Free", "slug": "sulfate-free"},
        {"name": "Fragrance-Free", "slug": "fragrance-free"},
        {"name": "Hypoallergenic", "slug": "hypoallergenic"},
        {"name": "Dermatologist-Tested", "slug": "dermatologist-tested"},
        {"name": "Non-Comedogenic", "slug": "non-comedogenic"},
        {"name": "Alcohol-Free", "slug": "alcohol-free"},
    ]

    tags = []
    for tag_data in tags_data:
        existing = db.query(Tag).filter(
            Tag.slug == tag_data["slug"]).first()
        if not existing:
            tag = Tag(
                id=str(uuid.uuid4()),
                **tag_data
            )
            db.add(tag)
            tags.append(tag)
        else:
            tags.append(existing)

    db.commit()
    print(f"✅ Created tags")

    return tags


def seed_products(db: Session, brands, categories, tags):
    """Seed products"""
    print("\n🛍️  Seeding products...")

    # Get specific categories
    cleanser_cat = next((c for c in categories if c.slug == "cleansers"), None)
    moisturizer_cat = next(
        (c for c in categories if c.slug == "moisturizers"), None)
    serum_cat = next((c for c in categories if c.slug == "serums"), None)
    sunscreen_cat = next(
        (c for c in categories if c.slug == "sunscreen"), None)
    toner_cat = next((c for c in categories if c.slug == "toners"), None)
    exfoliator_cat = next(
        (c for c in categories if c.slug == "exfoliators"), None)

    # Get brands
    brand_map = {b.slug: b for b in brands}
    tag_map = {t.slug: t for t in tags}

    products_data = [
        {
            "brand": "cerave",
            "category": cleanser_cat,
            "name": "CeraVe Hydrating Facial Cleanser",
            "slug": "cerave-hydrating-cleanser",
            "sku": "CERAVE-HC-001",
            "short_description": "Gentle, non-foaming cleanser for normal to dry skin",
            "description": "This unique formula with three essential ceramides and hyaluronic acid effectively cleanses the skin while maintaining its natural moisture barrier.",
            "how_to_use": "Wet skin with lukewarm water. Massage cleanser into skin in a gentle, circular motion. Rinse thoroughly.",
            "price": Decimal("14.99"),
            "stock_quantity": 100,
            "is_featured": True,
            "rating_average": Decimal("4.7"),
            "review_count": 1253,
            "skin_types": ["dry", "normal", "sensitive"],
            "concerns": ["dryness", "sensitivity"],
            "benefits": ["moisturizing", "gentle cleansing"],
            "ingredients": {
                "key_ingredients": ["Hyaluronic Acid", "Ceramides", "Glycerin"],
                "full_list": ["Water", "Glycerin", "Cetearyl Alcohol"],
                "allergens": []
            },
            "tags": ["fragrance-free", "paraben-free", "non-comedogenic"]
        },
        {
            "brand": "cerave",
            "category": moisturizer_cat,
            "name": "CeraVe Moisturizing Cream",
            "slug": "cerave-moisturizing-cream",
            "sku": "CERAVE-MC-001",
            "short_description": "Rich, non-greasy moisturizer for dry skin",
            "description": "Developed with dermatologists, this moisturizer features MVE technology for 24-hour hydration.",
            "how_to_use": "Apply liberally to face and body. For best results, apply after bathing.",
            "price": Decimal("18.99"),
            "stock_quantity": 120,
            "is_featured": True,
            "rating_average": Decimal("4.8"),
            "review_count": 2150,
            "skin_types": ["dry", "very dry", "sensitive"],
            "concerns": ["dryness", "rough texture"],
            "benefits": ["intense hydration", "barrier repair"],
            "ingredients": {
                "key_ingredients": ["Hyaluronic Acid", "Ceramides"],
                "full_list": ["Water", "Glycerin", "Ceramides"],
                "allergens": []
            },
            "tags": ["fragrance-free", "non-comedogenic"]
        },
        {
            "brand": "the-ordinary",
            "category": serum_cat,
            "name": "The Ordinary Niacinamide 10% + Zinc 1%",
            "slug": "the-ordinary-niacinamide",
            "sku": "TO-NIA-001",
            "short_description": "High-strength vitamin and mineral blemish formula",
            "description": "A high-strength formula with 10% Niacinamide and 1% Zinc PCA.",
            "how_to_use": "Apply to entire face morning and evening before heavier creams.",
            "price": Decimal("5.90"),
            "sale_price": Decimal("4.99"),
            "stock_quantity": 150,
            "is_featured": True,
            "rating_average": Decimal("4.6"),
            "review_count": 3420,
            "skin_types": ["oily", "combination", "acne-prone"],
            "concerns": ["acne", "blemishes", "enlarged pores"],
            "benefits": ["brightening", "pore-minimizing"],
            "ingredients": {
                "key_ingredients": ["Niacinamide 10%", "Zinc PCA 1%"],
                "full_list": ["Aqua", "Niacinamide", "Zinc PCA"],
                "allergens": []
            },
            "tags": ["vegan", "cruelty-free"]
        },
        {
            "brand": "the-ordinary",
            "category": serum_cat,
            "name": "The Ordinary Hyaluronic Acid 2% + B5",
            "slug": "the-ordinary-hyaluronic-acid",
            "sku": "TO-HA-001",
            "short_description": "Multi-depth hydration serum",
            "description": "Hydration support formula with 2% hyaluronic acid and vitamin B5.",
            "how_to_use": "Apply to face morning and evening before creams.",
            "price": Decimal("6.80"),
            "stock_quantity": 200,
            "rating_average": Decimal("4.5"),
            "review_count": 1890,
            "skin_types": ["all", "dehydrated"],
            "concerns": ["dehydration", "fine lines"],
            "benefits": ["hydrating", "plumping"],
            "ingredients": {
                "key_ingredients": ["Hyaluronic Acid 2%", "Vitamin B5"],
                "full_list": ["Aqua", "Sodium Hyaluronate", "Panthenol"],
                "allergens": []
            },
            "tags": ["vegan", "cruelty-free", "fragrance-free"]
        },
        {
            "brand": "la-roche-posay",
            "category": sunscreen_cat,
            "name": "La Roche-Posay Anthelios SPF 60",
            "slug": "lrp-anthelios-spf60",
            "sku": "LRP-ANT-60",
            "short_description": "Broad-spectrum SPF 60 sunscreen",
            "description": "Fast-absorbing sunscreen with Cell-Ox Shield technology.",
            "how_to_use": "Apply 15 minutes before sun exposure. Reapply every 2 hours.",
            "price": Decimal("35.99"),
            "stock_quantity": 80,
            "is_featured": True,
            "rating_average": Decimal("4.7"),
            "review_count": 987,
            "skin_types": ["all"],
            "concerns": ["sun damage", "aging"],
            "benefits": ["sun protection", "anti-aging"],
            "ingredients": {
                "key_ingredients": ["Avobenzone", "Homosalate"],
                "full_list": ["Water", "Homosalate", "Octocrylene"],
                "allergens": []
            },
            "tags": ["dermatologist-tested", "paraben-free"]
        },
        {
            "brand": "neutrogena",
            "category": cleanser_cat,
            "name": "Neutrogena Hydro Boost Cleanser",
            "slug": "neutrogena-hydro-boost-cleanser",
            "sku": "NEU-HB-CL",
            "short_description": "Hydrating gel cleanser with hyaluronic acid",
            "description": "Water gel cleanser with hyaluronic acid for hydrated skin.",
            "how_to_use": "Apply to wet face, massage, and rinse thoroughly.",
            "price": Decimal("8.99"),
            "stock_quantity": 90,
            "rating_average": Decimal("4.4"),
            "review_count": 768,
            "skin_types": ["normal", "combination", "dry"],
            "concerns": ["dehydration"],
            "benefits": ["hydrating", "refreshing"],
            "ingredients": {
                "key_ingredients": ["Hyaluronic Acid"],
                "full_list": ["Water", "Glycerin", "Sodium Hyaluronate"],
                "allergens": []
            },
            "tags": ["hypoallergenic", "fragrance-free"]
        },
        {
            "brand": "paulas-choice",
            "category": exfoliator_cat,
            "name": "Paula's Choice 2% BHA Liquid Exfoliant",
            "slug": "paulas-choice-bha-exfoliant",
            "sku": "PC-BHA-001",
            "short_description": "Gentle leave-on exfoliant with salicylic acid",
            "description": "Cult-favorite exfoliant with salicylic acid that unclogs pores.",
            "how_to_use": "Apply with cotton pad after cleansing. Do not rinse.",
            "price": Decimal("32.00"),
            "sale_price": Decimal("28.80"),
            "stock_quantity": 65,
            "is_featured": True,
            "rating_average": Decimal("4.8"),
            "review_count": 4521,
            "skin_types": ["oily", "combination", "acne-prone"],
            "concerns": ["acne", "blackheads", "large pores"],
            "benefits": ["exfoliating", "pore-clearing"],
            "ingredients": {
                "key_ingredients": ["Salicylic Acid 2%"],
                "full_list": ["Water", "Methylpropanediol", "Salicylic Acid"],
                "allergens": []
            },
            "tags": ["fragrance-free", "paraben-free", "cruelty-free"]
        },
        {
            "brand": "cosrx",
            "category": serum_cat,
            "name": "COSRX Snail 96 Mucin Power Essence",
            "slug": "cosrx-snail-essence",
            "sku": "COSRX-SNL-001",
            "short_description": "Lightweight essence with 96% snail mucin",
            "description": "Created from filtered snail mucin, this essence enhances skin vitality.",
            "how_to_use": "Apply 2-3 drops to cleansed face. Gently pat for absorption.",
            "price": Decimal("25.00"),
            "stock_quantity": 75,
            "is_featured": True,
            "rating_average": Decimal("4.7"),
            "review_count": 2340,
            "skin_types": ["all", "dehydrated"],
            "concerns": ["dehydration", "dullness"],
            "benefits": ["hydrating", "repairing"],
            "ingredients": {
                "key_ingredients": ["Snail Secretion 96%"],
                "full_list": ["Snail Secretion Filtrate", "Betaine"],
                "allergens": []
            },
            "tags": ["cruelty-free", "paraben-free", "sulfate-free"]
        },
    ]

    products = []
    for prod_data in products_data:
        brand_slug = prod_data.pop("brand")
        category = prod_data.pop("category")
        tag_slugs = prod_data.pop("tags", [])

        if not category or brand_slug not in brand_map:
            continue

        existing = db.query(Product).filter(
            Product.slug == prod_data["slug"]).first()
        if existing:
            products.append(existing)
            continue

        product = Product(
            id=str(uuid.uuid4()),
            brand_id=brand_map[brand_slug].id,
            category_id=category.id,
            is_available=True,
            **prod_data
        )

        # Add tags
        for tag_slug in tag_slugs:
            if tag_slug in tag_map:
                product.tags.append(tag_map[tag_slug])

        db.add(product)
        products.append(product)

    db.commit()
    print(f"✅ Created products")

    return products


def seed_product_images(db: Session, products):
    """Seed product images"""
    print("\n🖼️  Seeding product images...")

    for product in products:
        # Check if images already exist
        existing = db.query(ProductImage).filter(
            ProductImage.product_id == product.id).first()
        if existing:
            continue

        # Primary image
        image1 = ProductImage(
            id=str(uuid.uuid4()),
            product_id=product.id,
            image_url=f"https://via.placeholder.com/800/4A90E2/FFFFFF?text={product.slug[:20]}",
            alt_text=f"{product.name} - Front",
            is_primary=True,
            display_order=0
        )
        db.add(image1)

        # Additional images
        image2 = ProductImage(
            id=str(uuid.uuid4()),
            product_id=product.id,
            image_url=f"https://via.placeholder.com/800/7B68EE/FFFFFF?text={product.slug[:20]}-2",
            alt_text=f"{product.name} - Texture",
            is_primary=False,
            display_order=1
        )
        db.add(image2)

    db.commit()
    print(f"✅ Created product images")


def seed_product_variants(db: Session, products):
    """Seed product variants (sizes)"""
    print("\n📦 Seeding product variants...")

    # Add variants for moisturizers and cleansers
    target_products = [
        p for p in products if "cleanser" in p.slug or "cream" in p.slug or "moisturizer" in p.slug]

    for product in target_products:
        # Check if variants already exist
        existing = db.query(ProductVariant).filter(
            ProductVariant.product_id == product.id).first()
        if existing:
            continue

        # Small size
        variant1 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=product.id,
            name=f"{product.name} - 50ml",
            sku=f"{product.sku}-50ML",
            price=product.price * Decimal("0.7"),
            stock_quantity=50,
            size="50",
            size_unit="ml",
            is_available=True
        )
        db.add(variant1)

        # Medium size
        variant2 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=product.id,
            name=f"{product.name} - 100ml",
            sku=f"{product.sku}-100ML",
            price=product.price,
            stock_quantity=100,
            size="100",
            size_unit="ml",
            is_available=True
        )
        db.add(variant2)

        # Large size
        variant3 = ProductVariant(
            id=str(uuid.uuid4()),
            product_id=product.id,
            name=f"{product.name} - 200ml",
            sku=f"{product.sku}-200ML",
            price=product.price * Decimal("1.6"),
            stock_quantity=75,
            size="200",
            size_unit="ml",
            is_available=True
        )
        db.add(variant3)

    db.commit()
    print(f"✅ Created product variants")


def main():
    """Run all initialization"""
    print("\n" + "="*50)
    print("🚀 INITIALIZING DATABASE")
    print("="*50)

    db = SessionLocal()

    try:
        # Core setup
        create_roles(db)
        create_admin_user(db)
        create_permissions(db)

        # Seed data
        brands = seed_brands(db)
        categories = seed_categories(db)
        tags = seed_tags(db)
        products = seed_products(db, brands, categories, tags)
        seed_product_images(db, products)
        seed_product_variants(db, products)

        print("\n" + "="*50)
        print("✅ DATABASE INITIALIZATION COMPLETED!")
        print("="*50)

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
