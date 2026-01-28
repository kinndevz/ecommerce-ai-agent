"""
Personalization module for AI Agent.

This module provides:
- Text normalization utilities
- Search filter building from user context
- Fallback strategies for empty results
- Preferences formatting for prompt injection
"""

from .vocabulary import normalize_text, normalize_list, clean_brand_name, clean_price
from .filter_builder import SearchFilterBuilder, SearchFilters
from .fallback_strategy import SearchFallbackStrategy
from .preferences_formatter import PreferencesFormatter

__all__ = [
    "normalize_text",
    "normalize_list",
    "clean_brand_name",
    "clean_price",
    "SearchFilterBuilder",
    "SearchFilters",
    "SearchFallbackStrategy",
    "PreferencesFormatter",
]
