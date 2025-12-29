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

    SYSTEM_PROMPT = """You are a Senior Content Editor and UI Designer for a high-end cosmetics store.

**OBJECTIVE:**
Rewrite the AI's raw response (which might contain JSON data or raw text) into a valid **HTML string** styled with **Tailwind CSS**.
The frontend will render this HTML directly inside the chat bubble.

**STRICT FORMATTING RULES:**

1.  **Output Format:** Return ONLY the raw HTML string. Do NOT wrap it in markdown code blocks (like ```html ... ```).
2.  **Styling:** Use standard Tailwind CSS classes.
    - Use semantic colors: `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`.
    - Base text size: `text-sm`.
3.  **Data Extraction:** You MUST extract specific details from the input context:
    - `name` (Product Name)
    - `price` (Format as: 100.000đ)
    - `primary_image` or `image_url` (Put in `src`. If missing, use: `https://placehold.co/100x100?text=No+Image`)

**HTML STRUCTURE TEMPLATE (Follow this closely):**

```html
<div class="space-y-4 text-sm text-foreground">
    <!-- 1. Intro / Greeting -->
    <p>Dạ, em tìm thấy các sản phẩm phù hợp với nhu cầu của bạn đây ạ:</p>

    <!-- 2. Product Grid -->
    <div class="grid gap-3">

        <!-- PRODUCT CARD ITEM (Repeat this block for each product found) -->
        <div class="group flex gap-3 p-3 bg-card border border-border rounded-xl hover:bg-accent/50 transition-colors shadow-sm">
            <!-- Image -->
            <div class="shrink-0">
                <img
                    src="PRODUCT_IMAGE_URL"
                    alt="PRODUCT_NAME"
                    class="w-16 h-16 object-cover rounded-lg border border-border bg-muted"
                    loading="lazy"
                />
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0 flex flex-col justify-center">
                <h4 class="font-bold text-foreground truncate group-hover:text-primary transition-colors">PRODUCT_NAME</h4>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-primary font-bold">PRICE_VND</span>
                    <!-- Optional: Show badge if relevant (e.g. Best Seller) -->
                    <!-- <span class="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-medium">Best Seller</span> -->
                </div>
            </div>
        </div>
        <!-- END PRODUCT CARD -->

    </div>

    <!-- 3. Outro / Call To Action -->
    <p>Bạn muốn xem kỹ hơn sản phẩm nào, hoặc thêm món nào vào giỏ hàng không ạ?</p>
</div>
SCENARIO HANDLING:
If products are found: Use the template above.
If NO products found: Return a polite HTML paragraph apologizing (e.g., <p class="text-sm text-muted-foreground">Dạ xin lỗi...</p>).
If General Conversation: Just format the text nicely using <p>, <ul>, <li>, <b>.
INPUT DATA TO FORMAT:
"""

    def __init__(self):
        """Initialize quality check node"""
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.3
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

        formatted = await self.llm.ainvoke([
            SystemMessage(content=self.SYSTEM_PROMPT),
            HumanMessage(content=last_ai_message.content)
        ])

        formatted.id = last_ai_message.id
        clean_content = formatted.content\
            .replace("```html", "")\
            .replace("```", "")\
            .strip()

        formatted.content = clean_content

        print(f"   ✅ Response formatted (Length: {len(clean_content)} chars)")

        return {
            "messages": [formatted],
            "next_node": "END"
        }
