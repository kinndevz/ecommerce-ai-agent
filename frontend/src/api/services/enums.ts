export enum SkinType {
  OILY = 'oily',
  DRY = 'dry',
  COMBINATION = 'combination',
  SENSITIVE = 'sensitive',
  NORMAL = 'normal',
}

export enum SkinConcern {
  ACNE = 'acne',
  AGING = 'aging',
  DARK_SPOTS = 'dark_spots',
  WRINKLES = 'wrinkles',
  FINE_LINES = 'fine_lines',
  PORES = 'large_pores',
  DULLNESS = 'dullness',
  REDNESS = 'redness',
  PIGMENTATION = 'pigmentation',
  SCARRING = 'scarring',
  DRYNESS = 'dryness',
  OILINESS = 'oiliness',
}

export enum ProductBenefit {
  MOISTURIZING = 'moisturizing',
  BRIGHTENING = 'brightening',
  ANTI_AGING = 'anti_aging',
  HYDRATING = 'hydrating',
  SOOTHING = 'soothing',
  EXFOLIATING = 'exfoliating',
  FIRMING = 'firming',
  PORE_MINIMIZING = 'pore_minimizing',
  OIL_CONTROL = 'oil_control',
  ANTI_ACNE = 'anti_acne',
  NOURISHING = 'nourishing',
  PROTECTIVE = 'protective',
}

// Helper functions for display labels
export const SkinTypeLabels: Record<SkinType, string> = {
  [SkinType.OILY]: 'Oily',
  [SkinType.DRY]: 'Dry',
  [SkinType.COMBINATION]: 'Combination',
  [SkinType.SENSITIVE]: 'Sensitive',
  [SkinType.NORMAL]: 'Normal',
}

export const SkinConcernLabels: Record<SkinConcern, string> = {
  [SkinConcern.ACNE]: 'Acne',
  [SkinConcern.AGING]: 'Aging',
  [SkinConcern.DARK_SPOTS]: 'Dark Spots',
  [SkinConcern.WRINKLES]: 'Wrinkles',
  [SkinConcern.FINE_LINES]: 'Fine Lines',
  [SkinConcern.PORES]: 'Large Pores',
  [SkinConcern.DULLNESS]: 'Dullness',
  [SkinConcern.REDNESS]: 'Redness',
  [SkinConcern.PIGMENTATION]: 'Pigmentation',
  [SkinConcern.SCARRING]: 'Scarring',
  [SkinConcern.DRYNESS]: 'Dryness',
  [SkinConcern.OILINESS]: 'Oiliness',
}

export const ProductBenefitLabels: Record<ProductBenefit, string> = {
  [ProductBenefit.MOISTURIZING]: 'Moisturizing',
  [ProductBenefit.BRIGHTENING]: 'Brightening',
  [ProductBenefit.ANTI_AGING]: 'Anti-Aging',
  [ProductBenefit.HYDRATING]: 'Hydrating',
  [ProductBenefit.SOOTHING]: 'Soothing',
  [ProductBenefit.EXFOLIATING]: 'Exfoliating',
  [ProductBenefit.FIRMING]: 'Firming',
  [ProductBenefit.PORE_MINIMIZING]: 'Pore Minimizing',
  [ProductBenefit.OIL_CONTROL]: 'Oil Control',
  [ProductBenefit.ANTI_ACNE]: 'Anti-Acne',
  [ProductBenefit.NOURISHING]: 'Nourishing',
  [ProductBenefit.PROTECTIVE]: 'Protective',
}
