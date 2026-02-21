from typing import Optional, List, Dict, Any
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.store.memory import InMemoryStore
from langchain.agents.middleware import SummarizationMiddleware
import logging
from app.core.config import settings, get_checkpointer
from app.agent.mcp_manager import mcp_manager
from app.agent.middleware import (
    AgentStateWithContext,
    cosmetics_middleware,
    handle_tool_errors,
    enforce_plain_text
)

logger = logging.getLogger(__name__)


class RuntimeContext(dict):
    """Runtime context passed to tools via ToolRuntime."""

    def __init__(self, user_id: str, auth_token: str):
        super().__init__(user_id=user_id, auth_token=auth_token)
        self.user_id = user_id
        self.auth_token = auth_token


class UnifiedAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=settings.OPENAI_API_KEY
        )
        self.store = InMemoryStore()
        self._agent = None

    async def get_agent(self):
        if self._agent is None:
            tools = await mcp_manager.get_all_tools()
            checkpointer = await get_checkpointer()

            self._agent = create_agent(
                model=self.llm,
                tools=tools,
                checkpointer=checkpointer,
                store=self.store,
                state_schema=AgentStateWithContext,
                context_schema=RuntimeContext,
                middleware=[
                    handle_tool_errors,
                    cosmetics_middleware,
                    enforce_plain_text,
                    SummarizationMiddleware(
                        model=ChatOpenAI(model="gpt-4o-mini",
                                         api_key=settings.OPENAI_API_KEY),
                        trigger=("tokens", 4000),
                        keep=("messages", 20),
                    ),
                ],
            )
            logger.info("✅ Agent initialized with %d tools", len(tools))

        return self._agent

    async def chat(
        self,
        user_id: str,
        message: str,
        conversation_id: str,
        auth_token: str,
        preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        agent = await self.get_agent()

        input_payload = {
            "messages": [HumanMessage(content=message)],
            "user_context": {"user_id": user_id,
                             "auth_token": auth_token,
                             "preferences": preferences or {}}
        }

        config = {"configurable": {"thread_id": conversation_id}}
        context = RuntimeContext(user_id=user_id, auth_token=auth_token)

        try:
            result = await agent.ainvoke(input_payload, config=config, context=context)
            return self._process_result(result, user_id)

        except Exception as e:
            logger.exception(f"Agent error for user {user_id}")
            return {
                "content": "Xin lỗi! Đã có lỗi xảy ra. Vui lòng thử lại!",
                "artifacts": [],
                "metadata": {"error": str(e)}
            }

    def _process_result(self, result: Dict, user_id: str) -> Dict[str, Any]:
        """Extract content and artifacts from agent result."""
        all_messages = result.get("messages", [])

        # Find current turn messages (after last HumanMessage)
        current_turn = self._get_current_turn_messages(all_messages)

        # Log tool usage
        called_tools = self._get_called_tools(current_turn)
        if called_tools:
            print(f"[{user_id}] Tools: {', '.join(called_tools)}")
            logger.info(f"[{user_id}] Tools: {', '.join(called_tools)}")

        # Extract artifacts
        artifacts = self._extract_artifacts(current_turn)

        # Get final AI response (prefer latest AIMessage)
        ai_content = ""
        for msg in reversed(all_messages):
            if isinstance(msg, AIMessage) and hasattr(msg, "content"):
                ai_content = msg.content
                break

        return {
            "content": ai_content,
            "artifacts": artifacts,
            "metadata": {
                "tool_calls": len(called_tools),
                "called_tools": called_tools,
                "has_artifacts": len(artifacts) > 0
            }
        }

    def _get_current_turn_messages(self, messages: List) -> List:
        """Get messages from current turn (after last HumanMessage)."""
        last_human_idx = -1
        for i in range(len(messages) - 1, -1, -1):
            if isinstance(messages[i], HumanMessage):
                last_human_idx = i
                break

        start = last_human_idx + 1 if last_human_idx >= 0 else 0
        return messages[start:]

    def _get_called_tools(self, messages: List) -> List[str]:
        """Extract list of tool names called in messages."""
        tools: List[str] = []
        for msg in messages:
            if isinstance(msg, AIMessage) and getattr(msg, 'tool_calls', None):
                tools.extend(tc['name'] for tc in msg.tool_calls)
            elif isinstance(msg, ToolMessage):
                tools.append(msg.name)
        # Deduplicate while preserving order
        return list(dict.fromkeys(tools))

    def _extract_artifacts(self, messages: List) -> List[Dict]:
        """Extract structured artifacts from ToolMessages."""
        artifacts = []
        for msg in messages:
            if not isinstance(msg, ToolMessage):
                continue

            raw = getattr(msg, 'artifact', None)
            if not raw:
                continue

            data = raw.get("structured_content", raw) if isinstance(
                raw, dict) else raw
            artifacts.append({
                "tool_name": msg.name,
                "tool_call_id": msg.tool_call_id,
                "data_mcp": data,
                "success": getattr(msg, 'status', None) != "error"
            })

        return artifacts


# Singleton
_instance: Optional[UnifiedAgent] = None


async def get_unified_agent() -> UnifiedAgent:
    global _instance
    if _instance is None:
        _instance = UnifiedAgent()
    return _instance
