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

**YOUR JOB:**
Help customers find products using search tools.

**RESPONSE FORMAT (CRITICAL - ALWAYS FOLLOW):**

When you find products, return HTML like this (WITHOUT markdown code blocks):

<div class="space-y-3">
  <p class="text-base mb-3">Dạ, em tìm thấy <strong class="text-primary">{số lượng}</strong> sản phẩm phù hợp ạ:</p>
  
  <div class="grid gap-3">
    <!-- Product Card -->
    <div class="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
      <div class="flex gap-3 p-3">
        <img src="{product.image_url}" alt="{product.name}" class="w-24 h-24 object-cover rounded-md flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base mb-1 line-clamp-2">{product.name}</h3>
          <p class="text-lg font-bold text-primary">{product.price}₫</p>
        </div>
      </div>
    </div>
  </div>
  
  <p class="text-sm text-muted-foreground mt-3">💬 <em>Anh/chị muốn thêm sản phẩm nào vào giỏ hàng không ạ?</em></p>
</div>

**CRITICAL RULES:**
- Return ONLY the HTML - do NOT wrap in ```html or ``` markdown blocks
- Show ONLY: Image, Product Name, Price
- NO brand, NO description, NO rating
- If no products found: "Dạ, em không tìm thấy sản phẩm phù hợp ạ 😔"
- Be friendly, use "anh/chị" and "em"
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

        # Identify search tools
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

    def _clean_html_response(self, content: str) -> str:
        clean_content = content\
            .replace("```html", "")\
            .replace("```", "")\
            .strip()

        return clean_content

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

            if output_messages:
                last_message = output_messages[-1]
                if isinstance(last_message, AIMessage):
                    clean_content = self._clean_html_response(
                        last_message.content)
                    last_message.content = clean_content
                    print(
                        f"Cleaned response (Length: {len(clean_content)} chars)")

            return {
                "messages": [output_messages[-1]] if output_messages else [],
                "next_node": "END",
                "shared_context": final_shared_context
            }

        except Exception:
            traceback.print_exc()
            return {
                "messages": [AIMessage(content="Xin lỗi, tôi gặp sự cố khi tìm kiếm sản phẩm.")],
                "next_node": "END",
                "shared_context": state.get("shared_context", {})
            }
