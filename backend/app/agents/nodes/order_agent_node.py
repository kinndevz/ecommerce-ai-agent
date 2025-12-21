"""
Order Agent Node - Handles purchasing and cart operations
"""
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langchain_core.runnables import RunnableConfig
import traceback
from app.agents.interceptors import UserContext
from app.agents.state import AgentState
from app.agents.mcp_manager import mcp_manager
from app.core.config import settings


class OrderAgentNode:
    """Order specialist agent"""

    SYSTEM_PROMPT = """You are an Order Assistant for an e-commerce cosmetics store.

**YOUR GOAL:**
Help users add products to their cart and manage orders.

**CRITICAL RULE: USE SHARED CONTEXT**
The user might say "buy the first one" or "add CeraVe to cart".
You MUST look at the **SHARED CONTEXT** (provided below) to find the correct `product_id`.

1. **IF Context has products:**
   - Map user's request (e.g., "product #1") to the ID in the context list.
   - Call `add_to_cart(product_id=...)`.
   - Confirm success to the user.

2. **IF Context is empty or unclear:**
   - Ask the user to search for the product first (route back to product agent indirectly by asking "Which product do you want to find?").

**Tools available:**
- `add_to_cart`: Use this to add items.
- `get_cart`: Use this to show current cart.

**Response Style:**
Be helpful, confirm the exact product name and price added.
"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.3
        )
        self.tools: List[BaseTool] = []
        self.agent = None
        self._initialized = False
        print("✅ Order agent node initialized")

    async def initialize_tools(self):
        """Load tools from MCP (Agent: order)"""
        if self._initialized:
            return

        print("🔄 Loading order agent tools...")
        try:
            # 👇 QUAN TRỌNG: Load tools của 'order' agent
            self.tools = await mcp_manager.get_tools_for_agent("order")
            if self.tools:
                self.agent = self.llm.bind_tools(self.tools)
                self.tool_map = {tool.name: tool for tool in self.tools}
            else:
                self.agent = self.llm
                self.tool_map = {}
        except Exception as e:
            print(f"❌ Error loading order tools: {e}")
            self.agent = self.llm
            self.tool_map = {}

        self._initialized = True

    async def __call__(self, state: AgentState) -> dict:
        await self.initialize_tools()
        print(f"\n{'='*80}\n🛒 ORDER AGENT\n{'='*80}")

        # 1. Lấy Shared Context để Agent "nhìn thấy" sản phẩm
        shared_context = state.get("shared_context", {})
        found_products = shared_context.get("found_products", [])

        # Format context thành chuỗi để nhét vào Prompt
        context_str = "NO PRODUCTS FOUND IN HISTORY."
        if found_products:
            # Lấy data thô (List hoặc Dict)
            if isinstance(found_products, dict) and "products" in found_products:
                products_list = found_products["products"]
            elif isinstance(found_products, list):
                products_list = found_products
            else:
                products_list = []

            # Tạo text tóm tắt
            items_desc = []
            for idx, p in enumerate(products_list):
                # Handle cả trường hợp p là object hoặc string (dù hiếm)
                if isinstance(p, dict):
                    name = p.get("name", "Unknown")
                    pid = p.get("id", "NoID")
                    price = p.get("price", 0)
                    items_desc.append(
                        f"#{idx+1}: {name} (ID: {pid}) - {price}")

            if items_desc:
                context_str = "\n".join(items_desc)

        # 2. Inject Context vào System Prompt
        dynamic_prompt = f"{self.SYSTEM_PROMPT}\n\n=== CURRENT SHARED CONTEXT (RECENTLY FOUND PRODUCTS) ===\n{context_str}\n========================================================"

        messages = [SystemMessage(content=dynamic_prompt)]
        messages.extend(state["messages"][-10:])  # Lấy context gần nhất

        generated_messages = []

        # Loop thực thi
        max_iterations = 5
        iteration = 0

        while iteration < max_iterations:
            iteration += 1
            print(f"   📍 Iteration {iteration}")

            response = await self.agent.ainvoke(messages)
            generated_messages.append(response)
            messages.append(response)

            if not response.tool_calls:
                return {
                    "messages": generated_messages,
                    "next_node": "quality_check"  # Chuyển sang Quality Check để format
                }

            print(f"   🔧 Calling {len(response.tool_calls)} tool(s)")

            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]

                # --- Logic Interceptor thủ công (nếu không dùng thư viện) ---
                # Nhưng bạn đã có Interceptor xịn ở level MCPManager rồi nên cứ gọi tool bình thường
                # Trừ khi bạn muốn log debug

                tool_args = tool_call["args"]
                tool_id = tool_call["id"]
                tool = self.tool_map.get(tool_name)

                result_content = ""

                # --- LOGIC GỌI TOOL ---
                if tool:
                    try:
                        # ✅ THỰC HIỆN "MANUAL INTERCEPTOR" TẠI ĐÂY

                        # 1. Lấy token từ State
                        user_token = state.get("auth_token", "")

                        # 2. Tạo bản sao để thực thi (EXECUTION ARGS)
                        # Đây chính là việc mà Interceptor làm ngầm, giờ mình làm công khai
                        execution_args = tool_args.copy()

                        # 3. Nhét token vào bản sao
                        if user_token:
                            execution_args["token"] = user_token
                            print("   🔐 Auth token injected into request")

                        # 4. Log debug (Nhớ che token lại để không lộ log server)
                        log_args = execution_args.copy()
                        if "token" in log_args:
                            log_args["token"] = "***HIDDEN***"
                        print(
                            f"   👉 DEBUG CALL: {tool_name} | Args: {log_args}")

                        # 5. Gọi tool bằng BẢN SAO (Có token)
                        # MCP Server sẽ nhận được args có token và xử lý Header
                        result_content = await tool.ainvoke(execution_args)

                        # Order Agent thường thay đổi dữ liệu, ít khi cần update shared_context
                        # Trừ khi get_cart trả về cart mới, ta có thể lưu cart vào context nếu muốn.

                    except Exception as e:
                        print(f"❌ TOOL ERROR: {e}")
                        traceback.print_exc()
                        result_content = f"Error: {str(e)}"
                else:
                    result_content = f"Error: Tool {tool_name} not found"

                tool_msg = ToolMessage(content=str(
                    result_content), tool_call_id=tool_id)
                generated_messages.append(tool_msg)
                messages.append(tool_msg)

        return {
            "messages": [AIMessage(content="I'm having trouble processing your order.")],
            "next_node": "quality_check"
        }
