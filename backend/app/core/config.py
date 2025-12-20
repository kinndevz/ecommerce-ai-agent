from pydantic_settings import BaseSettings
from typing import Optional


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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
