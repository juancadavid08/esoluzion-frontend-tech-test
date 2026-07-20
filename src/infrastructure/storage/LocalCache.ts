const CACHE_TTL = 1000 * 60 * 60

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const value = JSON.parse(raw) as { ts: number; data: T }
    if (Date.now() - value.ts > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return value.data
  } catch {
    return null
  }
}

export function writeCache(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    /* storage is optional */
  }
}
