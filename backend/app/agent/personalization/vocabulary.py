"""
Cosmetics domain vocabulary utilities.

Simple helper functions for text normalization.
No hardcoded mappings - data in DB is already in Vietnamese.
"""

from typing import List, Optional, Set


def normalize_text(value: Optional[str]) -> Optional[str]:
    """
    Normalize a text value for consistent matching.
    
    - Strips whitespace
    - Lowercases
    - Returns None if empty
    """
    if not value:
        return None

    normalized = value.strip().lower()
    return normalized if normalized else None


def normalize_list(values: Optional[List[str]]) -> List[str]:
    """
    Normalize a list of text values.
    
    - Removes duplicates (case-insensitive)
    - Removes empty values
    - Returns lowercased values
    """
    if not values:
        return []

    result: List[str] = []
    seen: Set[str] = set()

    for value in values:
        normalized = normalize_text(value)
        if normalized and normalized not in seen:
            result.append(normalized)
            seen.add(normalized)

    return result


def clean_brand_name(value: Optional[str]) -> Optional[str]:
    """
    Clean a brand name for filtering.
    
    Brands are case-insensitive but preserve original casing for display.
    """
    if not value:
        return None

    cleaned = value.strip()
    return cleaned if cleaned else None


def clean_price(value) -> Optional[float]:
    """
    Clean and convert a price value to float.
    
    Returns None if invalid.
    """
    if value is None:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None
