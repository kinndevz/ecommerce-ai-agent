from dataclasses import dataclass
from langchain_mcp_adapters.interceptors import MCPToolCallRequest


@dataclass
class UserContext:
    """Context schema matching the create_agent definition"""
    user_id: str
    auth_token: str


async def inject_auth_token(
    request: MCPToolCallRequest,
    handler,
):
    """Inject auth token into tool arguments from runtime context."""

    # 1. Access runtime context directly (như template)
    runtime = request.runtime
    auth_token = runtime.context.auth_token

    # Debug log nhẹ để biết code đang chạy
    print(f"🔐 [Interceptor] Injecting Token: {auth_token[:15]}...")

    # 2. Inject into arguments using dictionary unpacking
    # Chỉ inject __auth_token như bạn yêu cầu
    modified_request = request.override(
        args={**request.args, "__auth_token": auth_token}
    )

    return await handler(modified_request)
