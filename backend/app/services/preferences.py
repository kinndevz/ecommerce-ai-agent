import uuid
from decimal import Decimal
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models.conversation import UserPreference
from app.schemas.preferences import UpdateUserPreferenceRequest
from app.utils.responses import ResponseHandler


class PreferenceService:
    @staticmethod
    def get_user_preference(db: Session, user_id: str) -> Optional[UserPreference]:
        return db.query(UserPreference).filter(UserPreference.user_id == user_id).first()

    @staticmethod
    def get_my_preferences(db: Session, user_id: str):
        preference = PreferenceService.get_user_preference(db, user_id)
        if not preference:
            return ResponseHandler.success(
                message="User preferences retrieved successfully",
                data=None
            )
        return ResponseHandler.get_single_success("User preferences", preference.id, data=preference)

    @staticmethod
    def update_my_preferences(
        db: Session,
        user_id: str,
        update_data: UpdateUserPreferenceRequest
    ):
        preference = PreferenceService.get_user_preference(db, user_id)
        if not preference:
            preference = UserPreference(id=str(uuid.uuid4()), user_id=user_id)
            db.add(preference)

        if update_data.skin_type is not None:
            preference.skin_type = update_data.skin_type
        if update_data.skin_concerns is not None:
            preference.skin_concerns = update_data.skin_concerns
        if update_data.favorite_brands is not None:
            preference.favorite_brands = update_data.favorite_brands
        if update_data.price_range_min is not None:
            preference.price_range_min = update_data.price_range_min
        if update_data.price_range_max is not None:
            preference.price_range_max = update_data.price_range_max
        if update_data.preferred_categories is not None:
            preference.preferred_categories = update_data.preferred_categories
        if update_data.allergies is not None:
            preference.allergies = update_data.allergies

        db.commit()
        db.refresh(preference)

        return ResponseHandler.update_success("User preferences", preference.id, data=preference)

    @staticmethod
    def to_dict(preference: Optional[UserPreference]) -> Dict:
        if not preference:
            return {}

        def _to_float(value: Optional[Decimal]) -> Optional[float]:
            return float(value) if value is not None else None

        return {
            "skin_type": preference.skin_type,
            "skin_concerns": preference.skin_concerns or [],
            "favorite_brands": preference.favorite_brands or [],
            "price_range_min": _to_float(preference.price_range_min),
            "price_range_max": _to_float(preference.price_range_max),
            "preferred_categories": preference.preferred_categories or [],
            "allergies": preference.allergies or []
        }
