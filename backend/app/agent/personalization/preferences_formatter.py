"""
Preferences formatter for system prompt injection.

Formats user preferences into a structured prompt section
that helps the agent understand user context.
"""

from typing import Any, Dict, List, Optional


class PreferencesFormatter:
    """
    Formats user preferences for injection into system prompt.
    
    Provides structured, readable format that helps the agent
    understand and use user preferences effectively.
    """

    MAX_LIST_ITEMS = 5
    MAX_BRANDS = 3

    def format_for_prompt(
        self,
        preferences: Optional[Dict[str, Any]],
        include_header: bool = True
    ) -> str:
        """
        Format preferences as a prompt section.
        
        Returns empty string if no preferences.
        """
        if not preferences:
            return ""

        parts = self._build_preference_parts(preferences)

        if not parts:
            return ""

        content = "\n".join(f"- {part}" for part in parts)

        if include_header:
            return f"\n\n**USER PREFERENCES:**\n{content}"

        return content

    def format_for_tool_context(
        self,
        preferences: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Format preferences as structured context for tool calls.
        
        Returns a dict that can be used to pre-fill tool parameters.
        """
        if not preferences:
            return {}

        context: Dict[str, Any] = {}

        skin_type = preferences.get("skin_type")
        if skin_type:
            context["skin_types"] = [skin_type]

        concerns = preferences.get("skin_concerns", [])
        if concerns:
            context["concerns"] = concerns[:self.MAX_LIST_ITEMS]

        brands = preferences.get("favorite_brands", [])
        if brands:
            context["preferred_brand"] = brands[0] if brands else None

        price_min = preferences.get("price_range_min")
        price_max = preferences.get("price_range_max")
        if price_min is not None:
            context["min_price"] = float(price_min)
        if price_max is not None:
            context["max_price"] = float(price_max)

        categories = preferences.get("preferred_categories", [])
        if categories:
            context["preferred_category"] = categories[0] if categories else None

        allergies = preferences.get("allergies", [])
        if allergies:
            context["allergies"] = allergies[:self.MAX_LIST_ITEMS]

        return context

    def summarize(
        self,
        preferences: Optional[Dict[str, Any]],
        max_length: int = 200
    ) -> str:
        """
        Create a short summary of preferences.
        
        Useful for conversation context or debugging.
        """
        if not preferences:
            return "Chưa có thông tin sở thích."

        parts = []

        skin_type = preferences.get("skin_type")
        if skin_type:
            parts.append(skin_type)

        concerns = preferences.get("skin_concerns", [])
        if concerns:
            parts.append(", ".join(concerns[:2]))

        brands = preferences.get("favorite_brands", [])
        if brands:
            parts.append(f"thích {brands[0]}")

        if not parts:
            return "Chưa có thông tin sở thích."

        summary = " | ".join(parts)

        if len(summary) > max_length:
            summary = summary[:max_length - 3] + "..."

        return summary

    def get_missing_preferences(
        self,
        preferences: Optional[Dict[str, Any]]
    ) -> List[str]:
        """
        Identify which key preferences are missing.
        
        Returns list of missing preference names for clarification questions.
        """
        missing = []

        if not preferences:
            return ["skin_type", "skin_concerns", "price_range"]

        if not preferences.get("skin_type"):
            missing.append("skin_type")

        if not preferences.get("skin_concerns"):
            missing.append("skin_concerns")

        if (preferences.get("price_range_min") is None and
                preferences.get("price_range_max") is None):
            missing.append("price_range")

        return missing

    def suggest_clarification_question(
        self,
        preferences: Optional[Dict[str, Any]]
    ) -> Optional[str]:
        """
        Suggest a clarification question based on missing preferences.
        
        Returns None if preferences are complete enough.
        """
        missing = self.get_missing_preferences(preferences)

        if not missing:
            return None

        if "skin_type" in missing:
            return "Bạn có thể cho mình biết loại da của bạn không? (da dầu, da khô, da hỗn hợp, da nhạy cảm, da thường)"

        if "skin_concerns" in missing:
            return "Bạn đang quan tâm đến vấn đề da nào? (ví dụ: mụn, thâm nám, lão hóa, khô da)"

        if "price_range" in missing:
            return "Bạn có ngân sách dự kiến không?"

        return None

    def _build_preference_parts(
        self,
        preferences: Dict[str, Any]
    ) -> List[str]:
        """Build list of formatted preference strings."""
        parts = []

        skin_type = preferences.get("skin_type")
        if skin_type:
            parts.append(f"Loại da: {skin_type}")

        concerns = preferences.get("skin_concerns", [])
        if concerns:
            concern_str = ", ".join(concerns[:self.MAX_LIST_ITEMS])
            parts.append(f"Vấn đề da: {concern_str}")

        brands = preferences.get("favorite_brands", [])
        if brands:
            brand_str = ", ".join(brands[:self.MAX_BRANDS])
            parts.append(f"Thương hiệu yêu thích: {brand_str}")

        price_min = preferences.get("price_range_min")
        price_max = preferences.get("price_range_max")
        if price_min is not None or price_max is not None:
            price_str = self._format_price_range(price_min, price_max)
            parts.append(f"Ngân sách: {price_str}")

        categories = preferences.get("preferred_categories", [])
        if categories:
            cat_str = ", ".join(categories[:self.MAX_LIST_ITEMS])
            parts.append(f"Danh mục quan tâm: {cat_str}")

        allergies = preferences.get("allergies", [])
        if allergies:
            allergy_str = ", ".join(allergies[:self.MAX_LIST_ITEMS])
            parts.append(f"Dị ứng/Tránh: {allergy_str}")

        return parts

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
