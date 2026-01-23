import uuid
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import WebSocket, status
import logging
import anyio
from typing import Any, Dict, Tuple
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.models.role import Role
from app.core.constant import UserRole
from app.core.enums import UserStatus
from app.schemas.notifications import (
    NotificationCreateRequest,
    BroadcastNotificationRequest,
    MarkAsReadRequest
)
from app.utils.responses import ResponseHandler
from app.websocket.manager import notification_manager
from app.db.database import get_db
from app.core.config import settings
from app.core.redis_rate_limiter import redis_rate_limiter

logger = logging.getLogger(__name__)


class NotificationService:
    _WS_TICKET_TTL_SECONDS = 60
    _WS_TICKET_PREFIX = "ws_ticket"

    @staticmethod
    def _get_admin_users(db: Session):
        return db.query(User).join(Role).filter(
            Role.name == UserRole.ADMIN,
            User.deleted_at.is_(None),
            User.status == UserStatus.ACTIVE
        ).all()

    @staticmethod
    def notify_admins(
        db: Session,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: dict = None,
        action_url: str = None,
        send_websocket: bool = True
    ):
        admins = NotificationService._get_admin_users(db)
        if not admins:
            return []

        notifications = []
        for admin in admins:
            notification = NotificationService.create_notification_sync(
                db,
                user_id=admin.id,
                notification_type=notification_type,
                title=title,
                message=message,
                data=data,
                action_url=action_url,
                send_websocket=send_websocket
            )
            notifications.append(notification)

        return notifications

    @staticmethod
    def _build_notification_payload(
        notification_type: NotificationType,
        context: Dict[str, Any]
    ) -> Tuple[str, str, Dict[str, Any] | None, str | None]:
        if notification_type == NotificationType.REVIEW_RECEIVED:
            reviewer_name = context.get("reviewer_name", "A customer")
            product_name = context.get("product_name", "a product")
            product_id = context.get("product_id")
            review_id = context.get("review_id")
            user_id = context.get("user_id")
            rating = context.get("rating")
            return (
                "New product review",
                f"{reviewer_name} reviewed {product_name}",
                {
                    "review_id": review_id,
                    "product_id": product_id,
                    "user_id": user_id,
                    "rating": rating
                },
                f"/admin/products/{product_id}/reviews" if product_id else None
            )

        if notification_type == NotificationType.ORDER_CREATED:
            order_number = context.get("order_number")
            order_id = context.get("order_id")
            user_id = context.get("user_id")
            total = context.get("total")
            return (
                "New order created",
                f"Order {order_number} was created",
                {
                    "order_id": order_id,
                    "order_number": order_number,
                    "user_id": user_id,
                    "total": total
                },
                f"/admin/orders/{order_id}" if order_id else None
            )

        return (
            "Notification",
            "You have a new notification",
            context,
            None
        )

    @staticmethod
    def notify_admins_event(
        db: Session,
        notification_type: NotificationType,
        context: Dict[str, Any],
        send_websocket: bool = True
    ):
        title, message, data, action_url = NotificationService._build_notification_payload(
            notification_type, context)
        return NotificationService.notify_admins(
            db,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data,
            action_url=action_url,
            send_websocket=send_websocket
        )

    @staticmethod
    def review_received_context(
        review_id: str,
        product_id: str,
        user_id: str,
        rating: int,
        reviewer_name: str,
        product_name: str
    ) -> Dict[str, Any]:
        return {
            "review_id": review_id,
            "product_id": product_id,
            "user_id": user_id,
            "rating": rating,
            "reviewer_name": reviewer_name,
            "product_name": product_name
        }

    @staticmethod
    def order_created_context(
        order_id: str,
        order_number: str,
        user_id: str,
        total: float
    ) -> Dict[str, Any]:
        return {
            "order_id": order_id,
            "order_number": order_number,
            "user_id": user_id,
            "total": total
        }



    @staticmethod
    def create_notification_sync(
        db: Session,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: dict = None,
        action_url: str = None,
        send_websocket: bool = True
    ):
        data_json = json.dumps(data) if data else None

        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            data=data_json,
            action_url=action_url,
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        if send_websocket:
            anyio.from_thread.run(
                NotificationService._send_websocket_notification,
                notification
            )

        return notification

    @staticmethod
    async def create_notification(db: Session, data: NotificationCreateRequest, send_websocket: bool = True):
        user = db.query(User).filter(User.id == data.user_id,
                                     User.deleted_at.is_(None)).first()
        if not user:
            ResponseHandler.not_found_error("User", data.user_id)

        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=data.user_id,
            type=data.type,
            title=data.title,
            message=data.message,
            data=data.data,
            action_url=data.action_url,
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        if send_websocket:
            await NotificationService._send_websocket_notification(notification)

        return ResponseHandler.create_success("Notification", notification.id, notification)

    @staticmethod
    async def create_notification_for_user(
        db: Session,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: dict = None,
        action_url: str = None
    ):
        data_json = json.dumps(data) if data else None

        request = NotificationCreateRequest(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            data=data_json,
            action_url=action_url
        )

        return await NotificationService.create_notification(db, request)

    @staticmethod
    async def broadcast_notification(db: Session, data: BroadcastNotificationRequest):
        users = db.query(User).filter(User.deleted_at.is_(
            None), User.status == "ACTIVE").all()

        if not users:
            return ResponseHandler.success("No active users to notify", {"count": 0})

        notifications = []
        for user in users:
            notification = Notification(
                id=str(uuid.uuid4()),
                user_id=user.id,
                type=data.type,
                title=data.title,
                message=data.message,
                action_url=data.action_url,
                is_read=False,
                created_at=datetime.now(timezone.utc)
            )
            db.add(notification)
            notifications.append(notification)

        db.commit()

        message = {
            "type": "notification",
            "data": {
                "id": notifications[0].id if notifications else None,
                "type": data.type.value,
                "title": data.title,
                "message": data.message,
                "action_url": data.action_url,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        }

        await notification_manager.broadcast(message)

        return ResponseHandler.success(
            f"Broadcast sent to {len(notifications)} users",
            {"count": len(notifications)}
        )

    @staticmethod
    def get_user_notifications(db: Session, user_id: str, page: int = 1, limit: int = 20, unread_only: bool = False):
        query = db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.is_read == False)

        total = query.count()
        notifications = query.order_by(desc(Notification.created_at)).offset(
            (page - 1) * limit).limit(limit).all()

        return ResponseHandler.get_list_success("Notification", notifications, total, page, limit)

    @staticmethod
    def mark_as_read(db: Session, user_id: str, data: MarkAsReadRequest):
        notifications = db.query(Notification).filter(
            Notification.id.in_(data.notification_ids),
            Notification.user_id == user_id
        ).all()

        if not notifications:
            ResponseHandler.not_found_error(
                "Notifications", str(data.notification_ids))

        now = datetime.now(timezone.utc)
        for notification in notifications:
            notification.is_read = True
            notification.read_at = now

        db.commit()

        return ResponseHandler.success(f"Marked {len(notifications)} notification(s) as read", {"count": len(notifications)})

    @staticmethod
    def mark_all_as_read(db: Session, user_id: str):
        now = datetime.now(timezone.utc)

        updated_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True, "read_at": now})

        db.commit()

        return ResponseHandler.success(f"Marked {updated_count} notification(s) as read", {"count": updated_count})

    @staticmethod
    def delete_notification(db: Session, user_id: str, notification_id: str):
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

        if not notification:
            ResponseHandler.not_found_error("Notification", notification_id)

        db.delete(notification)
        db.commit()

        return ResponseHandler.delete_success("Notification", notification_id)

    @staticmethod
    def delete_all_read(db: Session, user_id: str):
        deleted_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == True
        ).delete()

        db.commit()

        return ResponseHandler.success(f"Deleted {deleted_count} read notification(s)", {"count": deleted_count})

    @staticmethod
    def get_notification_stats(db: Session, user_id: str):
        total = db.query(Notification).filter(
            Notification.user_id == user_id).count()
        unread = db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read == False).count()

        by_type = db.query(
            Notification.type,
            func.count(Notification.id).label('count')
        ).filter(Notification.user_id == user_id).group_by(Notification.type).all()

        stats = {
            "total_notifications": total,
            "unread_notifications": unread,
            "read_notifications": total - unread,
            "by_type": {type_: count for type_, count in by_type}
        }

        return ResponseHandler.success("Notification statistics retrieved", stats)

    @staticmethod
    def get_online_users():
        online_users = notification_manager.get_online_users()
        total_connections = notification_manager.get_total_connections()

        data = {
            "online_users": online_users,
            "online_count": len(online_users),
            "total_connections": total_connections
        }

        return ResponseHandler.success("Online users retrieved", data)

    @staticmethod
    def get_user_connection_status(db: Session, user_id: str):
        user_existed = db.query(User).filter(User.id == user_id,
                                             User.deleted_at.is_(None)).first()
        if not user_existed:
            ResponseHandler.not_found_error("User", user_id)

        is_online = notification_manager.is_user_online(user_id)
        connection_count = notification_manager.get_user_connection_count(
            user_id)

        data = {
            "user_id": user_id,
            "is_online": is_online,
            "connection_count": connection_count
        }

        return ResponseHandler.success("Connection status retrieved", data)

    @staticmethod
    def create_ws_ticket(db: Session, user_id: str):
        ticket = str(uuid.uuid4())
        key = f"{settings.REDIS_KEY_PREFIX}:{NotificationService._WS_TICKET_PREFIX}:{ticket}"
        redis_rate_limiter.redis_client.setex(
            key, NotificationService._WS_TICKET_TTL_SECONDS, user_id
        )
        expires_at = datetime.now(timezone.utc) + timedelta(
            seconds=NotificationService._WS_TICKET_TTL_SECONDS
        )
        return ResponseHandler.success(
            message="WebSocket ticket issued",
            data={"ticket": ticket, "expires_at": expires_at}
        )

    @staticmethod
    def consume_ws_ticket(ticket: str) -> str | None:
        key = f"{settings.REDIS_KEY_PREFIX}:{NotificationService._WS_TICKET_PREFIX}:{ticket}"
        user_id = redis_rate_limiter.redis_client.get(key)
        if user_id:
            redis_rate_limiter.redis_client.delete(key)
            return user_id
        return None

    @staticmethod
    async def handle_websocket_connection(websocket: WebSocket):
        ticket = websocket.query_params.get("ticket")

        await websocket.accept()

        if not ticket:
            await websocket.send_json({"type": "error", "message": "Missing ticket"})
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        try:
            user_id = await NotificationService._authenticate_websocket(websocket, ticket)
            if not user_id:
                return

            db = next(get_db())

            try:
                await NotificationService._register_connection(websocket, user_id, db)
                await NotificationService._send_initial_stats(websocket, user_id, db)
                await NotificationService._listen_messages(websocket, user_id)
            finally:
                notification_manager.disconnect(websocket, user_id)
                db.close()

        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            try:
                await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
            except:
                pass

    @staticmethod
    async def _authenticate_websocket(websocket: WebSocket, ticket: str):
        try:
            user_id = NotificationService.consume_ws_ticket(ticket)
            if not user_id:
                await websocket.send_json({"type": "error", "message": "Invalid or expired ticket"})
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return None

            db = next(get_db())
            user = db.query(User).filter(User.id == user_id,
                                         User.deleted_at.is_(None)).first()
            db.close()

            if not user:
                await websocket.send_json({"type": "error", "message": "User not found"})
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return None

            return user_id

        except Exception as e:
            logger.error(f"Ticket verification failed: {e}")
            await websocket.send_json({"type": "error", "message": "Ticket verification failed"})
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return None

    @staticmethod
    async def _register_connection(websocket: WebSocket, user_id: str, db: Session):
        if user_id not in notification_manager.active_connections:
            notification_manager.active_connections[user_id] = []

        notification_manager.active_connections[user_id].append(websocket)
        logger.info(
            f"User {user_id} connected. Total: {len(notification_manager.active_connections[user_id])}")

    @staticmethod
    async def _send_initial_stats(websocket: WebSocket, user_id: str, db: Session):
        try:
            stats = NotificationService.get_notification_stats(db, user_id)
            await websocket.send_json({"type": "stats", "data": stats["data"]})
        except Exception as e:
            logger.error(f"Failed to send stats: {e}")

    @staticmethod
    async def _listen_messages(websocket: WebSocket, user_id: str):
        from fastapi import WebSocketDisconnect

        try:
            while True:
                data = await websocket.receive_json()

                if data.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })

        except WebSocketDisconnect:
            logger.info(f"User {user_id} disconnected")

    @staticmethod
    async def _send_websocket_notification(notification: Notification):
        message = {
            "type": "notification",
            "data": {
                "id": notification.id,
                "type": notification.type.value,
                "title": notification.title,
                "message": notification.message,
                "data": notification.data,
                "action_url": notification.action_url,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }
        }

        await notification_manager.send_personal_message(message, notification.user_id)
