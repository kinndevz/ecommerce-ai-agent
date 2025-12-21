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
        self.model_name = "gpt-4o-mini"
        self.agent = None
        self._initialized = False

    async def initialize_agent(self):
        """Initialize agent with MCP tools and Context Schema"""
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

        # Handle Shared Context
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
                    items_desc.append(
                        f"#{idx+1}: {name} (ID: {pid}) - {price}")

            if items_desc:
                context_str = "\n".join(items_desc)

        dynamic_prompt = f"{self.SYSTEM_PROMPT}\n\n=== CURRENT SHARED CONTEXT (RECENTLY FOUND PRODUCTS) ===\n{context_str}\n========================================================"

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
                "messages": [AIMessage(content="Sorry, I encountered an error processing your           order.")],
                "next_node": "quality_check"
            }
