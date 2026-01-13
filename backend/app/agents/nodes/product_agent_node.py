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
    """Product specialist agent handling search and data normalization."""

    SYSTEM_PROMPT = """You are a product specialist for an e-commerce cosmetics store.

**YOUR JOB:**
Help customers find products using search tools.

**RESPONSE FORMAT:**
Return ONLY HTML (NO markdown blocks) following this structure:

<div class="space-y-3">
  <p class="text-base mb-3">Dạ, em tìm thấy <strong class="text-primary">{count}</strong> sản phẩm phù hợp ạ:</p>

  <div class="grid gap-3">
    <div class="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card">
      <div class="flex gap-3 p-3">
        <img src="{product_image}" alt="{name}" class="w-24 h-24 object-cover rounded-md flex-shrink-0" onerror="this.src='https://placehold.co/100?text=No+Image'">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base mb-1 line-clamp-2">{name}</h3>
          <p class="text-lg font-bold text-primary">{display_price}</p>
        </div>
      </div>
    </div>
  </div>

  <p class="text-sm text-muted-foreground mt-3">💬 <em>Anh/chị muốn thêm sản phẩm nào vào giỏ hàng không ạ?</em></p>
</div>

**CRITICAL RULES:**
1. **DISPLAY LOGIC**: You MUST render **ALL** products present in the `data` array returned by the tool. Do NOT filter them out yourself.
2. **COUNTING**: The number in the text MUST match the actual number of product cards displayed.
3. **NO MARKDOWN**: Return raw HTML string only.
4. **EMPTY STATE**: If `data` is empty, say: "Dạ, em không tìm thấy sản phẩm phù hợp ạ 😔"
"""

    def __init__(self):
        self.model_name = "gpt-4o-mini"
        self.agent = None
        self._initialized = False
        self.search_tool_names = set()

    async def initialize_agent(self):
        if self._initialized:
            return

        tools = await mcp_manager.get_tools_for_agent("product")

        self.search_tool_names = {
            tool.name for tool in tools
            if tool.metadata.get("category") == "search" or tool.name.startswith("search_")
        }

        print(
            f"🔍 Product Agent initialized with tools: {self.search_tool_names}")

        llm = ChatOpenAI(
            model=self.model_name,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.3
        )

        if tools:
            self.agent = create_agent(llm, tools, context_schema=UserContext)
        else:
            self.agent = llm

        self._initialized = True

    def _extract_products_from_messages(self, messages: list) -> list[dict]:
        for msg in reversed(messages):
            if isinstance(msg, ToolMessage) and msg.name in self.search_tool_names:
                try:
                    text_content = ""
                    if isinstance(msg.content, str):
                        text_content = msg.content
                    elif isinstance(msg.content, list) and len(msg.content) > 0:
                        block = msg.content[0]
                        if isinstance(block, dict):
                            text_content = block.get('text', '')
                        elif hasattr(block, 'text'):
                            text_content = block.text

                    if not text_content:
                        continue

                    data = json.loads(text_content)

                    products = []
                    if isinstance(data, dict):
                        products = data.get('data') or data.get(
                            'products') or []
                    elif isinstance(data, list):
                        products = data

                    if not products:
                        continue

                    cleaned_products = []
                    for p in products:
                        if not p.get('product_image'):
                            p['product_image'] = "https://placehold.co/100?text=No+Image"

                        price = p.get('price', 0)
                        p['display_price'] = f"{int(price):,}₫"

                        cleaned_products.append(p)

                    print(
                        f"Extracted {len(cleaned_products)} products from {msg.name}")
                    return cleaned_products

                except Exception as e:
                    print(f"Extraction error: {e}")
                    continue
        return []

    def _clean_html_response(self, content: str) -> str:
        return content.replace("```html", "").replace("```", "").strip()

    async def __call__(self, state: AgentState) -> dict:
        await self.initialize_agent()

        user_context_data = {
            "user_id": state.get("user_id", "unknown"),
            "auth_token": state.get("auth_token", "")
        }

        messages = [SystemMessage(
            content=self.SYSTEM_PROMPT)] + state["messages"]

        try:
            result = await self.agent.ainvoke(
                {"messages": messages},
                context=user_context_data
            )

            output_messages = result.get("messages", [])
            new_products = self._extract_products_from_messages(
                output_messages)

            final_shared_context = state.get("shared_context", {}).copy()
            if new_products:
                final_shared_context["found_products"] = new_products

            if output_messages:
                last_msg = output_messages[-1]
                if isinstance(last_msg, AIMessage):
                    last_msg.content = self._clean_html_response(
                        last_msg.content)

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
