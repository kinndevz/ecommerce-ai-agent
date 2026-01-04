import uuid
from sqlalchemy.orm import Session, joinedload, noload
from sqlalchemy import func, desc
from typing import Optional
from datetime import datetime, timezone
from app.models.role import Role, Permission, HTTPMethod
from app.models.user import User
from app.schemas.roles import (
    RoleCreateRequest,
    RoleUpdateRequest,
    AssignPermissionsRequest,
    RemovePermissionsRequest,
    PermissionCreateRequest,
    PermissionUpdateRequest
)
from app.utils.responses import ResponseHandler


class RoleService:
    @staticmethod
    def get_all_roles(
        db: Session,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        include_permissions: bool = False
    ):
        query = db.query(Role).filter(Role.deleted_at.is_(None))

        if search:
            query = query.filter(Role.name.ilike(f"%{search}%"))

        if is_active is not None:
            query = query.filter(Role.is_active == is_active)
        total = query.count()
        offset = (page - 1) * limit

        if include_permissions:
            # Load permissions
            roles = query.options(
                joinedload(Role.permissions)
            ).order_by(desc(Role.created_at)).offset(offset).limit(limit).all()
        else:
            # No load permissions
            roles = query.options(
                noload(Role.permissions)
            ).order_by(desc(Role.created_at)).offset(offset).limit(limit).all()

        return ResponseHandler.get_list_success(
            "Role",
            roles,
            total,
            page,
            limit
        )

    @staticmethod
    def get_role_by_id(db: Session, role_id: str):
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(
            Role.id == role_id,
            Role.deleted_at.is_(None)
        ).first()

        if not role:
            ResponseHandler.not_found_error("Role", role_id)

        return ResponseHandler.get_single_success("Role", role_id, role)

    @staticmethod
    def create_role(db: Session, data: RoleCreateRequest, created_by_id: str):
        # Check if role name already exists
        existing = db.query(Role).filter(
            Role.name == data.name,
            Role.deleted_at.is_(None)
        ).first()

        if existing:
            ResponseHandler.already_exists_error("Role", "name")

        # Validate permissions exist
        if data.permission_ids:
            permissions = db.query(Permission).filter(
                Permission.id.in_(data.permission_ids),
                Permission.deleted_at.is_(None)
            ).all()

            if len(permissions) != len(data.permission_ids):
                ResponseHandler.bad_request(
                    "One or more permission IDs are invalid")
        else:
            permissions = []

        # Create role
        role = Role(
            id=str(uuid.uuid4()),
            name=data.name,
            description=data.description,
            is_active=data.is_active,
            created_by_id=created_by_id,
            created_at=datetime.now(timezone.utc)
        )

        db.add(role)
        db.flush()

        # Assign permissions
        role.permissions = permissions

        db.commit()
        db.refresh(role)

        # Reload with permissions
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(Role.id == role.id).first()

        return ResponseHandler.create_success("Role", role.id, role)

    @staticmethod
    def update_role(db: Session, role_id: str, data: RoleUpdateRequest, updated_by_id: str):
        role = db.query(Role).filter(
            Role.id == role_id,
            Role.deleted_at.is_(None)
        ).first()

        if not role:
            ResponseHandler.not_found_error("Role", role_id)

        # Prevent updating system roles (ADMIN, CUSTOMER, SELLER)
        system_roles = ["ADMIN", "CUSTOMER", "SELLER"]
        if role.name in system_roles and data.name and data.name != role.name:
            ResponseHandler.bad_request(
                f"Cannot rename system role '{role.name}'")

        # Check name uniqueness if changing name
        if data.name and data.name != role.name:
            existing = db.query(Role).filter(
                Role.name == data.name,
                Role.deleted_at.is_(None)
            ).first()

            if existing:
                ResponseHandler.already_exists_error("Role", "name")

        # Update fields
        if data.name is not None:
            role.name = data.name
        if data.description is not None:
            role.description = data.description
        if data.is_active is not None:
            role.is_active = data.is_active

        # Update permissions if provided
        if data.permission_ids is not None:
            permissions = db.query(Permission).filter(
                Permission.id.in_(data.permission_ids),
                Permission.deleted_at.is_(None)
            ).all()

            if len(permissions) != len(data.permission_ids):
                ResponseHandler.bad_request(
                    "One or more permission IDs are invalid")

            role.permissions = permissions

        role.updated_by_id = updated_by_id
        role.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(role)

        # Reload with permissions
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(Role.id == role_id).first()

        return ResponseHandler.update_success("Role", role_id, role)

    @staticmethod
    def delete_role(db: Session, role_id: str, deleted_by_id: str):
        role = db.query(Role).filter(
            Role.id == role_id,
            Role.deleted_at.is_(None)
        ).first()

        if not role:
            ResponseHandler.not_found_error("Role", role_id)

        # Prevent deleting system roles
        system_roles = ["ADMIN", "CUSTOMER", "SELLER"]
        if role.name in system_roles:
            ResponseHandler.bad_request(
                f"Cannot delete system role '{role.name}'")

        # Check if role is assigned to any users
        user_count = db.query(User).filter(
            User.role_id == role_id,
            User.deleted_at.is_(None)
        ).count()

        if user_count > 0:
            ResponseHandler.bad_request(
                f"Cannot delete role. {user_count} user(s) are assigned to this role."
            )

        # Soft delete
        role.deleted_at = datetime.now(timezone.utc)
        role.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("Role", role_id)

    @staticmethod
    def assign_permissions(db: Session, role_id: str, data: AssignPermissionsRequest, updated_by_id: str):
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(
            Role.id == role_id,
            Role.deleted_at.is_(None)
        ).first()

        if not role:
            ResponseHandler.not_found_error("Role", role_id)

        # Get new permissions
        new_permissions = db.query(Permission).filter(
            Permission.id.in_(data.permission_ids),
            Permission.deleted_at.is_(None)
        ).all()

        if len(new_permissions) != len(data.permission_ids):
            ResponseHandler.bad_request(
                "One or more permission IDs are invalid")

        # Add only new permissions (avoid duplicates)
        existing_permission_ids = {p.id for p in role.permissions}
        for perm in new_permissions:
            if perm.id not in existing_permission_ids:
                role.permissions.append(perm)

        role.updated_by_id = updated_by_id
        role.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(role)

        # Reload with permissions
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(Role.id == role_id).first()

        return ResponseHandler.success(
            f"Permissions assigned to role '{role.name}' successfully",
            role
        )

    @staticmethod
    def remove_permissions(db: Session, role_id: str, data: RemovePermissionsRequest, updated_by_id: str):
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(
            Role.id == role_id,
            Role.deleted_at.is_(None)
        ).first()

        if not role:
            ResponseHandler.not_found_error("Role", role_id)

        # Remove specified permissions
        role.permissions = [
            p for p in role.permissions
            if p.id not in data.permission_ids
        ]

        role.updated_by_id = updated_by_id
        role.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(role)

        # Reload with permissions
        role = db.query(Role).options(
            joinedload(Role.permissions)
        ).filter(Role.id == role_id).first()

        return ResponseHandler.success(
            f"Permissions removed from role '{role.name}' successfully",
            role
        )

    @staticmethod
    def get_role_stats(db: Session):
        total_roles = db.query(Role).filter(Role.deleted_at.is_(None)).count()
        active_roles = db.query(Role).filter(
            Role.deleted_at.is_(None),
            Role.is_active == True
        ).count()
        inactive_roles = total_roles - active_roles

        # Users per role
        users_per_role = db.query(
            Role.name,
            func.count(User.id).label('user_count')
        ).join(User, User.role_id == Role.id).filter(
            Role.deleted_at.is_(None),
            User.deleted_at.is_(None)
        ).group_by(Role.name).all()

        stats = {
            "total_roles": total_roles,
            "active_roles": active_roles,
            "inactive_roles": inactive_roles,
            "users_per_role": {role: count for role, count in users_per_role}
        }

        return ResponseHandler.success("Role statistics retrieved successfully", stats)


