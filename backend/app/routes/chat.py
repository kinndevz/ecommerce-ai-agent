from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.agents.chat_service import ChatService
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.common import APIResponse

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=APIResponse[ChatResponse])
async def send_message(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send message to AI assistant

    Creates new conversation if conversation_id not provided.
    Routes to appropriate specialized agent based on query type.
    """
    return await ChatService.send_message(
        db,
        current_user.id,
        data.message,
        data.conversation_id
    )


@router.get("/conversations", response_model=dict)
def get_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's conversation list"""
    return ChatService.get_conversations(db, current_user.id, page, limit)


@router.get("/conversations/{conversation_id}", response_model=dict)
def get_conversation_detail(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get conversation with all messages"""
    return ChatService.get_conversation_detail(db, current_user.id, conversation_id)


@router.delete("/conversations/{conversation_id}", response_model=dict)
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation"""
    return ChatService.delete_conversation(db, current_user.id, conversation_id)
