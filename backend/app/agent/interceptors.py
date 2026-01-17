import json
from langchain_mcp_adapters.interceptors import MCPToolCallRequest
from mcp.types import TextContent


async def inject_auth_token(
    request: MCPToolCallRequest,
    handler,
):
    auth_token = ""
    try:
        context = request.runtime.context
        if isinstance(context, dict):
            auth_token = context.get("auth_token", "")
        else:
            auth_token = getattr(context, "auth_token", "")

    except Exception as e:
        print(f"⚠️ [Interceptor] Failed to access context: {e}")

    if auth_token:
        print(f"🔐 [Interceptor] Injecting Token: {auth_token[:10]}...")

        modified_request = request.override(
            args={**request.args, "__auth_token": auth_token}
        )
        return await handler(modified_request)
    else:
        print("⚠️ [Interceptor] No auth_token found in runtime context!")

    return await handler(request)


async def append_structured_content(request: MCPToolCallRequest, handler):
    result = await handler(request)
    if result.structuredContent:
        result.content += [
            TextContent(type="text", text=json.dumps(
                result.structuredContent)),
        ]
    return result