class PermissionService:
    @staticmethod
    def get_all_permissions(
        db: Session,
        page: int = 1,
        limit: int = 50,
        search: Optional[str] = None,
        module: Optional[str] = None,
        method: Optional[str] = None
    ):
        query = db.query(Permission).filter(Permission.deleted_at.is_(None))

        # Apply filters
        if search:
            query = query.filter(
                (Permission.name.ilike(f"%{search}%")) |
                (Permission.path.ilike(f"%{search}%"))
            )

        if module:
            query = query.filter(Permission.module == module)

        if method:
            try:
                http_method = HTTPMethod(method.upper())
                query = query.filter(Permission.method == http_method)
            except ValueError:
                ResponseHandler.bad_request(f"Invalid HTTP method: {method}")

        # Count total
        total = query.count()

        # Pagination
        offset = (page - 1) * limit
        permissions = query.order_by(
            Permission.module,
            Permission.path,
            Permission.method
        ).offset(offset).limit(limit).all()

        return ResponseHandler.get_list_success(
            "Permission",
            permissions,
            total,
            page,
            limit
        )

    @staticmethod
    def get_permission_by_id(db: Session, permission_id: str):
        permission = db.query(Permission).filter(
            Permission.id == permission_id,
            Permission.deleted_at.is_(None)
        ).first()

        if not permission:
            ResponseHandler.not_found_error("Permission", permission_id)

        return ResponseHandler.get_single_success("Permission", permission_id, permission)

    @staticmethod
    def create_permission(db: Session, data: PermissionCreateRequest, created_by_id: str):
        # Validate HTTP method
        try:
            http_method = HTTPMethod(data.method.upper())
        except ValueError:
            ResponseHandler.bad_request(f"Invalid HTTP method: {data.method}")

        # Check if permission already exists
        existing = db.query(Permission).filter(
            Permission.path == data.path,
            Permission.method == http_method,
            Permission.deleted_at.is_(None)
        ).first()

        if existing:
            ResponseHandler.already_exists_error(
                "Permission", f"{data.method} {data.path}")

        # Create permission
        permission = Permission(
            id=str(uuid.uuid4()),
            name=data.name,
            description=data.description,
            path=data.path,
            method=http_method,
            module=data.module,
            created_by_id=created_by_id,
            created_at=datetime.now(timezone.utc)
        )

        db.add(permission)
        db.commit()
        db.refresh(permission)

        return ResponseHandler.create_success("Permission", permission.id, permission)

    @staticmethod
    def update_permission(db: Session, permission_id: str, data: PermissionUpdateRequest, updated_by_id: str):
        permission = db.query(Permission).filter(
            Permission.id == permission_id,
            Permission.deleted_at.is_(None)
        ).first()

        if not permission:
            ResponseHandler.not_found_error("Permission", permission_id)

        # Update fields
        if data.name is not None:
            permission.name = data.name
        if data.description is not None:
            permission.description = data.description
        if data.module is not None:
            permission.module = data.module

        permission.updated_by_id = updated_by_id
        permission.updated_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(permission)

        return ResponseHandler.update_success("Permission", permission_id, permission)

    @staticmethod
    def delete_permission(db: Session, permission_id: str, deleted_by_id: str):
        permission = db.query(Permission).filter(
            Permission.id == permission_id,
            Permission.deleted_at.is_(None)
        ).first()

        if not permission:
            ResponseHandler.not_found_error("Permission", permission_id)

        # Soft delete
        permission.deleted_at = datetime.now(timezone.utc)
        permission.deleted_by_id = deleted_by_id

        db.commit()

        return ResponseHandler.delete_success("Permission", permission_id)

    @staticmethod
    def get_permissions_by_module(db: Session):
        permissions = db.query(Permission).filter(
            Permission.deleted_at.is_(None)
        ).order_by(Permission.module, Permission.path).all()

        # Group by module
        grouped = {}
        for perm in permissions:
            module = perm.module or "Other"
            if module not in grouped:
                grouped[module] = []
            grouped[module].append(perm)

        return ResponseHandler.success(
            "Permissions grouped by module retrieved successfully",
            grouped
        )
