from pydantic_settings import BaseSettings
from typing import Optional
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg import AsyncConnection
from psycopg.rows import dict_row


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Cosmetic E-commerce API"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # JWT
    ACCESS_TOKEN_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_SECRET: str
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie Settings
    COOKIE_NAME: str = "refreshToken"
    COOKIE_HTTPONLY: bool = True
    COOKIE_SECURE: bool = True
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str | None = None
    COOKIE_MAX_AGE: int = 30 * 24 * 60 * 60  # 30 days in seconds

    # Admin Account
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ADMIN_NAME: str

    # Email
    SMTP_PASSWORD: str
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    OTP_EXPIRE_MINUTES: int = 5

    # AWS S3
    S3_REGION: str
    S3_ACCESS_KEY: str
    S3_SECRET_KEY: str
    S3_BUCKET_NAME: str

    # OAuth (Optional)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Elastic Search
    ELASTIC_PASSWORD: str
    ELASTIC_ACCOUNT: str
    ELASTIC_URL: str
    PRODUCT_DOCUMENT_INDEX: str

    # MCP
    MCP_SERVER_URL: str

    # Open api key
    OPENAI_API_KEY: str

    # LangSmith tracing (LangChain env names)
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: Optional[str] = None

    # Redis Cloud (Rate Limiting)
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    REDIS_USERNAME: str
    REDIS_DB: int
    REDIS_SSL: bool
    REDIS_MAX_CONNECTIONS: int
    REDIS_SOCKET_TIMEOUT: int
    REDIS_SOCKET_CONNECT_TIMEOUT: int
    REDIS_KEY_PREFIX: str
    REDIS_KEY_TTL: int

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    @property
    def redis_url(self) -> str:
        """Generate Redis URL"""
        auth = f"{self.REDIS_USERNAME}:{self.REDIS_PASSWORD}"
        return f"redis://{auth}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"


settings = Settings()


_checkpointer_instance = None
_checkpointer_conn = None


async def get_checkpointer():
    global _checkpointer_instance, _checkpointer_conn

    if _checkpointer_instance is None:
        print("📦 Initializing PostgreSQL checkpointer...")
        _checkpointer_conn = await AsyncConnection.connect(
            settings.DATABASE_URL,
            autocommit=True,
            prepare_threshold=None,
            row_factory=dict_row
        )
        _checkpointer_instance = AsyncPostgresSaver(conn=_checkpointer_conn)
        await _checkpointer_instance.setup()
        print("✅ PostgreSQL checkpointer ready")
    return _checkpointer_instance


async def close_checkpointer():
    """Cleanup function to close DB connection on shutdown"""
    global _checkpointer_instance, _checkpointer_conn

    if _checkpointer_conn:
        print("🔌 Closing PostgreSQL checkpointer connection...")
        await _checkpointer_conn.close()
        _checkpointer_conn = None
        _checkpointer_instance = None
