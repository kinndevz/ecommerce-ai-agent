let inMemoryAccessToken: string | null = null

export const getAccessToken = (): string | null => {
  return inMemoryAccessToken
}

export const setAccessToken = (token: string | null): void => {
  inMemoryAccessToken = token

  if (import.meta.env.DEV) {
    console.log(
      '[Token Service] Access token set:',
      token ? 'Token stored' : 'Token cleared'
    )
  }
}

export const clearAccessToken = (): void => {
  inMemoryAccessToken = null

  if (import.meta.env.DEV) {
    console.log('[Token Service] Access token cleared')
  }
}

export const hasAccessToken = (): boolean => {
  return inMemoryAccessToken !== null
}
