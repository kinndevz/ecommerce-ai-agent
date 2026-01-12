from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Optional
import logging
from app.core.rate_limit_config import RateLimitConfig
from app.core.redis_rate_limiter import redis_rate_limiter

logger = logging.getLogger(__name__)


class RedisRateLimitMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = self._get_client_ip(request)

        if self._is_whitelisted(client_ip):
            return await call_next(request)

        if self._is_exempt_path(request.url.path):
            return await call_next(request)

        limit = self._get_rate_limit(request)

        if not limit:
            return await call_next(request)

        key = self._generate_key(request, client_ip)
        is_allowed, retry_after = redis_rate_limiter.is_allowed(key, limit)

        if not is_allowed:
            logger.warning(f"Rate limit exceeded: {key} on {request.url.path}")
            return self._create_rate_limit_response(limit, retry_after)

        remaining = redis_rate_limiter.get_remaining(key, limit)
        response = await call_next(request)
        self._add_rate_limit_headers(response, limit, remaining)

        return response

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    def _is_whitelisted(self, client_ip: str) -> bool:
        return "*" in RateLimitConfig.WHITELIST_IPS or client_ip in RateLimitConfig.WHITELIST_IPS

    def _is_exempt_path(self, path: str) -> bool:
        return path.endswith("/ws") or path in ["/health", "/", "/docs"]

    def _get_rate_limit(self, request: Request) -> Optional[str]:
        path = request.url.path

        if path in RateLimitConfig.ENDPOINT_LIMITS:
            return RateLimitConfig.ENDPOINT_LIMITS[path]

        tier = RateLimitConfig.METHOD_TIERS.get(
            request.method,
            RateLimitConfig.DEFAULT_TIER
        )

        return RateLimitConfig.TIER_LIMITS.get(tier)

    def _generate_key(self, request: Request, client_ip: str) -> str:
        path = request.url.path
        user_id = getattr(request.state, "user_id", None)

        if user_id:
            return f"user:{user_id}:{path}"
        return f"ip:{client_ip}:{path}"

    def _create_rate_limit_response(self, limit: str, retry_after: int) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "message": RateLimitConfig.ERROR_MESSAGE,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "retry_after": retry_after,
                    "limit": limit
                }
            },
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": limit.split("/")[0],
                "X-RateLimit-Remaining": "0",
            }
        )

    def _add_rate_limit_headers(self, response: Response, limit: str, remaining: int):
        response.headers["X-RateLimit-Limit"] = limit.split("/")[0]
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining - 1))
        response.headers["X-RateLimit-Policy"] = limit
