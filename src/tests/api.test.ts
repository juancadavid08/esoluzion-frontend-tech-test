import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  addToCart,
  getPersistedCartCount,
  getProductById,
  getProducts
} from '../api'

describe('api module', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    localStorage.clear()
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('getProducts uses cache after first request', async () => {
    const payload = [{ id: 1, brand: 'A', model: 'M' }]
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload })

    const first = await getProducts()
    const second = await getProducts()

    expect(first).toEqual(payload)
    expect(second).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  test('getProductById throws when response is not ok', async () => {
    fetchMock.mockResolvedValue({ ok: false })

    await expect(getProductById('9')).rejects.toThrow('Failed to fetch product')
  })

  test('addToCart treats the server count as source of truth', async () => {
    localStorage.setItem('cartCount', '4')
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ count: 1 }) })

    const response = await addToCart({
      id: '1',
      colorCode: 10,
      storageCode: 20
    })

    expect(response.count).toBe(1)
    expect(localStorage.getItem('cartCount')).toBe('1')
  })

  test('addToCart keeps server count when it is greater than local count', async () => {
    localStorage.setItem('cartCount', '1')
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ count: 6 }) })

    const response = await addToCart({
      id: '1',
      colorCode: 10,
      storageCode: 20
    })

    expect(response.count).toBe(6)
    expect(localStorage.getItem('cartCount')).toBe('6')
  })

  test('getPersistedCartCount returns 0 when value is missing', () => {
    expect(getPersistedCartCount()).toBe(0)
  })
})
