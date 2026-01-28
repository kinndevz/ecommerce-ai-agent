from typing import Callable, Awaitable
from langchain.agents.middleware import wrap_model_call, wrap_tool_call, ModelRequest, ModelResponse
from langchain.agents import AgentState
from langchain_core.messages import SystemMessage, ToolMessage
from pathlib import Path
from functools import lru_cache
import logging

from app.agent.personalization.preferences_formatter import PreferencesFormatter

logger = logging.getLogger(__name__)
PROMPT_FILE_PATH = Path(__file__).parent / "system_prompt.md"

# Singleton formatter instance
_preferences_formatter = PreferencesFormatter()


class AgentStateWithContext(AgentState):
    """Agent state with user context for personalization."""
    user_context: dict  # {user_id, auth_token}


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
    user_id = user_context.get("user_id", "anonymous")

    prompt_content = _build_system_prompt(request, user_id)

    modified_request = request.override(
        system_message=SystemMessage(content=prompt_content)
    )

    return await handler(modified_request)


def _build_system_prompt(request: ModelRequest, user_id: str) -> str:
    """Build complete system prompt with context and preferences."""
    prompt_content = _load_system_prompt()

    # Add conversation state hint
    prompt_content += _get_conversation_state_hint(request)

    # Inject user preferences
    preferences_prompt = _get_user_preferences_prompt(request.runtime, user_id)
    prompt_content += preferences_prompt

    return prompt_content


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


def _get_user_preferences_prompt(runtime, user_id: str) -> str:
    """Fetch user preferences from store and format as prompt section."""
    preferences = _fetch_preferences_from_store(runtime, user_id)

    if not preferences:
        return ""

    print(">>>>> _get_user_preferences_prompt: ", user_id)
    return _preferences_formatter.format_for_prompt(preferences)


def _fetch_preferences_from_store(runtime, user_id: str) -> dict:
    """Fetch raw preferences dict from runtime store."""
    if not runtime or not getattr(runtime, "store", None):
        return {}

    try:
        store = runtime.store
        prefs = store.get(("preferences",), user_id)
        print(">>>> prefs", prefs)

        if prefs and prefs.value:
            print(">>>>> _fetch_preferences_from_store: ", user_id)
            logger.debug("Loaded preferences for user_id=%s", user_id)
            return prefs.value

    except Exception as e:
        logger.debug("Could not load user preferences: %s", e)

    return {}
