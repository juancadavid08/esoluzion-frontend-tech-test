import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../domain/Product'

type Props = Readonly<{ product: Product }>

export default function ProductItem({ product }: Props) {
  return (
    <Link to={`/product/${product.id}`}>
      <div className="card">
        <div className="imgBox">
          {product.imgUrl ? (
            <img
              src={product.imgUrl}
              alt={`${product.brand ?? ''} ${product.model ?? ''}`.trim()}
            />
          ) : (
            <div className="muted">Sin imagen</div>
          )}
        </div>
        <div className="productSummary">
          <div className="productName">
            {product.brand} {product.model}
          </div>
          <div className="price">
            {product.price ? `${product.price} €` : '—'}
          </div>
        </div>
      </div>
    </Link>
  )
}
