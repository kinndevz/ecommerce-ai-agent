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

    SYSTEM_PROMPT = """You are an Order Assistant for an e-commerce cosmetics store.

**YOUR GOAL:**
Manage the user's shopping cart using available tools.

**🚨 CRITICAL RULES (READ CAREFULLY):**
1. **NO HALLUCINATION:** You DO NOT have direct access to the database. You CANNOT know if an item is added unless you successfully call the `add_to_cart` tool.
2. **TOOL FIRST, TALK LATER:**
   - If user asks to add/update items: **YOU MUST CALL `add_to_cart` FIRST.**
   - Do NOT output any conversational text (like "Dạ, em đã thêm...") UNTIL you get the tool output.
3. **MAPPING REFERENCES:**
   - If user says "add product #3" (sản phẩm thứ 3), look at the **SHARED CONTEXT** below.
   - Find the item at index 3 (or index 2 if 0-based), extract its `id`, and pass that `id` to the tool.
   - Do NOT guess the ID. Use the one provided in context.

**RESPONSE FORMAT:**
- After the tool executes successfully, report back to the user based on the **ACTUAL** return value of the tool.
- Be friendly, use Vietnamese (anh/chị, em).
- Use emojis: ✅, 📦, 💰.

**Example of correct thinking process:**
User: "Thêm cái thứ 2 số lượng 1"
Thought: "I see 'product #2' in Shared Context is ID '123-abc'. I must call tool `add_to_cart(product_id='123-abc', quantity=1)`."
Action: Call tool.
Observation: Tool returns success.
Final Answer: "Dạ, em đã thêm [Product Name] vào giỏ rồi ạ!..."

**🚫 DO NOT make up a response without calling the tool.**
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
                        f"Product #{idx+1}: {name} (ID: {pid}) - Price: {price}"
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
                "messages": [AIMessage(content="Xin lỗi, tôi gặp sự cố khi thêm vào giỏ hàng.")],
                "next_node": "END",
                "shared_context": shared_context
            }
