from typing import Literal
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.agents.state import AgentState
from app.core.config import settings


class RouteDecision(BaseModel):
    """
    Routing decision structure
    """
    next_node: Literal["product_agent", "order_agent", "general_agent", "END"] = Field(
        description="The appropriate agent node to handle the user's input."
    )
    reasoning: str = Field(
        description="Brief explanation of why this agent was chosen based on context history."
    )


class SupervisorNode:
    """
    Supervisor that analyzes user queries and routes to appropriate agents

    Responsibilities:
    - Analyze user intent from their message
    - Route to appropriate specialist agent
    - Route to quality_check when agent is done
    - End conversation when appropriate

    Does NOT:
    - Use tools
    - Generate product information
    - Process user requests directly
    """

    SYSTEM_PROMPT = """You are the Supervisor Router for a cosmetics store AI.
Your ONLY job is to select the next specialist to handle the conversation.

**AVAILABLE SPECIALISTS:**
1. `product_agent`: Finds products, checks prices, details, ingredients.
2. `order_agent`: Handles cart (add/view), checkout, buying intent ("mua", "lấy cái này").
3. `general_agent`: Greetings, goodbyes, polite closing, or completely off-topic questions.

** CRITICAL ROUTING RULES (CONTEXT AWARENESS):**

1. **ANALYZE HISTORY:** Look at the *entire conversation flow*, not just the last message.
2. **MAINTAIN CONTINUITY (The "Sticky" Rule):**
   - If the user's input is short or ambiguous (e.g., "Giá sao?", "Tốt không?", "Cái này dùng sáng hay tối?"):
     -> Look at the *previous AI message*.
     -> If the previous topic was about a product, **ROUTE TO `product_agent`**.
     -> If the previous topic was about ordering, **ROUTE TO `order_agent`**.
   - DO NOT route ambiguous follow-up questions to `general_agent`.

3. **SPECIFIC TRIGGERS:**
   - Explicit greeting/bye (e.g., "Hi", "Chào", "Tạm biệt") -> `general_agent`.
   - Buying intent (e.g., "Thêm vào giỏ", "Mua cái này", "Chốt") -> `order_agent`.
   - Searching/Asking info -> `product_agent`.

4. **DEFAULT:** If unsure and it looks like a shopping query, default to `product_agent`.
"""

    def __init__(self):
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0
        )

        self.router = llm.with_structured_output(RouteDecision)

        print("✅ Supervisor (Context-Aware) initialized")

    async def __call__(self, state: AgentState) -> dict:
        """
        Route query to appropriate node

        Args:
            state: Current state

        Returns:
            Updated state with routing decision
        """
        print(f"\n{'='*80}")
        print(f"🎯 SUPERVISOR ROUTING")
        print(f"{'='*80}")

        # GET LAST USER MESSAGE (not AI response)
        messages = state["messages"]
        if messages and messages[-1].type == "human":
            print(f"📝 Latest Input: {messages[-1].content}")

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history"),
        ])

        chain = prompt_template | self.router

        try:
            recent_messages = state["messages"][-10:]
            print(">>>> recent messages", recent_messages)
            decision = await chain.ainvoke({"history": recent_messages})
        except Exception as e:
            print(f"Routing Error: {e}")
            return {"next_node": "general_agent"}

        print(f"\n🧠 AI Analysis:")
        print(f"   → Reasoning: {decision.reasoning}")
        print(f"   → Routing to: {decision.next_node}")

        return {
            "next_node": decision.next_node
        }
