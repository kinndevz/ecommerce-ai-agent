import traceback
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from langchain.agents import create_agent
from app.agents.interceptors import UserContext
from app.agents.state import AgentState
from app.agents.mcp_manager import mcp_manager
from app.core.config import settings


class OrderAgentNode:
    """Order specialist agent"""

    # --- SỬA PROMPT MẠNH MẼ HƠN ---
    SYSTEM_PROMPT = """You are an Order Assistant for an e-commerce cosmetics store.

**YOUR GOAL:**
Help users add products to their cart based ONLY on their **LATEST** request.

**⚠️ CRITICAL RULES (MUST FOLLOW):**

1.  **IGNORE PAST ACTIONS:** 
    - Look at the chat history ONLY to identify *which* product is being discussed (e.g., "that product").
    - **NEVER** re-execute orders from previous turns.
    - If the user said "Add product A" 5 minutes ago, and now says "Add product B", **ONLY ADD B**. Do NOT add A again.

2.  **QUANTITY EXTRACTION:**
    - Listen carefully to the number the user wants (e.g., "lấy 3 cái", "thêm 2 hộp", "quantity 5").
    - You **MUST** pass this number to the `quantity` parameter of the `add_to_cart` tool.
    - **Default is 1** ONLY if the user does not specify a number.

3.  **USE SHARED CONTEXT:**
    - If user says "thêm cái này" (add this) or "lấy sản phẩm thứ 2" (get the 2nd product), look at the **SHARED CONTEXT** below to find the correct `product_id`.

**TOOLS:**
- `add_to_cart`: Use to add/update items.
- `get_cart`: Use to check status.
"""

    def __init__(self):
        self.model_name = "gpt-4o-mini"
        self.agent = None
        self._initialized = False

    async def initialize_agent(self):
        if self._initialized:
            return

        tools = await mcp_manager.get_tools_for_agent("order")

        llm = ChatOpenAI(
            model=self.model_name,
            api_key=settings.OPENAI_API_KEY,
            temperature=0  # Quan trọng: Temperature = 0 để giảm thiểu sự "sáng tạo" lung tung
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

    async def __call__(self, state: AgentState) -> dict:
        await self.initialize_agent()

        user_context_data = {
            "user_id": state.get("user_id", "unknown"),
            "auth_token": state.get("auth_token", "")
        }

        # Handle Shared Context (Giữ nguyên logic cũ của bạn)
        shared_context = state.get("shared_context", {})
        found_products = shared_context.get("found_products", [])
        context_str = "NO PRODUCTS FOUND IN HISTORY."

        if found_products:
            products_list = []
            if isinstance(found_products, dict) and "products" in found_products:
                products_list = found_products["products"]
            elif isinstance(found_products, list):
                products_list = found_products

            items_desc = []
            for idx, p in enumerate(products_list):
                if isinstance(p, dict):
                    name = p.get("name", "Unknown")
                    pid = p.get("id", "NoID")
                    price = p.get("price", 0)
                    # Thêm ID để AI dễ map
                    items_desc.append(
                        f"Product #{idx+1}: {name} (ID: {pid}) - {price}")

            if items_desc:
                context_str = "\n".join(items_desc)

        # Inject context + STRICT INSTRUCTION
        dynamic_prompt = f"""{self.SYSTEM_PROMPT}

=== 🛒 SHARED CONTEXT (SEARCH RESULTS) ===
{context_str}
==========================================

⚠️ **REMINDER:** Only process the user's **LAST** message. Do not repeat old orders.
"""

        messages = [SystemMessage(content=dynamic_prompt)]
        messages.extend(state["messages"])

        try:
            result = await self.agent.ainvoke(
                {"messages": messages},
                context=user_context_data
            )

            output_messages = result.get("messages", [])

            return {
                "messages": [output_messages[-1]] if output_messages else [],
                "next_node": "quality_check"
            }

        except Exception:
            traceback.print_exc()
            return {
                "messages": [AIMessage(content="Xin lỗi, tôi gặp sự cố khi xử lý đơn hàng.")],
                "next_node": "quality_check"
            }
