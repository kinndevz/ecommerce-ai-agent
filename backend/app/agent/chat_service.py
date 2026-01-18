import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from app.models.conversation import Conversation, Message
from app.utils.responses import ResponseHandler
from app.agent.agent import get_unified_agent


class ChatService:
    @staticmethod
    async def send_message(
        db: Session,
        user_id: str,
        message_content: str,
        conversation_id: str = None,
        auth_token: str = None
    ):
        # Create or get conversation
        if conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()

            if not conversation:
                return ResponseHandler.not_found_error("Conversation", conversation_id)
        else:
            conversation = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                thread_id=f"thread_{uuid.uuid4().hex[:16]}",
                title=message_content[:100],
                created_at=datetime.now(timezone.utc)
            )
            db.add(conversation)
            db.flush()

        # Save user message
        user_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            role="user",
            content=message_content,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user_message)
        db.commit()

        # Get agent response
        agent = await get_unified_agent()
        result = await agent.chat(
            user_id=user_id,
            message=message_content,
            conversation_id=conversation.thread_id,
            auth_token=auth_token or ""
        )

        artifacts = result.get("artifacts", [])

        ai_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            role="assistant",
            content=result["content"],
            message_metadata={
                **result.get("metadata", {}),
                "artifacts": artifacts
            },
            created_at=datetime.now(timezone.utc)
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)

        # Return response with artifacts
        return ResponseHandler.success(
            message="Message sent",
            data={
                "conversation_id": conversation.id,
                "thread_id": conversation.thread_id,
                "message": {
                    "id": ai_message.id,
                    "role": ai_message.role,
                    "content": ai_message.content,
                    "artifacts": artifacts,
                    "message_metadata": ai_message.message_metadata,
                    "created_at": ai_message.created_at
                }
            }
        )

    @staticmethod
    def get_conversations(
        db: Session,
        user_id: str,
        page: int = 1,
        limit: int = 20
    ):
        """Get user's conversations"""
        from sqlalchemy import desc

        query = db.query(Conversation).filter(
            Conversation.user_id == user_id
        )

        total = query.count()

        conversations = query.order_by(
            desc(Conversation.updated_at)
        ).offset((page - 1) * limit).limit(limit).all()

        conversations_data = [
            {
                "id": conv.id,
                "thread_id": conv.thread_id,
                "title": conv.title,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "message_count": len(conv.messages)
            }
            for conv in conversations
        ]

        return ResponseHandler.success(
            message="Conversations retrieved successfully",
            data={
                "conversations": conversations_data,
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit
            }
        )

    @staticmethod
    def get_conversation_detail(
        db: Session,
        user_id: str,
        conversation_id: str
    ):
        """Get conversation with all messages"""
        conversation = db.query(Conversation).options(
            joinedload(Conversation.messages)
        ).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()

        if not conversation:
            return ResponseHandler.not_found_error("Conversation", conversation_id)

        conversation_data = {
            "id": conversation.id,
            "thread_id": conversation.thread_id,
            "title": conversation.title,
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "artifacts": msg.message_metadata.get("artifacts", []) if msg.message_metadata else [],
                    "message_metadata": msg.message_metadata,
                    "created_at": msg.created_at
                }
                for msg in conversation.messages
            ],
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        }

        return ResponseHandler.success(
            message="Conversation retrieved successfully",
            data=conversation_data
        )

    @staticmethod
    def delete_conversation(db: Session, user_id: str, conversation_id: str):
        """Delete a conversation"""
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()

        if not conversation:
            return ResponseHandler.not_found_error("Conversation", conversation_id)

        # Delete all messages first
        db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).delete()

        # Delete conversation
        db.delete(conversation)
        db.commit()

        return ResponseHandler.success(
            message="Conversation deleted",
            data={"conversation_id": conversation_id}
        )
