from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from app.db.database import Base
from app.models.base import TimestampMixin


class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_type = Column(String(20), nullable=False)  # pdf, docx, xlsx
    # S3 key để download nếu cần
    s3_key = Column(String(500), nullable=False)
    s3_url = Column(String(1000), nullable=False)    # Public/presigned URL

    # Versioning
    document_group_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    chunks = relationship(
        "DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey(
        "documents.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1536), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    document = relationship("Document", back_populates="chunks")
