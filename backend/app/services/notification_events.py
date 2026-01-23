from typing import Any, Dict, Callable
from sqlalchemy.orm import Session

from app.core.enums import NotificationType
from app.services.notifications import NotificationService


class NotificationEventEmitter:
    _builders: Dict[NotificationType, Callable[..., Dict[str, Any]]] = {}

    @staticmethod
    def register(notification_type: NotificationType):
        def decorator(builder: Callable[..., Dict[str, Any]]):
            NotificationEventEmitter._builders[notification_type] = builder
            return builder
        return decorator

    @staticmethod
    def emit(
        db: Session,
        notification_type: NotificationType,
        model: Any,
        send_websocket: bool = True,
        **kwargs: Any
    ):
        builder = NotificationEventEmitter._builders.get(notification_type)
        if not builder:
            return []

        context = builder(model=model, **kwargs)
        return NotificationService.notify_admins_event(
            db,
            notification_type=notification_type,
            context=context,
            send_websocket=send_websocket
        )


@NotificationEventEmitter.register(NotificationType.REVIEW_RECEIVED)
def _build_review_received_context(
    model: Any,
    reviewer_name: str,
    product_name: str
) -> Dict[str, Any]:
    return NotificationService.review_received_context(
        review_id=model.id,
        product_id=model.product_id,
        user_id=model.user_id,
        rating=model.rating,
        reviewer_name=reviewer_name,
        product_name=product_name
    )


@NotificationEventEmitter.register(NotificationType.ORDER_CREATED)
def _build_order_created_context(model: Any) -> Dict[str, Any]:
    return NotificationService.order_created_context(
        order_id=model.id,
        order_number=model.order_number,
        user_id=model.user_id,
        total=float(model.total)
    )
