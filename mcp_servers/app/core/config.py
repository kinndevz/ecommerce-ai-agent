import os
from pydantic_settings import BaseSettings


current_file_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(os.path.dirname(current_file_dir))
env_path = os.path.join(root_dir, ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "Ecommerce AI Agent"
    MCP_HOST: str = "0.0.0.0"
    MCP_PORT: int = 8001

    # External Services
    OPENAI_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    CSV_URL: str

    # Vector DB Config
    TABLE_NAME: str = "documents"
    QUERY_NAME: str = "match_documents"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    class Config:
        env_file = env_path
        env_file_encoding = 'utf-8'
        extra = "ignore"


settings = Settings()
