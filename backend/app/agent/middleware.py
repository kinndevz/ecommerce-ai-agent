from typing import Callable, Awaitable, Dict, Any, Optional
from langchain.agents.middleware import wrap_model_call, wrap_tool_call, ModelRequest, ModelResponse
from langchain.agents import AgentState
from langchain_core.messages import SystemMessage, ToolMessage, HumanMessage
from pathlib import Path
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)
PROMPT_FILE_PATH = Path(__file__).parent / "system_prompt.md"

FAQ_TOOLS = {"search_faq", "get_product_review_summary"}


class AgentStateWithContext(AgentState):
    """Agent state with user context for personalization."""
    user_context: dict  # {user_id, auth_token, preferences, page_context}


@wrap_tool_call
async def handle_tool_errors(request, handler):
    """Gracefully handle tool execution errors."""
    tool_name = request.tool_call.get("name", "unknown")
    tool_call_id = request.tool_call.get("id", "")

    try:
        result = await handler(request)
        logger.info("Tool '%s' executed successfully", tool_name)
        return result

    except Exception as e:
        logger.error("Tool '%s' failed: %s", tool_name, e)
        return ToolMessage(
            content="Xin lỗi, có lỗi xảy ra khi thực hiện thao tác này. Vui lòng thử lại.",
            tool_call_id=tool_call_id,
            name=tool_name,
            status="error"
        )


@wrap_model_call
async def cosmetics_middleware(
    request: ModelRequest,
    handler: Callable[[ModelRequest], Awaitable[ModelResponse]]
) -> ModelResponse:
    """Inject dynamic system prompt based on context and preferences."""
    state = request.state or {}
    user_context = state.get("user_context", {})
    user_prefs = user_context.get("preferences", {})
    page_context = user_context.get("page_context", {})

    prompt_content = _build_system_prompt(request, user_prefs, page_context)

    modified_request = request.override(
        system_message=SystemMessage(content=prompt_content)
    )

    return await handler(modified_request)


def _build_system_prompt(
    request: ModelRequest,
    user_prefs: Dict[str, Any],
    page_context: Dict[str, Any]
) -> str:
    """Build complete system prompt with context and preferences."""
    base_prompt = _load_system_prompt()

    profile_text = _format_user_profile(user_prefs)
    page_text = _format_page_context(page_context)

    if "{user_profile_context}" in base_prompt:
        prompt_content = base_prompt.replace(
            "{user_profile_context}", profile_text)
    else:
        prompt_content = f"{base_prompt}\n\n### USER PROFILE\n{profile_text}"

    if "{page_context}" in prompt_content:
        prompt_content = prompt_content.replace("{page_context}", page_text)
    else:
        prompt_content = f"{prompt_content}\n\n### CURRENT PAGE\n{page_text}"

    prompt_content += _get_conversation_state_hint(request)

    return prompt_content


def _format_user_profile(prefs: Dict[str, Any]) -> str:
    """Convert preferences dict to readable text for LLM."""
    if not prefs:
        return "- No profile data available yet. Ask the user about their skin type."

    lines = []
    if prefs.get("skin_type"):
        lines.append(f"- Skin Type: {prefs['skin_type']}")
    if prefs.get("skin_concerns"):
        lines.append(f"- Concerns: {', '.join(prefs['skin_concerns'])}")
    if prefs.get("favorite_brands"):
        lines.append(
            f"- Favorite Brands: {', '.join(prefs['favorite_brands'])}")
    if prefs.get("allergies"):
        lines.append(
            f"- Allergies: {', '.join(prefs['allergies'])} (IMPORTANT)")

    min_p = prefs.get("price_range_min")
    max_p = prefs.get("price_range_max")
    if min_p or max_p:
        budget = f"{min_p:,.0f}" if min_p else "0"
        budget += f" - {max_p:,.0f}" if max_p else "+"
        lines.append(f"- Budget: {budget} VND")

    return "\n".join(lines) if lines else "- Profile is empty."


def _format_page_context(page_context: Dict[str, Any]) -> str:
    """Convert page_context dict to readable hint for LLM."""
    if not page_context:
        return "- No page context available."

    page_type = page_context.get("type", "other")

    if page_type == "product_detail":
        slug = page_context.get("slug", "")
        return (
            f"- Page: Product detail\n"
            f"- Product slug: {slug}\n"
            f"- When user says 'sản phẩm này', 'cái này', 'nó' → refers to slug '{slug}'\n"
            f"- Pass this slug directly to tools without asking the user."
        )

    if page_type == "cart":
        return "- Page: Shopping cart"

    if page_type == "orders":
        return "- Page: Order history"

    if page_type == "order_detail":
        order_id = page_context.get("order_id", "")
        return (
            f"- Page: Order detail\n"
            f"- Order ID: {order_id}\n"
            f"- When user asks about 'đơn này' → refers to order_id '{order_id}'"
        )

    if page_type == "home":
        return "- Page: Homepage"

    return f"- Page: {page_context.get('type', 'unknown')}"


def _get_conversation_state_hint(request: ModelRequest) -> str:
    """Generate conversation state hint based on message count."""
    message_count = len(request.messages)

    if message_count <= 1:
        return "\n\n**CONVERSATION STATE:** New conversation - consider asking about skin type if not provided."

    if message_count > 10:
        return "\n\n**CONVERSATION STATE:** Long conversation - be extra concise."

    return ""


@lru_cache(maxsize=1)
def _load_system_prompt() -> str:
    """Load system prompt from file with caching."""
    try:
        return PROMPT_FILE_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.warning("System prompt file not found, using default")
        return "You are a helpful Vietnamese cosmetics e-commerce consultant."


@wrap_model_call
async def enforce_plain_text(
    request: ModelRequest,
    handler: Callable[[ModelRequest], Awaitable[ModelResponse]]
) -> ModelResponse:
    """Inject plain-text reminder nếu turn hiện tại có tool results."""
    messages = request.messages

    last_human_idx = -1
    for i in range(len(messages) - 1, -1, -1):
        if isinstance(messages[i], HumanMessage):
            last_human_idx = i
            break

    current_turn = messages[last_human_idx + 1:] if last_human_idx >= 0 else []

    # Skip reminder for FAQ/summary tools — agent cần đọc content để trả lời
    ui_tool_results = [
        m for m in current_turn
        if isinstance(m, ToolMessage) and m.name not in FAQ_TOOLS
    ]

    if not ui_tool_results:
        return await handler(request)

    reminder = HumanMessage(content=(
        "[SYSTEM REMINDER: Frontend đã render UI cho data trên. "
        "Chỉ trả lời bằng 1 câu plain text ngắn, KHÔNG dùng markdown, "
        "KHÔNG liệt kê lại bất kỳ thông tin nào từ data.]"
    ))

    modified_request = request.override(
        messages=[*messages, reminder]
    )

    return await handler(modified_request)
