from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class DocumentBase(BaseModel):
    """Single document record"""
    id: UUID
    title: str
    description: Optional[str]
    file_type: str
    file_size: Optional[int] = None  # Size in bytes
    s3_url: str
    document_group_id: UUID
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FAQSearchResult(BaseModel):
    """Single chunk result returned from semantic search"""
    content: str
    document_title: str
    version: int
    similarity: float

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    """Wrapped response for a single document"""
    success: bool
    message: str
    data: DocumentBase


class DocumentListResponse(BaseModel):
    """Wrapped response for document list"""
    success: bool
    message: str
    data: List[DocumentBase]


class FAQSearchResponse(BaseModel):
    """Wrapped response for FAQ search"""
    success: bool
    message: str
    data: List[FAQSearchResult]
