import React, {useEffect, useState, useContext} from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, addToCart } from '../api'
import { CartContext } from '../App'
import Loader from '../components/Loader'
import { useToast } from '../components/Toast'

export default function ProductDetailPage(){
  const {id} = useParams()
  const [product,setProduct] = useState<Product | null>(null)
  const [loading,setLoading] = useState(true)
  const [color,setColor] = useState<number | null>(null)
  const [storage,setStorage] = useState<number | null>(null)
  const {setCount} = useContext(CartContext)
  const toast = useToast()
  const colorOptions = product?.options?.colors ?? []
  const storageOptions = product?.options?.storages ?? []

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    if(!id){
      setLoading(false)
      return
    }
    getProductById(id).then(p=>{
      if(!mounted) return
      setProduct(p)
      setColor(p?.options?.colors?.[0]?.code ?? null)
      setStorage(p?.options?.storages?.[0]?.code ?? null)
      setLoading(false)
    }).catch(()=>{
      setLoading(false)
      toast.push('Error cargando producto')
    })
    return ()=>{
      mounted = false
    }
  },[id,toast])

  if(loading) return <Loader />
  if(!product) return <div style={{marginTop:16}}>Producto no encontrado. <Link to="/">Volver</Link></div>

  const handleAdd = async ()=>{
    try{
      const resp = await addToCart({id:product.id, colorCode: color||0, storageCode: storage||0})
      setCount(Number(resp.count||0))
      toast.push('Añadido al carrito')
    }catch(e){
      console.warn('Add to cart error', e)
      toast.push('Error al añadir')
    }
  }

  return (
    <div style={{marginTop:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>{product.brand} {product.model}</h3>
        <Link to="/">Volver a la lista</Link>
      </div>

      <div className="details">
        <div className="left card">
          <div className="imgBox">{product.imgUrl ? <img src={product.imgUrl} alt="" style={{maxWidth:'100%',maxHeight:'100%'}}/> : 'Imagen'}</div>
        </div>
        <div className="right card">
          <div>
            <strong>Precio: </strong> <span className="price">{product.price ? `${product.price} €` : '—'}</span>
          </div>
          <div style={{marginTop:12}}>
            <div><strong>Detalles</strong></div>
            <ul>
              <li>CPU: {product.cpu || '—'}</li>
              <li>RAM: {product.ram || '—'}</li>
              <li>Sistema: {product.os || '—'}</li>
              <li>Resolución: {product.displayResolution || product.display || '—'}</li>
              <li>Batería: {product.battery || '—'}</li>
              <li>Cámaras: {product.camera || product.primaryCamera?.join(', ') || product.secondaryCmera?.join(', ') || '—'}</li>
              <li>Dimensiones: {product.dimension || product.dimentions || '—'}</li>
              <li>Peso: {product.weight || '—'}</li>
            </ul>
          </div>

          <div style={{marginTop:12}}>
            <div><label htmlFor="storage-select">Almacenamiento</label></div>
            <select id="storage-select" className="select" value={storage ?? ''} onChange={e=>setStorage(Number(e.target.value))}>
              {storageOptions.map(s=> <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>

            <div><label htmlFor="color-select">Color</label></div>
            <select id="color-select" className="select" value={color ?? ''} onChange={e=>setColor(Number(e.target.value))}>
              {colorOptions.map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>

            <div>
              <button className="btn" onClick={handleAdd}>Añadir</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
