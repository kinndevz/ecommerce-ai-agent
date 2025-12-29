import json
import traceback
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage
from langchain.agents import create_agent
from app.agents.interceptors import UserContext
from app.agents.state import AgentState
from app.agents.mcp_manager import mcp_manager
from app.core.config import settings


class ProductAgentNode:
    """Product specialist agent"""

    SYSTEM_PROMPT = """You are a product specialist for an e-commerce cosmetics store.

**GOAL:**
Help customers find products, verify prices, and answer questions using the available tools.

**GUIDELINES:**
1. **CHECK HISTORY FIRST:**
   - If the user asks about previously found products (e.g., "price of the first one"), use the chat history to answer. DO NOT call search tools again unnecessarily.

2. **NEW REQUESTS:**
   - Use search tools for new queries.
   - If no products are found, apologize politely.

3. **RESPONSE FORMAT:**
   - Present products clearly with Name, Price, Brand, and a brief description.
   - Be conversational and helpful.
"""

    def __init__(self):
        self.model_name = "gpt-4o-mini"
        self.agent = None
        self._initialized = False
        self.search_tool_names = set()

    async def initialize_agent(self):
        """Initialize agent and identify search tools dynamically"""
        if self._initialized:
            return

        tools = await mcp_manager.get_tools_for_agent("product")

        # 1. Tự động nhận diện Search Tools dựa trên Metadata hoặc Tên
        # Logic: Tool nào có category='search' HOẶC tên bắt đầu bằng 'search_' thì coi là tool tìm kiếm
        self.search_tool_names = {
            tool.name for tool in tools
            if tool.metadata.get("category") == "search" or tool.name.startswith("search_")
        }

        print(
            f"🔍 Product Agent detected search tools: {self.search_tool_names}")

        llm = ChatOpenAI(
            model=self.model_name,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.3
        )

        if tools:
            self.agent = create_agent(
                llm,
                tools,
                context_schema=UserContext
            )
        else:
            self.agent = llm

        self._initialized = True

    def _extract_products_from_messages(self, messages: list) -> list[dict]:
        """Extract product data from ToolMessages"""

        for msg in reversed(messages):
            if isinstance(msg, ToolMessage) and msg.name in self.search_tool_names:
                try:
                    content = msg.content

                    if isinstance(content, list) and len(content) > 0:
                        text_content = content[0].get('text', '')
                        print(f"DEBUG TOOL RESPONSE: {text_content[:1000]}...")
                        data = json.loads(text_content)
                        products = data.get('products', [])

                        if products:
                            print(
                                f"✅ Extracted {len(products)} products from {msg.name}")
                            return products

                except (json.JSONDecodeError, KeyError, IndexError) as e:
                    print(f"Parse error: {e}")
                    continue

        return []

    async def __call__(self, state: AgentState) -> dict:
        await self.initialize_agent()

        user_context_data = {
            "user_id": state.get("user_id", "unknown"),
            "auth_token": state.get("auth_token", "")
        }

        messages = [SystemMessage(content=self.SYSTEM_PROMPT)]
        messages.extend(state["messages"])

        try:
            result = await self.agent.ainvoke(
                {"messages": messages},
                context=user_context_data
            )

            output_messages = result.get("messages", [])

            called_tools = [
                msg.name for msg in output_messages
                if isinstance(msg, ToolMessage)
            ]
            print(f"🔧 Tools actually called: {called_tools}")

            # Extract products
            new_products = self._extract_products_from_messages(
                output_messages)

            # Update shared_context
            final_shared_context = state.get("shared_context", {}).copy()

            if new_products:
                final_shared_context["found_products"] = new_products
                print(f"📤 Sharing {len(new_products)} products to context")

            print(">>>>>> shared context", final_shared_context)
            return {
                "messages": [output_messages[-1]] if output_messages else [],
                "next_node": "quality_check",
                "shared_context": final_shared_context
            }

        except Exception:
            traceback.print_exc()
            return {
                "messages": [AIMessage(content="Xin lỗi, tôi gặp sự cố khi tìm kiếm sản phẩm.")],
                "next_node": "quality_check"
            }
