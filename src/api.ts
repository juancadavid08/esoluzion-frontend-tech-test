import type { CartSelection } from './domain/Product'
import { HttpProductRepository } from './infrastructure/http/HttpProductRepository'

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'https://itx-frontend-test.onrender.com'
const repository = new HttpProductRepository(API_BASE)

export const getProducts = () => repository.findAll()
export const getProductById = (id: string | number) => repository.findById(id)

export async function addToCart(selection: CartSelection) {
  const response = await repository.addToCart(selection)
  try {
    localStorage.setItem('cartCount', String(response.count))
  } catch {
    /* storage is optional */
  }
  return response
}

export function getPersistedCartCount() {
  try {
    const count = Number(localStorage.getItem('cartCount') ?? 0)
    return Number.isFinite(count) && count >= 0 ? count : 0
  } catch {
    return 0
  }
}
