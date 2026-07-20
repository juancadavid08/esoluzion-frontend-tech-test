import type { CartSelection, Product } from '../../domain/Product'

export interface ProductRepository {
  findAll(): Promise<Product[]>
  findById(id: string | number): Promise<Product>
  addToCart(selection: CartSelection): Promise<{ count: number }>
}
