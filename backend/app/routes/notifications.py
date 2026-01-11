from fastapi import APIRouter, Depends, Query, Path, WebSocket
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user, require_permission
from app.services.notifications import NotificationService
from app.schemas.notifications import (
    NotificationCreateRequest,
    BroadcastNotificationRequest,
    MarkAsReadRequest,
    NotificationResponse,
    NotificationListResponse,
    NotificationStatsResponse,
    MessageResponse
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_my_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    unread_only: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.get_user_notifications(db, current_user.id, page, limit, unread_only)


@router.get("/stats", response_model=NotificationStatsResponse)
def get_my_notification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.get_notification_stats(db, current_user.id)


@router.post("/mark-read", response_model=MessageResponse)
def mark_notifications_as_read(
    data: MarkAsReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.mark_as_read(db, current_user.id, data)


@router.post("/mark-all-read", response_model=MessageResponse)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.mark_all_as_read(db, current_user.id)


@router.delete("/{notification_id}", response_model=MessageResponse)
def delete_notification(
    notification_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.delete_notification(db, current_user.id, notification_id)


@router.delete("/clear/read", response_model=MessageResponse)
def delete_all_read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return NotificationService.delete_all_read(db, current_user.id)


@router.post("", response_model=NotificationResponse, status_code=201)
async def create_notification(
    data: NotificationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return await NotificationService.create_notification(db, data)


@router.post("/broadcast", response_model=MessageResponse)
async def broadcast_notification(
    data: BroadcastNotificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission())
):
    return await NotificationService.broadcast_notification(db, data)


@router.get("/admin/online-users")
def get_online_users(current_user: User = Depends(require_permission())):
    return NotificationService.get_online_users()


@router.get("/admin/connection-status/{user_id}")
def get_user_connection_status(
    db: Session = Depends(get_db),
    user_id: str = Path(...),
    current_user: User = Depends(require_permission())
):
    return NotificationService.get_user_connection_status(db, user_id)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await NotificationService.handle_websocket_connection(websocket)
