from enum import Enum


class SkinType(str, Enum):
    """Skin type classification"""
    OILY = "oily"
    DRY = "dry"
    COMBINATION = "combination"
    SENSITIVE = "sensitive"
    NORMAL = "normal"


class SkinConcern(str, Enum):
    """Skin concerns/issues"""
    ACNE = "acne"
    AGING = "aging"
    DARK_SPOTS = "dark_spots"
    WRINKLES = "wrinkles"
    FINE_LINES = "fine_lines"
    PORES = "large_pores"
    DULLNESS = "dullness"
    REDNESS = "redness"
    PIGMENTATION = "pigmentation"
    SCARRING = "scarring"
    DRYNESS = "dryness"
    OILINESS = "oiliness"


class ProductBenefit(str, Enum):
    """Product benefits"""
    MOISTURIZING = "moisturizing"
    BRIGHTENING = "brightening"
    ANTI_AGING = "anti_aging"
    HYDRATING = "hydrating"
    SOOTHING = "soothing"
    EXFOLIATING = "exfoliating"
    FIRMING = "firming"
    PORE_MINIMIZING = "pore_minimizing"
    OIL_CONTROL = "oil_control"
    ANTI_ACNE = "anti_acne"
    NOURISHING = "nourishing"
    PROTECTIVE = "protective"
