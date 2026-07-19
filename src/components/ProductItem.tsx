import React from 'react'
import { Link } from 'react-router-dom'

type Props = Readonly<{ product: Product }>

export default function ProductItem({product}:Props){
  return (
    <Link to={`/product/${product.id}`}>
      <div className="card">
        <div className="imgBox">
          {product.imgUrl ? <img src={product.imgUrl} alt="" style={{maxWidth:'100%',maxHeight:'100%'}}/> : <div style={{opacity:.6}}>No image</div>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600}}>{product.brand} {product.model}</div>
          <div className="price">{product.price ? `${product.price} €` : '—'}</div>
        </div>
      </div>
    </Link>
  )
}
