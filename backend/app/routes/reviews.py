from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user
from app.services.reviews import ReviewService
from app.schemas.common import APIResponse, MessageResponse
from app.schemas.reviews import (
    CreateReviewRequest,
    UpdateReviewRequest,
    ReviewResponse,
    ProductRatingSummary
)

router = APIRouter(tags=["Reviews"])


@router.post("/products/{product_id}/reviews", response_model=APIResponse[ReviewResponse], status_code=201)
def create_review(
    product_id: str,
    data: CreateReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ReviewService.create_review(db, current_user.id, product_id, data)


@router.get("/products/{product_id}/reviews", response_model=APIResponse[List[ReviewResponse]])
def list_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return ReviewService.list_product_reviews(db, product_id, page, limit)


@router.get("/products/{product_id}/rating-summary", response_model=APIResponse[ProductRatingSummary])
def get_product_rating_summary(
    product_id: str,
    db: Session = Depends(get_db)
):
    return ReviewService.get_rating_summary(db, product_id)


@router.put("/reviews/{review_id}", response_model=APIResponse[ReviewResponse])
def update_review(
    review_id: str,
    data: UpdateReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ReviewService.update_review(db, current_user.id, review_id, data)


@router.delete("/reviews/{review_id}", response_model=MessageResponse)
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ReviewService.delete_review(db, current_user.id, review_id)
