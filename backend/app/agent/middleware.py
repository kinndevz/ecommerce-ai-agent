from typing import Callable, Awaitable
from langchain.agents.middleware import wrap_model_call, wrap_tool_call, ModelRequest, ModelResponse
from langchain.agents import AgentState
from langchain_core.messages import SystemMessage, ToolMessage
from pathlib import Path
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)
PROMPT_FILE_PATH = Path(__file__).parent / "system_prompt.md"


class AgentStateWithContext(AgentState):
    user_context: dict  # {user_id, auth_token}


@wrap_tool_call
async def handle_tool_errors(request, handler):
    """Gracefully handle tool execution errors."""
    tool_name = request.tool_call.get("name", "unknown")
    tool_call_id = request.tool_call.get("id", "")

    try:
        result = await handler(request)
        logger.info(f"✅ Tool '{tool_name}' executed successfully")
        return result

    except Exception as e:
        logger.error(f"❌ Tool '{tool_name}' failed: {e}")
        return ToolMessage(
            content=f"Xin lỗi, có lỗi xảy ra khi thực hiện thao tác này. Vui lòng thử lại.",
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

    # Extract user context safely
    state = request.state or {}
    user_context = state.get("user_context", {})
    user_id = user_context.get("user_id", "anonymous")

    # Build system prompt
    prompt_content = _load_system_prompt()

    # Add conciseness hint for long conversations
    message_count = len(request.messages)
    if message_count > 10:
        prompt_content += "\n\n**NOTE:** This is a long conversation - be extra concise."

    # Inject user preferences from store
    prompt_content += _get_user_preferences_prompt(request.runtime, user_id)

    # Override system message
    modified_request = request.override(
        system_message=SystemMessage(content=prompt_content)
    )

    return await handler(modified_request)


@lru_cache(maxsize=1)
def _load_system_prompt() -> str:
    """Load system prompt from file with caching."""
    try:
        return PROMPT_FILE_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.warning("System prompt file not found, using default")
        return "You are a helpful Vietnamese e-commerce assistant."


def _get_user_preferences_prompt(runtime, user_id: str) -> str:
    """Fetch user preferences from store and format as prompt section."""
    if not runtime or not getattr(runtime, "store", None):
        return ""

    try:
        store = runtime.store
        prefs = store.get(("preferences",), user_id)

        if not prefs or not prefs.value:
            return ""

        parts = []
        skin_type = prefs.value.get("skin_type")
        brands = prefs.value.get("favorite_brands", [])

        if skin_type:
            parts.append(f"Skin type: {skin_type}")
        if brands:
            parts.append(f"Favorite brands: {', '.join(brands[:3])}")

        if parts:
            return f"\n\n**USER PREFERENCES:**\n" + "\n".join(f"- {p}" for p in parts)

    except Exception as e:
        logger.debug(f"Could not load user preferences: {e}")

    return ""
