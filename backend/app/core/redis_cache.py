import redis
from redis.connection import ConnectionPool
import json
import logging
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisCache:
    def __init__(self):
        self.pool = None
        self.redis_client = None
        self._connect()

    def _connect(self):
        try:
            self.pool = ConnectionPool.from_url(
                settings.redis_url,
                max_connections=settings.REDIS_MAX_CONNECTIONS,
                decode_responses=True
            )
            self.redis_client = redis.Redis(connection_pool=self.pool)
            logger.info("Redis Cache connected successfully")
        except Exception as e:
            logger.error(f"Redis Cache connection error: {e}")
            raise

    def get(self, key: str) -> Optional[dict]:
        """Lấy dữ liệu từ Redis và tự động parse JSON"""
        try:
            full_key = f"{settings.REDIS_KEY_PREFIX}:cache:{key}"
            data = self.redis_client.get(full_key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Error getting cache for {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl_seconds: int = 86400):
        """Lưu dữ liệu vào Redis dưới dạng JSON, mặc định sống 24h"""
        try:
            full_key = f"{settings.REDIS_KEY_PREFIX}:cache:{key}"
            # Chuyển dict/list thành chuỗi JSON trước khi lưu
            json_value = json.dumps(value)
            self.redis_client.setex(full_key, ttl_seconds, json_value)
        except Exception as e:
            logger.error(f"Error setting cache for {key}: {e}")

    def delete(self, key: str):
        """Xóa cache khi có dữ liệu mới (Invalidation)"""
        try:
            full_key = f"{settings.REDIS_KEY_PREFIX}:cache:{key}"
            self.redis_client.delete(full_key)
            logger.info(f"Deleted cache key: {full_key}")
        except Exception as e:
            logger.error(f"Error deleting cache for {key}: {e}")


redis_cache = RedisCache()
