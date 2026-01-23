from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.services.analytics import AnalyticsService
from app.schemas.analytics import (
    SalesSummary,
    SalesTrendResponse,
    TopProductsResponse
)
from app.schemas.common import APIResponse
from app.utils.responses import ResponseHandler
from app.utils.deps import require_permission

router = APIRouter(prefix="/admin/analytics", tags=["Analytics"])


@router.get("/summary", response_model=APIResponse[SalesSummary])
def get_sales_summary(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_permission())
):
    data = AnalyticsService.get_sales_summary(db, start_date, end_date)
    return ResponseHandler.success("Sales summary retrieved successfully", data)


@router.get("/trend", response_model=APIResponse[SalesTrendResponse])
def get_sales_trend(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_permission())
):
    data = AnalyticsService.get_sales_trend(db, start_date, end_date)
    return ResponseHandler.success("Sales trend retrieved successfully", data)


@router.get("/top-products", response_model=APIResponse[TopProductsResponse])
def get_top_products(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _=Depends(require_permission())
):
    data = AnalyticsService.get_top_products(db, start_date, end_date, limit)
    return ResponseHandler.success("Top products retrieved successfully", data)
