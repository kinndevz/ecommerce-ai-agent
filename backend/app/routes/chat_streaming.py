from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Tuple
from app.db.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.utils.deps import get_current_user_with_token
from app.schemas.chat import ChatRequest
from app.agent.chat_service import ChatService
from app.services.streaming import get_streaming_service
from app.utils.responses import ResponseHandler

router = APIRouter(prefix="/chat", tags=["Chat Streaming"])


@router.post("/conversations/{conversation_id}/messages/stream")
async def stream_message(
    conversation_id: str,
    data: ChatRequest,
    user_and_token: Tuple[User, str] = Depends(get_current_user_with_token),
    db: Session = Depends(get_db)
):
    user, token = user_and_token

    # Verify conversation
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id
    ).first()

    if not conversation:
        ResponseHandler.not_found_error(
            resource_name="Conversation",
            resource_id=conversation_id
        )

    # Get services
    chat_service = ChatService()
    streaming_service = get_streaming_service()

    return StreamingResponse(
        streaming_service.stream_response(
            db=db,
            user_id=user.id,
            conversation_id=conversation_id,
            message_content=data.message,
            chat_service=chat_service,
            auth_token=token,
            is_active=data.is_active
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*"
        }
    )


@router.post("/messages/stream")
async def stream_new_conversation(
    data: ChatRequest,
    user_and_token: Tuple[User, str] = Depends(get_current_user_with_token),
    db: Session = Depends(get_db)
):
    """
    Send message and stream response (creates new conversation if needed)

    Same as `/conversations/{id}/messages/stream` but handles conversation creation
    """
    user, token = user_and_token

    # Use provided conversation_id or create new
    conversation_id = data.conversation_id

    if conversation_id:
        # Verify exists
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        ).first()

        if not conversation:
            ResponseHandler.not_found_error(
                resource_name="Conversation",
                resource_id=conversation_id
            )

    # Get services
    chat_service = ChatService()
    streaming_service = get_streaming_service()

    return StreamingResponse(
        streaming_service.stream_response(
            db=db,
            user_id=user.id,
            conversation_id=conversation_id,
            message_content=data.message,
            chat_service=chat_service,
            auth_token=token,
            is_active=data.is_active
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*"
        }
    )
