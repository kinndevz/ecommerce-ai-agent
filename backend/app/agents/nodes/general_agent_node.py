from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import AgentState
from app.core.config import settings


class GeneralAgentNode:
    """
    Handles general conversation (Greetings, Thanks, Small talk)
    """

    SYSTEM_PROMPT = """You are a helpful customer support assistant for a cosmetics store.

**Your Role:**
Handle small talk, greetings, and closing conversations politely.

**Guidelines:**
1. **Greetings:** Welcome the user warmly. Ask if they need help finding skincare products.
2. **Thanks/Goodbye:** Respond politely and invite them back.
3. **Unknown/Off-topic:** Politely guide them back to cosmetics/skincare topics.
4. **Language:** Always reply in natural, friendly Vietnamese.

**Examples:**
- User: "Hi" -> "Chào bạn! Mình là trợ lý ảo tư vấn mỹ phẩm. Bạn cần tìm sản phẩm gì hôm nay (kem chống nắng, sữa rửa mặt...) không ạ?"
- User: "Cảm ơn" -> "Dạ không có chi ạ! Cần tư vấn thêm bạn cứ nhắn nhé. Chúc bạn một ngày vui vẻ!"
"""

    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0.7
        )

    async def __call__(self, state: AgentState) -> dict:
        print(f"\n{'='*80}\n💬 GENERAL AGENT\n{'='*80}")

        # Lấy lịch sử chat
        messages = [SystemMessage(
            content=self.SYSTEM_PROMPT)] + state["messages"][-5:]

        response = await self.llm.ainvoke(messages)

        return {
            "messages": [response],
            # Xã giao xong thì END luôn, không cần QualityCheck cũng được (hoặc thích thì route qua)
            "next_node": "END"
        }
