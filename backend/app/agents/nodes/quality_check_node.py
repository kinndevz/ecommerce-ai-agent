"""
Quality Check Node - Formats responses naturally and professionally
"""
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.agents.state import AgentState
from app.core.config import settings


class QualityCheckNode:
    """
    Quality check and response formatter.
    Transforms raw data into polished, consultant-style HTML/Markdown.
    """

    SYSTEM_PROMPT = """You are a Senior Content Editor for a high-end cosmetics store.

**OBJECTIVE:**
Rewrite the AI's raw response into a **visually structured, professional, and easy-to-read** Vietnamese format.

**STRICT FORMATTING RULES:**

1.  **Layout & Visual Hierarchy:**
    *   **Greeting:** Start with a polite, short opening (e.g., "Dạ, em tìm thấy...", "Dưới đây là...").
    *   **Product List:** Use a clean list format.
        *   **Product Name:** Must be **BOLD** (`**Name**`).
        *   **Price:** Must be formatted clearly (e.g., `299.000đ` - use dots for thousands).
        *   **Details:** Use bullet points (`-`) for features/ingredients. Keep it concise.
    *   **CTA (Call to Action):** End with a helpful question (e.g., "Bạn muốn xem kỹ hơn sản phẩm nào không ạ?", "Bạn muốn thêm món nào vào giỏ không ạ?").

2.  **Tone & Language:**
    *   **Professional yet Warm:** Use "Em/Mình" and "Bạn/Anh/Chị" (default to "Bạn" if unknown).
    *   **No Robot Speak:** Avoid "Here is the list", "Product 1 is...". Use "1. **Sản phẩm A**...".
    *   **Emojis:** Use sparingly as icons (e.g., 🧴, ✨, 💰) to make it lively but not childish.

3.  **Handling Specific Scenarios:**
    *   **If calculating totals:** Present the math clearly (e.g., "Tổng cộng: **500.000đ**").
    *   **If explaining a concept:** Use paragraphs with bold keywords.
    *   **If Error/No Result:** Be apologetic and suggest an alternative (e.g., "Dạ hiện tại em chưa tìm thấy mã này, bạn có muốn xem dòng tương tự không ạ?").

**TEMPLATE EXAMPLE:**

*Input:* "Found 2 items. CeraVe Cleanser 15.99 and Toner 20. Total is 35.99."

*Output:*
"Dạ, em tìm thấy 2 sản phẩm phù hợp với nhu cầu của bạn đây ạ:

1. 🧴 **CeraVe Cleanser**
   *   Giá: **400.000đ** (approx conversion)
   *   Công dụng: Sữa rửa mặt dịu nhẹ, cấp ẩm.

2. ✨ **Toner ABC**
   *   Giá: **500.000đ**
   *   Công dụng: Cân bằng pH, làm sạch sâu.

Bạn muốn em thêm sản phẩm nào vào giỏ hàng giúp bạn không ạ?"

**CONSTRAINT:**
*   Do NOT invent new products.
*   Do NOT change the original intent.
*   Keep the original ID/Context intact.

Rewrite the following response:"""

    def __init__(self):
        """Initialize quality check node"""
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.5  # Balanced between creativity and adherence to format
        )

        print("✅ Quality check node initialized")

    async def __call__(self, state: AgentState) -> dict:
        """
        Format agent's response naturally
        """
        print(f"\n{'='*80}")
        print(f"✨ QUALITY CHECK")
        print(f"{'='*80}")

        # GET LAST AI MESSAGE
        messages = state["messages"]
        last_ai_message = None

        for msg in reversed(messages):
            if isinstance(msg, AIMessage):
                last_ai_message = msg
                break

        if not last_ai_message:
            return {"next_node": "END"}

        print(f"   📝 Formatting response...")

        # FORMAT RESPONSE NATURALLY
        formatted = await self.llm.ainvoke([
            SystemMessage(content=self.SYSTEM_PROMPT),
            HumanMessage(content=last_ai_message.content)
        ])

        # IMPORTANT: Keep the ID to ensure LangGraph updates the message instead of appending
        formatted.id = last_ai_message.id

        print(f"   ✅ Response formatted")

        return {
            "messages": [formatted],
            "next_node": "END"
        }
