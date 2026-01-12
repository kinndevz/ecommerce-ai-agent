import redis
from redis.connection import ConnectionPool
import time
import logging
from typing import Tuple, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisRateLimiter:

    def __init__(self):
        self.pool = None
        self.redis_client = None
        self._connect()

    def _connect(self):
        try:
            self.pool = ConnectionPool.from_url(
                settings.redis_url,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                socket_timeout=settings.REDIS_SOCKET_TIMEOUT,
                socket_connect_timeout=settings.REDIS_SOCKET_CONNECT_TIMEOUT,
                decode_responses=True
            )

            self.redis_client = redis.Redis(connection_pool=self.pool)
            self.redis_client.ping()
            logger.info("Connected to Redis Cloud successfully")

        except redis.ConnectionError as e:
            logger.error(f"Failed to connect to Redis Cloud: {e}")
            raise
        except Exception as e:
            logger.error(f"Redis connection error: {e}")
            raise

    def _parse_limit(self, limit_str: str) -> Tuple[int, int]:
        if not limit_str:
            return None, None

        parts = limit_str.split("/")
        if len(parts) != 2:
            raise ValueError(f"Invalid limit format: {limit_str}")

        max_requests = int(parts[0])
        period = parts[1].lower()

        period_seconds = {
            "second": 1,
            "minute": 60,
            "hour": 3600,
            "day": 86400,
        }

        if period not in period_seconds:
            raise ValueError(f"Invalid period: {period}")

        return max_requests, period_seconds[period]

    def _get_redis_key(self, key: str) -> str:
        return f"{settings.REDIS_KEY_PREFIX}:{key}"

    def is_allowed(self, key: str, limit_str: str) -> Tuple[bool, Optional[int]]:
        if not limit_str:
            return True, None

        try:
            max_requests, period_seconds = self._parse_limit(limit_str)
            redis_key = self._get_redis_key(key)

            now = time.time()
            window_start = now - period_seconds

            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(redis_key, 0, window_start)
            pipe.zcard(redis_key)
            results = pipe.execute()
            current_count = results[1]

            if current_count >= max_requests:
                oldest_entries = self.redis_client.zrange(
                    redis_key, 0, 0, withscores=True)

                if oldest_entries:
                    oldest_timestamp = oldest_entries[0][1]
                    retry_after = int(oldest_timestamp +
                                      period_seconds - now) + 1
                    return False, max(retry_after, 1)

                return False, period_seconds

            pipe = self.redis_client.pipeline()
            pipe.zadd(redis_key, {str(now): now})
            pipe.expire(redis_key, period_seconds + 60)
            pipe.execute()

            return True, None

        except redis.RedisError as e:
            logger.error(f"Redis error in is_allowed: {e}")
            return True, None
        except Exception as e:
            logger.error(f"Error in is_allowed: {e}")
            return True, None

    def get_remaining(self, key: str, limit_str: str) -> int:
        if not limit_str:
            return float('inf')

        try:
            max_requests, period_seconds = self._parse_limit(limit_str)
            redis_key = self._get_redis_key(key)

            now = time.time()
            window_start = now - period_seconds

            pipe = self.redis_client.pipeline()
            pipe.zremrangebyscore(redis_key, 0, window_start)
            pipe.zcard(redis_key)
            results = pipe.execute()

            current_count = results[1]
            return max(0, max_requests - current_count)

        except Exception as e:
            logger.error(f"Error in get_remaining: {e}")
            return 0

    def reset(self, key: str):
        try:
            redis_key = self._get_redis_key(key)
            self.redis_client.delete(redis_key)
            logger.info(f"Reset rate limit for key: {key}")
        except Exception as e:
            logger.error(f"Error in reset: {e}")

    def cleanup_pattern(self, pattern: str):
        try:
            full_pattern = f"{settings.REDIS_KEY_PREFIX}:{pattern}"
            cursor = 0
            deleted_count = 0

            while True:
                cursor, keys = self.redis_client.scan(
                    cursor=cursor,
                    match=full_pattern,
                    count=100
                )

                if keys:
                    self.redis_client.delete(*keys)
                    deleted_count += len(keys)

                if cursor == 0:
                    break

            logger.info(
                f"Cleaned up {deleted_count} keys matching pattern: {pattern}")
            return deleted_count

        except Exception as e:
            logger.error(f"Error in cleanup_pattern: {e}")
            return 0

    def get_stats(self) -> dict:
        try:
            info = self.redis_client.info()
            return {
                "connected": True,
                "version": info.get("redis_version"),
                "used_memory": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "total_commands_processed": info.get("total_commands_processed"),
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {"connected": False, "error": str(e)}

    def health_check(self) -> bool:
        try:
            return self.redis_client.ping()
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False

    def close(self):
        try:
            if self.pool:
                self.pool.disconnect()
            logger.info("Redis connection closed")
        except Exception as e:
            logger.error(f"Error closing Redis connection: {e}")


redis_rate_limiter = RedisRateLimiter()
