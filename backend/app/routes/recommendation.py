from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Tuple
from app.db.database import get_db
from app.models.user import User
from app.utils.deps import get_current_user_with_token
from app.services.recommendation import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/from-history")
def recommend_from_history(
    order_limit: int = Query(
        2, ge=1, le=5, description="How many recent orders to scan"),
    products_per_source: int = Query(
        5, ge=1, le=10, description="Related products per source product"),
    max_results: int = Query(
        10, ge=1, le=20, description="Max products to return"),
    user_and_token: Tuple[User, str] = Depends(get_current_user_with_token),
    db: Session = Depends(get_db),
):
    """
    Recommend products based on the user's recent order history.
    Requires authentication — uses the current user's order data.
    """
    user, _ = user_and_token

    return RecommendationService.recommend_from_history(
        db=db,
        user_id=user.id,
        order_limit=order_limit,
        products_per_source=products_per_source,
        max_results=max_results,
    )
