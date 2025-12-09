from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase import create_client, Client
from app.core.config import settings


class VectorDB:
    _client = None
    _embeddings = None
    _store = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            cls._client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        return cls._client

    @classmethod
    def get_embeddings(cls) -> OpenAIEmbeddings:
        if cls._embeddings is None:
            cls._embeddings = OpenAIEmbeddings(
                openai_api_key=settings.OPENAI_API_KEY,
                model=settings.EMBEDDING_MODEL
            )
        return cls._embeddings

    @classmethod
    def get_store(cls) -> SupabaseVectorStore:
        if cls._store is None:
            cls._store = SupabaseVectorStore(
                embedding=cls.get_embeddings(),
                client=cls.get_client(),
                table_name=settings.TABLE_NAME,
                query_name=settings.QUERY_NAME,
            )
        return cls._store
