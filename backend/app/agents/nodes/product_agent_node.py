from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langchain_core.runnables import RunnableConfig

from app.agents.state import AgentState
from app.agents.mcp_manager import mcp_manager
from app.core.config import settings
import json


class ProductAgentNode:
    """Product specialist agent"""

    SYSTEM_PROMPT_WITH_TOOLS = """You are a product specialist for an e-commerce cosmetics store.

**Your Role:**
Help customers find products, verify prices, and ANSWER QUESTIONS based on search results.

**GUIDELINES:**

1. **CHECK HISTORY FIRST (Crucial):**
   - Before searching, look at the conversation history.
   - If the user asks about previously found products (e.g., "total price", "price of the 2nd one", "compare them"), USE THE DATA IN THE HISTORY to answer.
   - **DO NOT** call search tools if you already have the information in the chat history.
   - YOU CAN calculate totals, compare prices, or summarize details from previous messages.

2. **Use Search Tools for NEW Requests:**
   - If the user asks for a NEW product not in history, use `search_products`.
   - If tool returns no results → tell user "no products found".

3. **Present Results Clearly:**
   Format:
   "Tìm thấy [X] sản phẩm:
   
   1. **[Name]** - [Price]đ
      Brand: [Brand]
      [Brief description]
   
   2. **[Name]** - [Price]đ
      ..."

4. **Be Conversational:**
   - Remember context. "Product #2" means the second item in the previous list.

Be accurate and helpful!"""

    SYSTEM_PROMPT_NO_TOOLS = """You are a product specialist, but your search tools are unavailable.

Tell the user:
"Xin lỗi, hệ thống tìm kiếm sản phẩm hiện đang bảo trì. Vui lòng thử lại sau. Cảm ơn!"

Be brief and polite."""

    def __init__(self):
        """Initialize product agent"""
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.3
        )

        self.tools: List[BaseTool] = []
        self.agent = None
        self._initialized = False

        print("✅ Product agent node initialized")

    async def initialize_tools(self):
        """Load tools from MCP"""
        if self._initialized:
            return

        print("🔄 Loading product agent tools...")

        try:
            self.tools = await mcp_manager.get_tools_for_agent("product")

            if self.tools:
                self.agent = self.llm.bind_tools(self.tools)
                self.tool_map = {tool.name: tool for tool in self.tools}
                print(f"✅ Loaded {len(self.tools)} tool(s)")
            else:
                self.agent = self.llm
                self.tool_map = {}
                print("⚠️  No tools available")

        except Exception as e:
            print(f"❌ Error loading tools: {e}")
            self.agent = self.llm
            self.tool_map = {}

        self._initialized = True

    def _process_tool_result(self, tool_name: str, result_content: str, context_accumulator: Dict):
        """
        Private method: Xử lý kết quả tool dựa trên METADATA (Clean Code Pattern)
        Không quan tâm tên tool là gì, chỉ quan tâm category của nó.
        """
        tool = self.tool_map.get(tool_name)
        if not tool:
            return

        # Lấy metadata đã được MCPManager parse
        metadata = getattr(tool, "metadata", {})
        category = metadata.get("category", "")

        if category == "search":
            try:
                data = json.loads(str(result_content))

                # Validate cấu trúc dữ liệu cơ bản
                if isinstance(data, (list, dict)):
                    print(
                        f"      💾 Auto-saving '{tool_name}' output (Category: search)")
                    # Merge thông minh hoặc overwrite
                    context_accumulator["found_products"] = data
            except json.JSONDecodeError:
                pass  # Tool search nhưng trả về lỗi text -> bỏ qua

    async def __call__(self, state: AgentState) -> dict:
        await self.initialize_tools()
        print(f"\n{'='*80}\n🛍️  PRODUCT AGENT\n{'='*80}")

        # Check tools
        if not self.tools:
            response = await self.llm.ainvoke([
                SystemMessage(content=self.SYSTEM_PROMPT_NO_TOOLS),
                *state["messages"][-5:]
            ])
            return {"messages": [response], "next_node": "quality_check"}

        messages = [SystemMessage(content=self.SYSTEM_PROMPT_WITH_TOOLS)]
        messages.extend(state["messages"][-10:])  # Lấy context gần nhất

        generated_messages = []

        found_products_context = {}

        max_iterations = 5
        iteration = 0

        while iteration < max_iterations:
            iteration += 1
            print(f"   📍 Iteration {iteration}")

            response = await self.agent.ainvoke(messages)

            # Lưu vào list trả về & list cục bộ
            generated_messages.append(response)
            messages.append(response)

            # Nếu không gọi tool nữa -> Xong
            if not response.tool_calls:
                print(f">>>>>Response ready")
                return {
                    "messages": generated_messages,
                    "next_node": "quality_check",
                    "shared_context": found_products_context
                }

            print(f"   🔧 Calling {len(response.tool_calls)} tool(s)")

            # 2. Thực thi Tools
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]

                tool = self.tool_map.get(tool_name)
                result_content = ""

                if tool:
                    try:
                        config = RunnableConfig(configurable={
                            "auth_token": state.get("auth_token", ""),
                            "user_id": state.get("user_id", "")
                        })
                        result_content = await tool.ainvoke(tool_args, config=config)

                        self._process_tool_result(
                            tool_name, result_content, found_products_context)

                        print(">>>>>> shared context", found_products_context)

                    except Exception as e:
                        result_content = f"Error: {str(e)}"
                else:
                    result_content = f"Error: Tool {tool_name} not found"

                # Tạo ToolMessage
                tool_msg = ToolMessage(content=str(
                    result_content), tool_call_id=tool_id)

                # Lưu vào list trả về & list cục bộ
                generated_messages.append(tool_msg)
                messages.append(tool_msg)

        return {
            "messages": [AIMessage(content="Sorry, I'm stuck.")],
            "next_node": "quality_check"
        }
