import json
import logging
from typing import Dict, List, Optional, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, ValidationError
from app.core.config import settings
from app.models.conversation import UserPreference

logger = logging.getLogger(__name__)


class PreferenceExtraction(BaseModel):
    """Pydantic model for LLM extraction output."""
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    favorite_brands: Optional[List[str]] = None
    price_range_min: Optional[float] = None
    price_range_max: Optional[float] = None
    preferred_categories: Optional[List[str]] = None
    allergies: Optional[List[str]] = None


EXTRACTION_SYSTEM_PROMPT = """
You extract user preferences from a single user message for a Vietnamese cosmetics e-commerce platform.

## Rules:
- Only extract information explicitly stated by the user.
- Do not guess or infer missing details.
- Keep all values in Vietnamese as the user stated them.
- Convert any stated price range into numeric VND values:
  - "100k" = 100000
  - "1tr" or "1 triệu" = 1000000
  - "500 nghìn" = 500000

## Response Format:
Return JSON only with these keys:
  skin_type, skin_concerns, favorite_brands,
  price_range_min, price_range_max,
  preferred_categories, allergies.
Use null for unknown values and [] for empty lists.

## Examples:
User: "tôi da dầu, bị mụn"
Response: {"skin_type": "da dầu", "skin_concerns": ["mụn"], ...}

User: "thích cerave, ngân sách 200-500k"
Response: {"favorite_brands": ["cerave"], "price_range_min": 200000, "price_range_max": 500000, ...}
""".strip()


async def infer_preferences_from_message(message: str) -> Dict[str, object]:
    """
    Extract preferences from a user message using LLM.

    Returns dict of extracted preferences.
    """
    if not message or not message.strip():
        return {}

    llm = _create_llm()

    try:
        response = await llm.ainvoke([
            SystemMessage(content=EXTRACTION_SYSTEM_PROMPT),
            HumanMessage(content=message),
        ])

        payload = _safe_parse_json(getattr(response, "content", ""))
        if not isinstance(payload, dict):
            return {}

        extracted = PreferenceExtraction(**payload)
        updates = _to_updates(extracted)

        if updates:
            logger.debug("Preference inference extracted keys=%s",
                         list(updates.keys()))

        return updates

    except ValidationError as e:
        logger.debug("Preference extraction validation failed: %s", e)
    except Exception as e:
        logger.warning("Preference extraction failed: %s", e)

    return {}


def _create_llm() -> ChatOpenAI:
    """Create LLM instance for preference extraction."""
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=settings.OPENAI_API_KEY,
        model_kwargs={"response_format": {"type": "json_object"}},
    )


def merge_preference_updates(
    existing: Optional[UserPreference],
    extracted: Dict[str, object]
) -> Dict[str, object]:
    """
    Merge extracted preferences with existing user preferences.

    For lists, merges without duplicates.
    For scalars, new value replaces if different.
    """
    if not extracted:
        return {}

    updates: Dict[str, object] = {}

    # Skin type - replace if different
    if "skin_type" in extracted:
        new_value = extracted["skin_type"]
        if not existing or existing.skin_type != new_value:
            updates["skin_type"] = new_value

    # List fields - merge without duplicates
    _merge_list_field(updates, existing, extracted, "skin_concerns")
    _merge_list_field(updates, existing, extracted, "favorite_brands")
    _merge_list_field(updates, existing, extracted, "preferred_categories")
    _merge_list_field(updates, existing, extracted, "allergies")

    # Price range - replace
    if "price_range_min" in extracted:
        updates["price_range_min"] = extracted["price_range_min"]
    if "price_range_max" in extracted:
        updates["price_range_max"] = extracted["price_range_max"]

    _normalize_price_range(updates)
    return updates


def _merge_list_field(
    updates: Dict[str, object],
    existing: Optional[UserPreference],
    extracted: Dict[str, object],
    field_name: str
) -> None:
    """Merge a list field from extracted into updates."""
    if field_name not in extracted:
        return

    new_list = extracted[field_name]
    if not isinstance(new_list, list) or not new_list:
        return

    existing_list = getattr(existing, field_name, None) if existing else None
    updates[field_name] = _merge_lists(existing_list, new_list)


def _merge_lists(
    existing_list: Optional[List[str]],
    new_list: List[str]
) -> List[str]:
    """Merge two lists, avoiding duplicates (case-insensitive)."""
    existing_list = existing_list or []
    existing_lower = {item.lower()
                      for item in existing_list if isinstance(item, str)}

    merged = existing_list[:]
    for item in new_list:
        if not isinstance(item, str):
            continue
        if item.lower() not in existing_lower:
            merged.append(item)
            existing_lower.add(item.lower())

    return merged


def _to_updates(extracted: PreferenceExtraction) -> Dict[str, object]:
    """Convert extraction to updates dict."""
    updates: Dict[str, object] = {}

    if extracted.skin_type:
        updates["skin_type"] = extracted.skin_type.strip()

    if extracted.skin_concerns:
        updates["skin_concerns"] = _clean_list(extracted.skin_concerns)

    if extracted.favorite_brands:
        updates["favorite_brands"] = _clean_list(extracted.favorite_brands)

    if extracted.preferred_categories:
        updates["preferred_categories"] = _clean_list(
            extracted.preferred_categories)

    if extracted.allergies:
        updates["allergies"] = _clean_list(extracted.allergies)

    if extracted.price_range_min is not None:
        updates["price_range_min"] = float(extracted.price_range_min)
    if extracted.price_range_max is not None:
        updates["price_range_max"] = float(extracted.price_range_max)

    _normalize_price_range(updates)
    return updates


def _clean_list(values: List[str]) -> List[str]:
    """Clean a list of strings, removing duplicates and empty values."""
    cleaned: List[str] = []
    seen = set()

    for value in values:
        if not isinstance(value, str):
            continue
        item = value.strip()
        if not item:
            continue
        key = item.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(item)

    return cleaned


def _normalize_price_range(updates: Dict[str, object]) -> None:
    """Ensure min_price <= max_price."""
    min_value = updates.get("price_range_min")
    max_value = updates.get("price_range_max")

    if min_value is None or max_value is None:
        return

    try:
        if float(min_value) > float(max_value):
            updates["price_range_min"], updates["price_range_max"] = max_value, min_value
    except (TypeError, ValueError):
        return


def _safe_parse_json(content: Any) -> Optional[Dict[str, object]]:
    """Safely parse JSON from LLM response."""
    if not content:
        return None

    text = content if isinstance(content, str) else str(content)
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code block
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(text[start:end + 1])
            except json.JSONDecodeError:
                return None

    return None
