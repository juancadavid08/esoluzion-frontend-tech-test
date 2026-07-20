import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, addToCart } from '../api'
import { CartContext } from '../App'
import Loader from '../components/Loader'
import { useToast } from '../components/Toast'
import type { Product } from '../domain/Product'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [color, setColor] = useState<number | null>(null)
  const [storage, setStorage] = useState<number | null>(null)
  const { setCount } = useContext(CartContext)
  const toast = useToast()
  const colorOptions = product?.options?.colors ?? []
  const storageOptions = product?.options?.storages ?? []

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(false)
    if (!id) {
      setLoading(false)
      return
    }
    getProductById(id)
      .then((p) => {
        if (!mounted) return
        setProduct(p)
        setColor(p?.options?.colors?.[0]?.code ?? null)
        setStorage(p?.options?.storages?.[0]?.code ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setLoading(false)
        setError(true)
        toast.push('Error cargando producto')
      })
    return () => {
      mounted = false
    }
  }, [id, toast, retry])

  if (loading) return <Loader />
  if (error)
    return (
      <main className="statePanel" role="alert">
        <h1>No pudimos cargar el producto</h1>
        <p>El producto no existe o el servicio no está disponible.</p>
        <button className="btn" onClick={() => setRetry((value) => value + 1)}>
          Reintentar
        </button>{' '}
        <Link to="/">Volver</Link>
      </main>
    )
  if (!product)
    return (
      <main className="statePanel">
        Producto no encontrado. <Link to="/">Volver</Link>
      </main>
    )

  const handleAdd = async () => {
    try {
      if (color === null || storage === null) return
      setSubmitting(true)
      const resp = await addToCart({
        id: product.id,
        colorCode: color,
        storageCode: storage
      })
      setCount(Number(resp.count || 0))
      toast.push('Añadido al carrito')
    } catch (e) {
      console.warn('Add to cart error', e)
      toast.push('Error al añadir')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="detailPage">
      <div className="detailHeading">
        <h1>
          {product.brand} {product.model}
        </h1>
        <Link to="/">Volver a la lista</Link>
      </div>

      <div className="details">
        <div className="left card">
          <div className="imgBox">
            {product.imgUrl ? (
              <img
                src={product.imgUrl}
                alt={`${product.brand ?? ''} ${product.model ?? ''}`.trim()}
              />
            ) : (
              'Sin imagen'
            )}
          </div>
        </div>
        <div className="right card">
          <div>
            <strong>Precio: </strong>{' '}
            <span className="price">
              {product.price ? `${product.price} €` : '—'}
            </span>
          </div>
          <section className="detailSection">
            <div>
              <strong>Detalles</strong>
            </div>
            <ul>
              <li>CPU: {product.cpu || '—'}</li>
              <li>RAM: {product.ram || '—'}</li>
              <li>Sistema: {product.os || '—'}</li>
              <li>
                Resolución:{' '}
                {product.displayResolution || product.display || '—'}
              </li>
              <li>Batería: {product.battery || '—'}</li>
              <li>
                Cámaras:{' '}
                {product.camera ||
                  product.primaryCamera?.join(', ') ||
                  product.secondaryCmera?.join(', ') ||
                  '—'}
              </li>
              <li>
                Dimensiones: {product.dimension || product.dimentions || '—'}
              </li>
              <li>Peso: {product.weight || '—'}</li>
            </ul>
          </section>

          <section className="detailSection" aria-label="Opciones del producto">
            <div>
              <label htmlFor="storage-select">Almacenamiento</label>
            </div>
            <select
              id="storage-select"
              className="select"
              value={storage ?? ''}
              onChange={(e) => setStorage(Number(e.target.value))}
            >
              {storageOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>

            <div>
              <label htmlFor="color-select">Color</label>
            </div>
            <select
              id="color-select"
              className="select"
              value={color ?? ''}
              onChange={(e) => setColor(Number(e.target.value))}
            >
              {colorOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>

            <div>
              <button
                className="btn"
                onClick={handleAdd}
                disabled={submitting || color === null || storage === null}
              >
                {submitting ? 'Añadiendo…' : 'Añadir al carrito'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
