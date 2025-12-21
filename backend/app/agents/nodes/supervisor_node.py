from typing import Literal
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.agents.state import AgentState
from app.core.config import settings


class RouteDecision(BaseModel):
    """
    Routing decision structure
    """
    next_node: Literal["product_agent", "order_agent", "general_agent", "quality_check", "END"] = Field(
        description="Which node to visit next"
    )
    reasoning: str = Field(
        description="Why this routing decision was made"
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

    SYSTEM_PROMPT = """You are a supervisor routing customer queries...

**Available Specialists:**

1. **product_agent** - Product specialist
   Use for: Finding products, price checking, product details.

2. **order_agent** - Order specialist (Buying, Cart management).
   Use for:
   - "Add to cart", "Buy it", "I want this one".
   - "Show my cart", "Checkout".

3. **general_agent** - General conversation
   Use for:
   - Greetings ("xin chào", "hi", "hello")
   - Thanks/Closing ("cảm ơn", "tạm biệt")
   - Small talk ("bạn là ai")

4. **quality_check** - Formatter
   (Only used after agent execution)

5. **END**
   (Rarely used directly now, unless system error)

**Routing Rules:**
- Query about products/skincare -> **product_agent**
- Query about greetings/thanks/who are you -> **general_agent**
- After agent responds -> **quality_check**
"""

    def __init__(self):
        """Initialize supervisor"""
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.OPENAI_API_KEY,
            temperature=0
        ).with_structured_output(RouteDecision)

        print("✅ Supervisor node initialized")

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
        last_user_message = None

        for msg in reversed(messages):
            if msg.type == "human":
                last_user_message = msg
                break

        if not last_user_message:
            print("   ⚠️  No user message found")
            return {"next_node": "END"}

        print(f"📝 User query: {last_user_message.content}")

        # BUILD ROUTING CONTEXT
        routing_context = f"""**User's Question:**
{last_user_message.content}

**Task:**
Decide which specialist should handle this query.

Your options:
- product_agent (for product-related queries)
- order_agent (buying, cart)
- quality_check (if an agent just finished responding)
- END (for greetings/goodbyes)

Route to:"""

        # GET ROUTING DECISION FROM LLM
        decision = await self.llm.ainvoke([
            SystemMessage(content=self.SYSTEM_PROMPT),
            HumanMessage(content=routing_context)
        ])

        print(f"\n🎯 ROUTING DECISION:")
        print(f"   → Next node: {decision.next_node}")
        print(f"   → Reasoning: {decision.reasoning}")

        return {
            "next_node": decision.next_node
        }
