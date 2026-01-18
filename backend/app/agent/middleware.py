from typing import TypedDict, Callable, Awaitable
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from langchain.agents import AgentState
from langchain_core.messages import SystemMessage


class UserContext(TypedDict):
    user_id: str
    auth_token: str


class AgentStateWithContext(AgentState):
    user_context: UserContext


@wrap_model_call
async def cosmetics_middleware(
    request: ModelRequest,
    handler: Callable[[ModelRequest], Awaitable[ModelResponse]]
) -> ModelResponse:

    state = request.state
    user_context = state.get("user_context", {})
    user_id = user_context.get("user_id", "anonymous")

    messages = request.messages
    message_count = len(messages)
    prompt_content = """You are an intelligent ecommerce assistant for a Vietnamese cosmetics store.

**IMPORTANT RESPONSE RULES:**
- When you use tools that return product data, keep your text response VERY SHORT
- Just say: "Dưới đây là sản phẩm phù hợp với bạn:" or similar brief intro
- DO NOT describe each product in detail - the frontend will render a beautiful product carousel
- DO NOT repeat information that's already in the tool results
- Your job is to introduce, not to describe

**EXAMPLES:**
❌ BAD (too long):
"1. CeraVe Moisturizing Cream - Giá 18.99 USD - Phát triển cùng bác sĩ..."

✅ GOOD (concise):
"Dưới đây là các sản phẩm CeraVe phù hợp với bạn:"

**TOOLS:**
- search_products, search_product_new_arrival, get_product_variants → Returns product data as artifacts
- add_to_cart, view_cart, update_cart_item, remove_cart_item, clear_cart
- get_user_profile, get_purchase_history, get_product_recommendations

**WORKFLOW:**
1. Use appropriate tool
2. Tool returns structured data (artifacts)
3. You give brief 1-2 sentence response
4. Frontend renders the data beautifully"""

    if message_count > 10:
        prompt_content += "\n- Be extra concise"

    # Try to get user preferences
    try:
        if request.runtime and getattr(request.runtime, "store", None):
            store = request.runtime.store
            prefs = store.get(("preferences",), user_id)
            if prefs and prefs.value:
                skin_type = prefs.value.get("skin_type")
                brands = prefs.value.get("favorite_brands", [])

                if skin_type:
                    prompt_content += f"\n\n**USER PREFERENCES:** Skin: {skin_type}"
                if brands:
                    prompt_content += f", Brands: {', '.join(brands[:2])}"
    except Exception:
        pass

    new_system_message = SystemMessage(content=prompt_content)
    modified_request = request.override(system_message=new_system_message)
    response = await handler(modified_request)

    tool_count = 0
    if hasattr(response, 'tool_calls') and response.tool_calls:
        tool_count = len(response.tool_calls)

    print(f"[{user_id}] Tools: {tool_count}")

    return response
