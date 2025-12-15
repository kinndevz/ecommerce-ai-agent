from fastapi.routing import APIRoute
from app.main import app
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserStatus
from app.models.role import Role, Permission, HTTPMethod
from app.db.database import SessionLocal
import sys
import os
import logging
import uuid
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)


def sync_roles(db: Session):
    """Initialize default system roles if they don't exist."""
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
            logger.info(f"[CREATE] Role: {role_data['name']}")

    db.commit()


def sync_permissions(db: Session):
    """
    Synchronize permissions between FastAPI routes and Database.
    1. Scan all routes in code.
    2. Remove permissions from DB that no longer exist in code.
    3. Add new permissions found in code to DB.
    4. Auto-assign new permissions to the ADMIN role.
    """
    logger.info("--- Starting Permission Sync ---")

    # 1. Extract all permissions defined in Code
    # Key: (http_method, path)
    code_permissions = {}

    for route in app.routes:
        if isinstance(route, APIRoute):
            for method in route.methods:
                if method == "HEAD":
                    continue

                http_method = HTTPMethod(method)
                path = route.path
                key = (http_method, path)

                module_name = route.tags[0] if route.tags else "Other"

                code_permissions[key] = {
                    "name": route.name or f"{method} {path}",
                    "description": route.summary or "",
                    "module": module_name
                }

    # 2. Fetch all permissions currently in Database
    db_permissions = db.query(Permission).all()
    db_perm_map = {(p.method, p.path): p for p in db_permissions}

    # 3. DELETE: Remove obsolete permissions (In DB but not in Code)
    deleted_count = 0
    for key, perm_obj in db_perm_map.items():
        if key not in code_permissions:
            logger.warning(
                f"[DELETE] Obsolete permission: [{perm_obj.method}] {perm_obj.path}")
            db.delete(perm_obj)
            deleted_count += 1

    if deleted_count > 0:
        db.commit()

    # 4. INSERT: Add new permissions (In Code but not in DB)
    added_count = 0
    new_permissions = []

    for key, data in code_permissions.items():
        if key not in db_perm_map:
            new_perm = Permission(
                id=str(uuid.uuid4()),
                name=data["name"],
                description=data["description"],
                path=key[1],       # path
                method=key[0],     # http_method
                module=data["module"]
            )
            db.add(new_perm)
            new_permissions.append(new_perm)
            logger.info(f"[NEW] Created permission: [{key[0]}] {key[1]}")
            added_count += 1

    db.commit()

    # 5. UPDATE: Assign new permissions to ADMIN role
    if new_permissions:
        admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
        if admin_role:
            for perm in new_permissions:
                admin_role.permissions.append(perm)
            db.commit()
            logger.info(
                f"[UPDATE] Assigned {len(new_permissions)} new permissions to ADMIN role.")

    logger.info(
        f"--- Sync Summary: +{added_count} Added | -{deleted_count} Deleted ---")


def sync_admin_user(db: Session):
    """Ensure the default Admin user exists."""
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not admin_role:
        return

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
        logger.info(f"[CREATE] Admin user: {settings.ADMIN_EMAIL}")


def main():
    print("\n" + "="*60)
    print("SYSTEM INITIALIZATION: ROLES & PERMISSIONS")
    print("="*60)

    db = SessionLocal()
    try:
        sync_roles(db)
        sync_permissions(db)
        sync_admin_user(db)
        print("\n[SUCCESS] Initialization completed.")
    except Exception as e:
        print(f"\n[ERROR] Initialization failed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
