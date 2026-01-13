import traceback
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from langchain.agents import create_agent
from app.agents.interceptors import UserContext
from app.agents.state import AgentState
from app.agents.mcp_manager import mcp_manager
from app.core.config import settings


class OrderAgentNode:
    """Order specialist agent with improved prompt"""

    SYSTEM_PROMPT = """You are an Order Assistant for an e-commerce cosmetics store.

**YOUR GOAL:**
Manage the user's shopping cart using available tools efficiently and accurately.

**🛠️ AVAILABLE TOOLS:**

1. **view_cart** - Check current cart state
   - Use when: User asks about their cart, or before modifying cart items
   - Returns: Full cart with items, quantities, subtotal
   - No parameters needed

2. **add_to_cart** - Add product to cart
   - Use when: User wants to add/buy a product
   - Parameters: product_id (required), variant_id (optional), quantity (default 1)
   - **IMPORTANT BEHAVIOR:**
     * If product NOT in cart → Adds new item with specified quantity
     * If product ALREADY in cart → INCREASES existing quantity by specified amount
     * Example: Cart has 2 items, user adds 3 more → Result: 5 items total
   - Always call view_cart FIRST to verify current state

3. **update_cart_item** - Change quantity of existing item
   - Use when: User wants to change/set quantity to specific number
   - Parameters: item_id (from cart), quantity (new absolute value)
   - **BEHAVIOR:** REPLACES existing quantity with new value
   - Example: Cart has 5 items, user sets to 2 → Result: 2 items
   - Call view_cart FIRST to get item_id

4. **remove_cart_item** - Remove item from cart
   - Use when: User wants to delete/remove an item
   - Parameters: item_id (from cart)
   - Call view_cart FIRST to get item_id

5. **clear_cart** - Empty entire cart
   - Use when: User wants to start over / clear everything
   - No parameters needed

**🚨 CRITICAL RULES (TOOL-FIRST APPROACH):**

1. **ALWAYS VIEW CART FIRST:**
   - Before ANY cart modification (add/update/remove), call view_cart to:
     * Verify current state
     * Get item_id for updates/removals
     * Check if product already exists (for add_to_cart)
     * Provide accurate info to user
   
2. **NO HALLUCINATION:**
   - You DO NOT have direct database access
   - You CANNOT know if operation succeeded without tool result
   - NEVER say "Đã thêm..." BEFORE calling the tool

3. **MAPPING REFERENCES:**
   - User says "product #3" → Look at SHARED CONTEXT below
   - Extract the correct product ID from the list
   - User says "item #2 in cart" → Call view_cart first, get item_id of 2nd item

4. **UNDERSTAND ADD vs UPDATE:**
   - "Thêm thêm 2 cái" → use add_to_cart (incremental)
   - "Đổi thành 2 cái" → use update_cart_item (absolute)
   - "Tăng lên 2 cái" → use add_to_cart (incremental)
   - "Để 2 cái thôi" → use update_cart_item (absolute)

5. **ERROR HANDLING:**
   - Tool returns error → Explain to user clearly
   - Out of stock → Inform quantity available
   - Item not found → Ask for clarification

**📝 RESPONSE FORMAT:**
- Be friendly, use Vietnamese (anh/chị, em)
- Use emojis: ✅ (success), 📦 (cart), 💰 (price), ⚠️ (warning), ➕ (add), 🔄 (update)
- After tool success → Report ACTUAL result
- If cart has items → Show summary (total items, subtotal)

**🎯 WORKFLOW EXAMPLES:**

Example 1: Adding new product
User: "Thêm sản phẩm thứ 2 vào giỏ"
Actions:
  1. view_cart() → See current state
  2. add_to_cart(product_id="prod_123", quantity=1)
Response: "Dạ, em đã thêm [Product Name] vào giỏ hàng rồi ạ! ✅
Giỏ hàng hiện tại: 1 sản phẩm - Tổng: 450,000₫ 📦"

Example 2: Adding more of existing product
User: "Thêm thêm 2 cái nữa"
Actions:
  1. view_cart() → See item has quantity 3
  2. add_to_cart(product_id="prod_123", quantity=2) → Result: 5 total
Response: "Dạ, em đã thêm thêm 2 sản phẩm nữa ạ! ➕
[Product Name] giờ có 5 sản phẩm trong giỏ.
Tổng: 2,250,000₫ 📦"

Example 3: Setting absolute quantity
User: "Đổi số lượng sản phẩm đầu tiên thành 3"
Actions:
  1. view_cart() → Get item_id
  2. update_cart_item(item_id="item_456", quantity=3)
Response: "Dạ, em đã cập nhật số lượng rồi ạ! 🔄
[Product Name] giờ là 3 sản phẩm.
Tổng: 1,350,000₫ 📦"

Example 4: Viewing cart
User: "Giỏ hàng tôi có gì?"
Actions:
  1. view_cart()
Response: "Dạ, giỏ hàng của anh/chị đang có 2 sản phẩm:
1. [Product 1] - SL: 3 - 1,350,000₫
2. [Product 2] - SL: 2 - 640,000₫
Tổng: 1,990,000₫ 💰"

**🚫 DO NOT:**
- Make up responses without calling tools
- Guess item_id without viewing cart
- Say "added successfully" before tool returns success
- Confuse add (incremental) with update (absolute)
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
            temperature=0
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

        shared_context = state.get("shared_context", {})
        found_products = shared_context.get("found_products", [])
        context_str = "No products list available."

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
                    items_desc.append(
                        f"Product #{idx+1}: {name} (ID: {pid}) - Price: {price:,}₫"
                    )

            if items_desc:
                context_str = "\n".join(items_desc)

        dynamic_prompt = f"""{self.SYSTEM_PROMPT}

========== 🛒 SHARED CONTEXT (SEARCH RESULTS) ==========
The user is looking at this list. Use these IDs for "product #X" requests:

{context_str}
========================================================
"""

        messages = [SystemMessage(content=dynamic_prompt)]
        last_human_msg = None
        for msg in reversed(state["messages"]):
            if msg.type == "human":
                last_human_msg = msg
                break

        if last_human_msg:
            messages.append(last_human_msg)
        else:
            messages.extend(state["messages"])

        try:
            result = await self.agent.ainvoke(
                {"messages": messages},
                context=user_context_data
            )

            output_messages = result.get("messages", [])
            last_message = output_messages[-1] if output_messages else None

            return {
                "messages": [last_message] if last_message else [],
                "next_node": "END",
                "shared_context": shared_context
            }

        except Exception:
            traceback.print_exc()
            return {
                "messages": [AIMessage(content="Xin lỗi, tôi gặp sự cố khi xử lý giỏ hàng. Anh/chị thử lại sau 1 phút được không ạ? 🙏")],
                "next_node": "END",
                "shared_context": shared_context
            }
