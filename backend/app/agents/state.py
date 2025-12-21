from typing import Annotated, TypedDict, Optional, Any
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    State for agent system with supervisor routing
    """
    # MESSAGES - Conversation history
    messages: Annotated[list[BaseMessage], add_messages]

    # ROUTING - Controlled by supervisor
    next_node: Optional[str]  # Which node to visit next

    # USER CONTEXT (secure - not visible to LLM)
    user_id: str
    auth_token: str
    conversation_id: Optional[str]

    shared_context: dict[str, Any]
