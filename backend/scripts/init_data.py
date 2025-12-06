import logging
import uuid
from app.core.config import settings
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User, UserStatus
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
        logger.log("Admin Role not found. Run create_roles first")
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


def main():
    """Run all initialization"""
    print("🚀 Initializing database...")
    db = SessionLocal()

    try:
        create_roles(db)
        create_admin_user(db)
        create_permissions(db)
        print("\n✅ Database initialization completed!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
