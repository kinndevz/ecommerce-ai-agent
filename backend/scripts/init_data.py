import uuid
from app.core.config import settings
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User, UserStatus
from app.db.database import SessionLocal
from sqlalchemy.orm import Session
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


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


def main():
    """Run all initialization"""
    print("🚀 Initializing database...")
    db = SessionLocal()

    try:
        create_roles(db)
        create_admin_user(db)
        print("\n✅ Database initialization completed!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
