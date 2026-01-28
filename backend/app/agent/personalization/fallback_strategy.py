"""
Fallback strategies for empty search results.

Provides progressive filter relaxation to find results when strict filters fail.
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional, Tuple

from .filter_builder import SearchFilters


class FallbackLevel(Enum):
    """Levels of filter relaxation."""
    NONE = 0
    RELAX_BRAND = 1
    RELAX_PRICE = 2
    RELAX_CONCERNS = 3
    RELAX_SKIN_TYPES = 4
    MATCH_ALL = 5


@dataclass
class FallbackResult:
    """Result of a fallback attempt."""
    filters: SearchFilters
    level: FallbackLevel
    message: str


class SearchFallbackStrategy:
    """
    Provides progressive fallback strategies for empty search results.
    
    When a search returns no results, progressively relaxes filters
    to find relevant products while maintaining user intent.
    """

    # Default price expansion factor (2x)
    PRICE_EXPANSION_FACTOR = 2.0

    # Minimum price floor
    MIN_PRICE_FLOOR = 0.0

    def get_fallback_sequence(
        self,
        original: SearchFilters
    ) -> List[FallbackResult]:
        """
        Generate a sequence of fallback filter configurations.
        
        Returns ordered list from least to most relaxed.
        """
        sequence = []

        # Level 1: Remove brand restriction
        if original.brand:
            relaxed = original.clone()
            relaxed.brand = None
            sequence.append(FallbackResult(
                filters=relaxed,
                level=FallbackLevel.RELAX_BRAND,
                message="Đã mở rộng tìm kiếm không giới hạn thương hiệu."
            ))

        # Level 2: Expand price range
        if original.min_price is not None or original.max_price is not None:
            relaxed = self._expand_price_range(original)
            sequence.append(FallbackResult(
                filters=relaxed,
                level=FallbackLevel.RELAX_PRICE,
                message="Đã mở rộng khoảng giá để có thêm lựa chọn."
            ))

        # Level 3: Remove concerns filter
        if original.concerns:
            relaxed = self._get_latest_filters(sequence, original).clone()
            relaxed.concerns = []
            sequence.append(FallbackResult(
                filters=relaxed,
                level=FallbackLevel.RELAX_CONCERNS,
                message="Đã tìm kiếm rộng hơn về vấn đề da."
            ))

        # Level 4: Remove skin types filter
        if original.skin_types:
            relaxed = self._get_latest_filters(sequence, original).clone()
            relaxed.skin_types = []
            sequence.append(FallbackResult(
                filters=relaxed,
                level=FallbackLevel.RELAX_SKIN_TYPES,
                message="Đã tìm kiếm cho tất cả loại da."
            ))

        # Level 5: Match all (only keyword remains)
        relaxed = SearchFilters(
            keyword=original.keyword,
            is_available=original.is_available,
        )
        sequence.append(FallbackResult(
            filters=relaxed,
            level=FallbackLevel.MATCH_ALL,
            message="Đã tìm kiếm rộng nhất có thể."
        ))

        return sequence

    def get_next_fallback(
        self,
        original: SearchFilters,
        current_level: FallbackLevel
    ) -> Optional[FallbackResult]:
        """
        Get the next fallback configuration after current level.
        
        Returns None if no more fallbacks available.
        """
        sequence = self.get_fallback_sequence(original)

        for result in sequence:
            if result.level.value > current_level.value:
                return result

        return None

    def suggest_filter_relaxation(
        self,
        original: SearchFilters
    ) -> Tuple[Optional[SearchFilters], Optional[str]]:
        """
        Suggest a single filter relaxation for user feedback.
        
        Returns (relaxed_filters, explanation) or (None, None) if no suggestion.
        """
        sequence = self.get_fallback_sequence(original)

        if not sequence:
            return None, None

        first = sequence[0]
        return first.filters, first.message

    def build_no_results_message(
        self,
        original: SearchFilters,
        suggestion: Optional[str] = None
    ) -> str:
        """
        Build a user-friendly message for no results.
        
        Includes context about what was searched and suggestions.
        """
        parts = ["Không tìm thấy sản phẩm phù hợp"]

        constraints = []
        if original.brand:
            constraints.append(f"hãng {original.brand}")
        if original.category:
            constraints.append(f"loại {original.category}")
        if original.min_price is not None or original.max_price is not None:
            price_str = self._format_price_range(
                original.min_price,
                original.max_price
            )
            constraints.append(f"giá {price_str}")

        if constraints:
            parts.append(f" với {', '.join(constraints)}")

        parts.append(".")

        if suggestion:
            parts.append(f" {suggestion}")

        return "".join(parts)

    def _expand_price_range(self, original: SearchFilters) -> SearchFilters:
        """Expand price range by configured factor."""
        relaxed = original.clone()

        if relaxed.min_price is not None:
            relaxed.min_price = max(
                self.MIN_PRICE_FLOOR,
                relaxed.min_price / self.PRICE_EXPANSION_FACTOR
            )

        if relaxed.max_price is not None:
            relaxed.max_price = relaxed.max_price * self.PRICE_EXPANSION_FACTOR

        return relaxed

    def _get_latest_filters(
        self,
        sequence: List[FallbackResult],
        original: SearchFilters
    ) -> SearchFilters:
        """Get the most relaxed filters from sequence, or original if empty."""
        if sequence:
            return sequence[-1].filters
        return original

    def _format_price_range(
        self,
        min_price: Optional[float],
        max_price: Optional[float]
    ) -> str:
        """Format price range for display."""
        if min_price is not None and max_price is not None:
            return f"{min_price:,.0f} - {max_price:,.0f} VNĐ"
        elif min_price is not None:
            return f"từ {min_price:,.0f} VNĐ"
        elif max_price is not None:
            return f"dưới {max_price:,.0f} VNĐ"
        return ""
