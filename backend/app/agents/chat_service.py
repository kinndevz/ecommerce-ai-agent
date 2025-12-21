"""
Chat service with single-agent LangGraph workflow
"""
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from langchain_core.messages import HumanMessage, AIMessage
from app.agents.interceptors import UserContext
from app.models.conversation import Conversation, Message
from app.utils.responses import ResponseHandler
from app.agents.graph import get_agent_graph
from app.agents.state import AgentState


class ChatService:

    @staticmethod
    async def send_message(
        db: Session,
        user_id: str,
        message_content: str,
        conversation_id: str = None,
        auth_token: str = None
    ):
        """
        Send message using single-agent LangGraph workflow

        Args:
            db: Database session
            user_id: User ID
            message_content: User's message
            conversation_id: Existing conversation ID (optional)
            auth_token: User's authentication token (for MCP tools)

        Returns:
            Response with AI's reply
        """

        # GET OR CREATE CONVERSATION
        if conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()

            if not conversation:
                return ResponseHandler.not_found_error("Conversation", conversation_id)
        else:
            # Create new conversation
            conversation = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                thread_id=f"thread_{uuid.uuid4().hex[:16]}",
                title=message_content[:100]
            )
            db.add(conversation)
            db.flush()

        # SAVE USER MESSAGE
        user_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            role="user",
            content=message_content
        )
        db.add(user_message)
        db.commit()

        # CREATE INITIAL STATE
        initial_state: AgentState = {
            # Conversation messages
            "messages": [HumanMessage(content=message_content)],

            # User context (secure - not visible to LLM)
            "user_id": user_id,
            "auth_token": auth_token or "",
            "conversation_id": conversation.id,

            # Loop control
            "loop_count": 0,
            "max_loops": 5  # Safety limit
        }

        # RUN AGENT GRAPH
        graph = await get_agent_graph()

        context = UserContext(
            user_id=user_id,
            auth_token=auth_token or ""
        )

        try:
            print("\n" + "="*80)
            print("🚀 STARTING AGENT WORKFLOW")
            print("="*80)
            print(f"   User: {user_id}")
            print(f"   Query: {message_content}")
            print(f"   Thread: {conversation.thread_id}")
            print("="*80 + "\n")

            # Run workflow with thread_id for conversation memory
            config = {
                "configurable": {"thread_id": conversation.thread_id},
                "context": context
            }

            final_state = await graph.ainvoke(initial_state, config)

            print("\n" + "="*80)
            print("✅ WORKFLOW COMPLETED")
            print("="*80)
            print(f"   Total loops: {final_state.get('loop_count', 0)}")
            print("="*80 + "\n")

            # EXTRACT AI RESPONSE
            ai_messages = [
                msg for msg in final_state["messages"]
                if isinstance(msg, AIMessage) and msg.content
            ]

            if ai_messages:
                ai_response = ai_messages[-1].content
            else:
                ai_response = "Xin lỗi, tôi không thể tạo phản hồi phù hợp."

        except Exception as e:
            print(f"\n❌ WORKFLOW ERROR: {e}")
            import traceback
            traceback.print_exc()

            ai_response = f"Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu: {str(e)}"

        # SAVE AI RESPONSE
        ai_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            role="assistant",
            content=ai_response,
            message_metadata={
                "loop_count": final_state.get("loop_count", 0) if 'final_state' in locals() else 0
            }
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)

        # FORMAT RESPONSE
        response_data = {
            "conversation_id": conversation.id,
            "thread_id": conversation.thread_id,
            "message": {
                "id": ai_message.id,
                "role": ai_message.role,
                "content": ai_message.content,
                "message_metadata": ai_message.message_metadata,
                "created_at": ai_message.created_at
            }
        }

        return ResponseHandler.success(
            message="Message sent successfully",
            data=response_data
        )

    @staticmethod
    def _get_conversation_history(
        conversation: Conversation,
        limit: int = 20
    ) -> list:
        """
        Get conversation history as LangChain messages

        Args:
            conversation: Conversation instance
            limit: Max number of messages to retrieve

        Returns:
            List of LangChain messages
        """
        messages = []

        for msg in conversation.messages[-limit:]:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))

        return messages

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
        from sqlalchemy.orm import joinedload

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
    def delete_conversation(
        db: Session,
        user_id: str,
        conversation_id: str
    ):
        """Delete a conversation"""

        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()

        if not conversation:
            return ResponseHandler.not_found_error("Conversation", conversation_id)

        db.delete(conversation)
        db.commit()

        return ResponseHandler.success(
            message="Conversation deleted successfully",
            data={"deleted_id": conversation_id}
        )
