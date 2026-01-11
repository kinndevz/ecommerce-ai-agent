import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import WebSocket, status
from jose import JWTError
import logging
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.schemas.notifications import (
    NotificationCreateRequest,
    BroadcastNotificationRequest,
    MarkAsReadRequest
)
from app.utils.responses import ResponseHandler
from app.websocket.manager import notification_manager
from app.core.security import verify_access_token
from app.db.database import get_db

logger = logging.getLogger(__name__)


class NotificationService:

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
    async def handle_websocket_connection(websocket: WebSocket):
        token = websocket.query_params.get("token")

        await websocket.accept()

        if not token:
            await websocket.send_json({"type": "error", "message": "Missing token"})
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        try:
            user_id = await NotificationService._authenticate_websocket(websocket, token)
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
    async def _authenticate_websocket(websocket: WebSocket, token: str):
        try:
            payload = verify_access_token(token)
            user_id = payload.get("user_id")

            if not user_id:
                await websocket.send_json({"type": "error", "message": "Invalid token"})
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

        except JWTError:
            await websocket.send_json({"type": "error", "message": "Token verification failed"})
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
