from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import date, datetime, timedelta, timezone
from enum import Enum


class AnalyticsPeriod(str, Enum):
    SEVEN_DAYS = "7d"
    THIRTY_DAYS = "30d"
    NINETY_DAYS = "90d"
    ONE_YEAR = "1y"


class DateRangeParams(BaseModel):
    """
    Flexible date range: preset period OR custom start_date/end_date.
    Priority: start_date/end_date > period.
    """
    period: Optional[AnalyticsPeriod] = AnalyticsPeriod.THIRTY_DAYS
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @field_validator("end_date")
    @classmethod
    def end_date_must_be_after_start(cls, v, info):
        if v and info.data.get("start_date") and v < info.data["start_date"]:
            raise ValueError("end_date must be after start_date")
        return v

    def resolve(self) -> tuple[datetime, datetime]:
        """Resolve to (start_dt, end_dt) in UTC."""
        now = datetime.now(timezone.utc)

        if self.start_date and self.end_date:
            start = datetime.combine(
                self.start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
            end = datetime.combine(self.end_date, datetime.max.time()).replace(
                tzinfo=timezone.utc)
            return start, end

        delta_map = {
            AnalyticsPeriod.SEVEN_DAYS: 7,
            AnalyticsPeriod.THIRTY_DAYS: 30,
            AnalyticsPeriod.NINETY_DAYS: 90,
            AnalyticsPeriod.ONE_YEAR: 365,
        }
        days = delta_map.get(self.period, 30)
        return now - timedelta(days=days), now
