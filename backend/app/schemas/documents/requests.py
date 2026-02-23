from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class UploadDocumentRequest(BaseModel):
    title: str
    description: Optional[str] = None
    document_group_id: Optional[UUID] = None  # None = brand-new document


class FAQSearchRequest(BaseModel):
    query: str
    limit: int = 3
