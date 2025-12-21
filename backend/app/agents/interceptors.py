from dataclasses import dataclass
from langchain_mcp_adapters.interceptors import MCPToolCallRequest


@dataclass
class UserContext:
    """Context for user authentication"""
    user_id: str
    auth_token: str


async def inject_auth_token(
    request: MCPToolCallRequest,
    handler
):
    """
    Interceptor to inject authentication token into MCP tool requests.

    Reads auth_token from runtime context and adds it to HTTP headers
    before calling the actual MCP tool.
    """

    # ✅ Get context from runtime
    runtime = request.runtime

    if hasattr(runtime, 'context') and isinstance(runtime.context, UserContext):
        context: UserContext = runtime.context

        # ⚠️ QUAN TRỌNG: Inject vào ARGS (Tham số), không phải Headers
        # Vì MCP Server tool logic nhận data từ args.
        current_args = request.args

        # Merge token vào args hiện tại
        new_args = {
            **current_args,
            "token": context.auth_token
        }

        print(f"🔐 [Interceptor] Injecting auth for user: {context.user_id}")

        # Override request with auth headers
        modified_request = request.override(args=new_args)

        return await handler(modified_request)

    # No auth → proceed without auth (for public tools)
    print("⚠️ [Interceptor] No auth context - calling tool without authentication")
    return await handler(request)
