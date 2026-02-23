from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.models.user import User
from app.services.document import DocumentService
from app.schemas.documents.requests import UploadDocumentRequest, FAQSearchRequest
from app.schemas.documents.responses import (
    DocumentResponse,
    DocumentListResponse,
    FAQSearchResponse,
)
from app.utils.deps import require_permission
from app.db.database import get_db

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_FILE_TYPES = {"pdf", "docx", "xlsx", "xls"}


@router.post("", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    document_group_id: Optional[UUID] = Form(None),
    current_user: User = Depends(require_permission),
    db: Session = Depends(get_db)
):
    """
    Upload a new document or a new version of an existing group.
    - `document_group_id` = None  →  brand-new document
    - `document_group_id` = <uuid> →  new version, old version deactivated
    """
    file_ext = file.filename.rsplit(".", 1)[-1].lower()
    if file_ext not in ALLOWED_FILE_TYPES:
        from app.utils.responses import ResponseHandler
        ResponseHandler.bad_request(
            f"File type '{file_ext}' is not supported. Allowed: {', '.join(ALLOWED_FILE_TYPES)}"
        )

    file_bytes = await file.read()
    payload = UploadDocumentRequest(
        title=title,
        description=description,
        document_group_id=document_group_id
    )

    return DocumentService.upload_document(
        db=db,
        file_bytes=file_bytes,
        filename=file.filename,
        payload=payload
    )


@router.get("", response_model=DocumentListResponse)
def get_all_documents(
    current_user: User = Depends(require_permission),
    db: Session = Depends(get_db)
):
    """List all active documents (admin view)."""
    return DocumentService.get_all_documents(db)


@router.delete("/{document_id}")
def delete_document(
    document_id: UUID,
    current_user: User = Depends(require_permission),
    db: Session = Depends(get_db)
):
    """Deactivate a document and all its chunks."""
    return DocumentService.delete_document(db, document_id)


@router.post("/search", response_model=FAQSearchResponse)
def search_faq(
    payload: FAQSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Semantic search over active document chunks.
    Called by MCP tool `search_faq` — no auth required.
    """
    return DocumentService.search_faq(db, payload)
