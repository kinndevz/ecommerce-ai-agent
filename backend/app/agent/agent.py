from typing import Optional, TypedDict, List, Dict, Any
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.store.memory import InMemoryStore
from langchain.agents.middleware import SummarizationMiddleware

from app.core.config import settings, get_checkpointer
from app.agent.mcp_manager import MCPManager
from app.agent.middleware import cosmetics_middleware, AgentStateWithContext


class RuntimeContext(TypedDict):
    user_id: str
    auth_token: str


class ToolArtifact(TypedDict):
    """Structured artifact from tool execution"""
    tool_name: str
    tool_call_id: str
    data: Dict[str, Any]
    success: bool


class UnifiedAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=settings.OPENAI_API_KEY
        )
        self.mcp_manager = MCPManager()
        self.store = InMemoryStore()
        self.agent = None

    async def get_agent(self):
        if self.agent is None:
            tools = await self.mcp_manager.get_all_tools()
            checkpointer = await get_checkpointer()

            summary_llm = ChatOpenAI(
                model="gpt-4o-mini",
                api_key=settings.OPENAI_API_KEY
            )

            self.agent = create_agent(
                model=self.llm,
                tools=tools,
                checkpointer=checkpointer,
                store=self.store,
                state_schema=AgentStateWithContext,
                context_schema=RuntimeContext,

                middleware=[
                    cosmetics_middleware,
                    SummarizationMiddleware(
                        model=summary_llm,
                        trigger=("tokens", 4000),
                        keep=("messages", 20),
                    ),
                ],
            )

        return self.agent

    def _extract_tool_artifacts(self, messages: List) -> List[ToolArtifact]:
        """Extract structured artifacts from ToolMessages"""
        artifacts = []

        for msg in messages:
            if isinstance(msg, ToolMessage):
                # Get artifact from ToolMessage
                artifact_data = getattr(msg, 'artifact', None)

                if artifact_data and isinstance(artifact_data, dict):
                    # Extract structured_content from MCP
                    structured = artifact_data.get('structured_content', {})

                    artifacts.append({
                        "tool_name": msg.name,
                        "tool_call_id": msg.tool_call_id,
                        "data_mcp": structured if structured else artifact_data,
                        "success": structured.get('success', True) if structured else True
                    })

        return artifacts

    async def chat(
        self,
        user_id: str,
        message: str,
        conversation_id: str,
        auth_token: str
    ) -> dict:
        agent = await self.get_agent()

        input_payload = {
            "messages": [HumanMessage(content=message)],
            "user_context": {
                "user_id": user_id,
                "auth_token": auth_token
            }
        }

        runtime_context = {
            "user_id": user_id,
            "auth_token": auth_token
        }

        config = {
            "configurable": {
                "thread_id": conversation_id
            }
        }

        try:
            result = await agent.ainvoke(
                input_payload,
                config=config,
                context=runtime_context
            )

            # Extract AI response
            ai_message = result["messages"][-1]
            ai_content = ai_message.content if hasattr(
                ai_message, 'content') else ""

            # Extract tool artifacts
            artifacts = self._extract_tool_artifacts(result["messages"])

            # Count tool calls
            tool_calls_count = sum(
                1 for m in result["messages"]
                if hasattr(m, "tool_calls") and m.tool_calls
            )

            return {
                "content": ai_content,
                "artifacts": artifacts,  # ✅ NEW: List of tool results
                "metadata": {
                    "tool_calls": tool_calls_count,
                    "has_artifacts": len(artifacts) > 0
                }
            }
        except Exception as e:
            print(f"[Agent Error] {e}")
            import traceback
            traceback.print_exc()
            return {
                "content": "Xin lỗi! Vui lòng thử lại!",
                "artifacts": [],
                "metadata": {"error": str(e)}
            }


_instance: Optional[UnifiedAgent] = None


async def get_unified_agent() -> UnifiedAgent:
    global _instance
    if _instance is None:
        _instance = UnifiedAgent()
    return _instance
