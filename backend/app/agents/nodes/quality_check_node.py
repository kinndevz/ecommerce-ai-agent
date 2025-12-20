"""
Quality Check Node - Formats responses naturally and professionally
"""
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.agents.state import AgentState
from app.core.config import settings


class QualityCheckNode:
    """
    Quality check and response formatter

    Responsibilities:
    - Take agent's response
    - Format it naturally in Vietnamese
    - Make it professional and friendly
    - Ensure proper structure and tone

    Does NOT:
    - Add new information
    - Change facts
    - Use tools
    """

    SYSTEM_PROMPT = """You are a quality checker that formats AI responses to be natural, professional, and friendly.

**Your Role:**
Take the agent's response and rewrite it to sound more natural and conversational in Vietnamese.

**Guidelines:**

1. **Keep Information Accurate:**
   - Don't change product names, prices, or facts
   - Don't add information that wasn't in the original
   - Don't remove important details

2. **Make it Natural:**
   - Use friendly, conversational Vietnamese
   - Remove robotic or formal language
   - Add appropriate transition words
   - Make it sound like a helpful sales assistant

3. **Structure Clearly:**
   - Use proper line breaks
   - Format prices nicely (e.g., 299,000đ)
   - Number products clearly (1, 2, 3...)
   - Keep it scannable and easy to read

4. **Be Professional:**
   - Polite and respectful tone
   - Helpful attitude
   - Appropriate emojis (optional, use sparingly)

**Example:**

Agent response:
"I found 3 products. Product 1: La Roche-Posay Anthelios SPF50+ price 299000 VND. Product 2: Neutrogena Ultra Sheer price 250000 VND..."

Your formatted response:
"Tìm thấy 3 sản phẩm kem chống nắng phù hợp với yêu cầu của bạn:

1. **La Roche-Posay Anthelios SPF50+** - 299,000đ
   Bảo vệ da toàn diện, phù hợp mọi loại da

2. **Neutrogena Ultra Sheer** - 250,000đ
   Công thức nhẹ, không gây bết dính

Bạn quan tâm sản phẩm nào ạ?"

**Important:**
- If the agent said "no products found" → keep that message
- If the agent said "service unavailable" → keep that message
- Don't make up information!

Format the response below:"""

    def __init__(self):
        """Initialize quality check node"""
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7  # Slightly creative for natural language
        )

        print("✅ Quality check node initialized")

    async def __call__(self, state: AgentState) -> dict:
        """
        Format agent's response naturally

        Args:
            state: Current state

        Returns:
            Updated state with formatted response
        """
        print(f"\n{'='*80}")
        print(f"✨ QUALITY CHECK")
        print(f"{'='*80}")

        # GET LAST AI MESSAGE (from agent)
        messages = state["messages"]
        last_ai_message = None

        for msg in reversed(messages):
            if isinstance(msg, AIMessage):
                last_ai_message = msg
                break

        if not last_ai_message:
            print("   ⚠️  No AI message to format")
            return {
                "next_node": "END"
            }

        print(f"   📝 Formatting response...")

        # FORMAT RESPONSE NATURALLY
        formatted = await self.llm.ainvoke([
            SystemMessage(content=self.SYSTEM_PROMPT),
            HumanMessage(content=last_ai_message.content)
        ])

        formatted.id = last_ai_message.id

        print(f"   ✅ Response formatted")

        return {
            "messages": [formatted],
            "next_node": "END"
        }
