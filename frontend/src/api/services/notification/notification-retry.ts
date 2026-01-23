const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 30000

export const getRetryDelayMs = (attempt: number): number => {
  const delay = BASE_DELAY_MS * 2 ** attempt
  return Math.min(delay, MAX_DELAY_MS)
}
