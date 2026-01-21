import json
import logging
from langchain_mcp_adapters.interceptors import MCPToolCallRequest
from mcp.types import TextContent

logger = logging.getLogger(__name__)


async def inject_auth_token(request: MCPToolCallRequest, handler):
    """Inject auth token from runtime context into tool args."""
    auth_token = ""

    try:
        context = request.runtime.context
        auth_token = (
            context.get("auth_token", "")
            if isinstance(context, dict)
            else getattr(context, "auth_token", "")
        )
    except AttributeError:
        logger.warning("Runtime context not available for auth injection")
    except Exception as e:
        logger.error(f"Failed to access context: {e}")

    if auth_token:
        logger.debug(f"Injecting auth token: {auth_token[:10]}...")
        modified_request = request.override(
            args={**request.args, "__auth_token": auth_token}
        )
        return await handler(modified_request)

    logger.warning(f"No auth_token for tool '{request.name}'")
    return await handler(request)


async def append_structured_content(request: MCPToolCallRequest, handler):
    """Append structuredContent to tool result for AI visibility."""
    try:
        result = await handler(request)

        if result.structuredContent:
            existing_content = result.content
            if existing_content is None:
                existing_content = []
            elif isinstance(existing_content, str):
                existing_content = [TextContent(
                    type="text", text=existing_content)]
            elif not isinstance(existing_content, list):
                existing_content = [existing_content]

            result.content = existing_content + [
                TextContent(
                    type="text",
                    text=json.dumps(result.structuredContent,
                                    ensure_ascii=False)
                )
            ]
        return result

    except Exception as e:
        logger.error(f"Tool '{request.name}' execution failed: {e}")
        raise  # Re-raise để wrap_tool_call middleware handle
