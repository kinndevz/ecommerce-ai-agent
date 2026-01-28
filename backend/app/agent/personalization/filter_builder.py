"""
Search filter builder for personalized product search.

Builds Elasticsearch filters from user preferences and query context.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any

from .vocabulary import normalize_text, normalize_list, clean_brand_name, clean_price


@dataclass
class SearchFilters:
    """
    Structured search filters for product search.
    
    Separates keyword search from structured filters for optimal ES querying.
    """
    keyword: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    skin_types: List[str] = field(default_factory=list)
    concerns: List[str] = field(default_factory=list)
    benefits: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    is_available: bool = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API calls."""
        result: Dict[str, Any] = {}

        if self.keyword:
            result["keyword"] = self.keyword
        if self.brand:
            result["brand"] = self.brand
        if self.category:
            result["category"] = self.category
        if self.skin_types:
            result["skin_types"] = self.skin_types
        if self.concerns:
            result["concerns"] = self.concerns
        if self.benefits:
            result["benefits"] = self.benefits
        if self.tags:
            result["tags"] = self.tags
        if self.min_price is not None:
            result["min_price"] = self.min_price
        if self.max_price is not None:
            result["max_price"] = self.max_price
        if self.is_available is not None:
            result["is_available"] = self.is_available

        return result

    def has_any_filter(self) -> bool:
        """Check if any filter is set."""
        return bool(
            self.brand or
            self.category or
            self.skin_types or
            self.concerns or
            self.benefits or
            self.tags or
            self.min_price is not None or
            self.max_price is not None
        )

    def clone(self) -> "SearchFilters":
        """Create a copy of this filter object."""
        return SearchFilters(
            keyword=self.keyword,
            brand=self.brand,
            category=self.category,
            skin_types=self.skin_types.copy(),
            concerns=self.concerns.copy(),
            benefits=self.benefits.copy(),
            tags=self.tags.copy(),
            min_price=self.min_price,
            max_price=self.max_price,
            is_available=self.is_available,
        )


class SearchFilterBuilder:
    """
    Builds search filters from user preferences and explicit query params.
    
    Merges preferences with explicit filters, with explicit values taking priority.
    """

    def build_from_preferences(
        self,
        preferences: Optional[Dict[str, Any]]
    ) -> SearchFilters:
        """
        Build search filters from user preferences only.
        
        Does not include keyword - that should come from user query.
        """
        if not preferences:
            return SearchFilters()

        return SearchFilters(
            skin_types=self._get_skin_types_from_prefs(preferences),
            concerns=normalize_list(preferences.get("skin_concerns")),
            min_price=clean_price(preferences.get("price_range_min")),
            max_price=clean_price(preferences.get("price_range_max")),
            brand=self._get_first_brand(preferences.get("favorite_brands")),
        )

    def build_from_query(
        self,
        keyword: Optional[str] = None,
        brand: Optional[str] = None,
        category: Optional[str] = None,
        skin_types: Optional[List[str]] = None,
        concerns: Optional[List[str]] = None,
        benefits: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        is_available: Optional[bool] = True,
    ) -> SearchFilters:
        """Build search filters from explicit query parameters."""
        return SearchFilters(
            keyword=normalize_text(keyword),
            brand=clean_brand_name(brand),
            category=normalize_text(category),
            skin_types=normalize_list(skin_types),
            concerns=normalize_list(concerns),
            benefits=normalize_list(benefits),
            tags=normalize_list(tags),
            min_price=clean_price(min_price),
            max_price=clean_price(max_price),
            is_available=is_available if is_available is not None else True,
        )

    def merge(
        self,
        base: SearchFilters,
        override: SearchFilters
    ) -> SearchFilters:
        """
        Merge two filter sets, with override taking priority.
        
        For lists, override replaces base if non-empty.
        For scalars, override replaces base if not None.
        """
        return SearchFilters(
            keyword=override.keyword or base.keyword,
            brand=override.brand or base.brand,
            category=override.category or base.category,
            skin_types=override.skin_types if override.skin_types else base.skin_types,
            concerns=override.concerns if override.concerns else base.concerns,
            benefits=override.benefits if override.benefits else base.benefits,
            tags=override.tags if override.tags else base.tags,
            min_price=override.min_price if override.min_price is not None else base.min_price,
            max_price=override.max_price if override.max_price is not None else base.max_price,
            is_available=override.is_available,
        )

    def build_merged(
        self,
        preferences: Optional[Dict[str, Any]],
        keyword: Optional[str] = None,
        brand: Optional[str] = None,
        category: Optional[str] = None,
        skin_types: Optional[List[str]] = None,
        concerns: Optional[List[str]] = None,
        benefits: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        is_available: Optional[bool] = True,
    ) -> SearchFilters:
        """
        Build filters by merging preferences with explicit query params.
        
        Explicit params override preferences.
        """
        base = self.build_from_preferences(preferences)
        override = self.build_from_query(
            keyword=keyword,
            brand=brand,
            category=category,
            skin_types=skin_types,
            concerns=concerns,
            benefits=benefits,
            tags=tags,
            min_price=min_price,
            max_price=max_price,
            is_available=is_available,
        )
        return self.merge(base, override)

    def _get_skin_types_from_prefs(
        self,
        preferences: Dict[str, Any]
    ) -> List[str]:
        """Extract skin types from preferences (single or list)."""
        result = []

        # Single skin_type field
        single_type = normalize_text(preferences.get("skin_type"))
        if single_type:
            result.append(single_type)

        # List skin_types field (if exists)
        type_list = normalize_list(preferences.get("skin_types"))
        for item in type_list:
            if item not in result:
                result.append(item)

        return result

    def _get_first_brand(
        self,
        brands: Optional[List[str]]
    ) -> Optional[str]:
        """Get first brand from favorites list."""
        if not brands:
            return None

        for brand in brands:
            cleaned = clean_brand_name(brand)
            if cleaned:
                return cleaned

        return None
