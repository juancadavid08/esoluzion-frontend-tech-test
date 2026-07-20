import type { ProductRepository } from '../../application/ports/ProductRepository'
import type { CartSelection, Product } from '../../domain/Product'
import { readCache, writeCache } from '../storage/LocalCache'

export class HttpProductRepository implements ProductRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll() {
    const key = 'cache:products'
    const cached = readCache<Product[]>(key)
    if (cached) return cached
    const response = await fetch(`${this.baseUrl}/api/product`)
    if (!response.ok) throw new Error('Failed to fetch products')
    const products = (await response.json()) as Product[]
    writeCache(key, products)
    return products
  }

  async findById(id: string | number) {
    const key = `cache:product:${id}`
    const cached = readCache<Product>(key)
    if (cached) return cached
    const response = await fetch(
      `${this.baseUrl}/api/product/${encodeURIComponent(id)}`
    )
    if (!response.ok) throw new Error('Failed to fetch product')
    const product = (await response.json()) as Product
    writeCache(key, product)
    return product
  }

  async addToCart(selection: CartSelection) {
    const response = await fetch(`${this.baseUrl}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selection)
    })
    if (!response.ok) throw new Error('Failed to add to cart')
    const data = (await response.json()) as { count?: number | string }
    const count = Number(data.count)
    if (!Number.isFinite(count) || count < 0)
      throw new Error('Invalid cart response')
    return { count }
  }
}
