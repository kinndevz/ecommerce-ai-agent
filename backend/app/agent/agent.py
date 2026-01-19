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
        artifacts = []
        for msg in messages:
            if isinstance(msg, ToolMessage):
                raw_artifact = getattr(msg, 'artifact', None)

                if raw_artifact:
                    data_payload = {}
                    if isinstance(raw_artifact, dict) and "structured_content" in raw_artifact:
                        data_payload = raw_artifact["structured_content"]
                    else:
                        data_payload = raw_artifact

                    artifacts.append({
                        "tool_name": msg.name,
                        "tool_call_id": msg.tool_call_id,
                        "data_mcp": data_payload,
                        "success": True
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
            "user_context": {"user_id": user_id, "auth_token": auth_token}
        }

        config = {"configurable": {"thread_id": conversation_id}}
        runtime_context = {"user_id": user_id, "auth_token": auth_token}

        try:
            result = await agent.ainvoke(
                input_payload,
                config=config,
                context=runtime_context
            )

            all_messages = result["messages"]

            last_human_index = -1
            for i in range(len(all_messages) - 1, -1, -1):
                if isinstance(all_messages[i], HumanMessage):
                    last_human_index = i
                    break

            start_index = last_human_index + 1 if last_human_index != -1 else 0
            current_turn_messages = all_messages[start_index:]

            called_tools = []
            for msg in current_turn_messages:
                if isinstance(msg, AIMessage) and hasattr(msg, 'tool_calls') and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        called_tools.append(tool_call['name'])
                elif isinstance(msg, ToolMessage):
                    called_tools.append(msg.name)  # msg.name là tên tool

            if called_tools:
                print(
                    f"⚙️ [{user_id}] Tools called in this turn: {', '.join(called_tools)}")
            else:
                print(f"💬 [{user_id}] No tools called in this turn.")

            artifacts = self._extract_tool_artifacts(current_turn_messages)

            tool_calls_count = sum(
                len(m.tool_calls)
                for m in current_turn_messages
                if isinstance(m, AIMessage) and hasattr(m, "tool_calls") and m.tool_calls
            )

            ai_message = all_messages[-1]
            ai_content = ai_message.content if hasattr(
                ai_message, 'content') else ""

            return {
                "content": ai_content,
                "artifacts": artifacts,
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
