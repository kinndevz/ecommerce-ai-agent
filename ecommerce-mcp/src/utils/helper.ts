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
