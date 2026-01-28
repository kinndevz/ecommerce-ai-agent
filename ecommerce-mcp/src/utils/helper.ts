/**
 * Helper Utilities
 */

/**
 * Create tool description with metadata
 * Format: "{metadata_json} | {human_description}"
 */
export function createToolDescription(
  metadata: {
    agent: string;
    category?: string;
    requires_auth?: boolean;
  },
  humanDescription: string
): string {
  return `${JSON.stringify(metadata)} | ${humanDescription}`;
}

/**
 * Validate auth token presence
 */
export function validateAuthToken(token?: string): void {
  if (!token) {
    throw new Error("No auth token provided (internal error).");
  }
}

/**
 * Clean parameters (remove null/undefined values)
 */
export function cleanParams<T extends Record<string, any>>(
  params: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  ) as Partial<T>;
}

/**
 * Serialize params with repeated keys for arrays
 */
export function serializeParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}
