import React, { useEffect, useState, useContext } from 'react'
import { getProducts } from '../api'
import ProductItem from '../components/ProductItem'
import Search from '../components/Search'
import { CartContext } from '../App'
import Loader from '../components/Loader'
import { useToast } from '../components/Toast'
import type { Product } from '../domain/Product'

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [q, setQ] = useState('')
  const { setCount } = useContext(CartContext)
  const toast = useToast()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(false)
    getProducts()
      .then((data) => {
        if (!mounted) return
        setProducts(data)
        setLoading(false)
        const persisted = Number(localStorage.getItem('cartCount') || 0)
        setCount(persisted)
      })
      .catch(() => {
        if (!mounted) return
        setLoading(false)
        setError(true)
        toast.push('Error cargando productos')
      })
    return () => {
      mounted = false
    }
  }, [setCount, toast, retry])

  const filtered = products.filter((p) => {
    if (!q) return true
    const s = q.toLowerCase()
    return (
      (p.brand || '').toLowerCase().includes(s) ||
      (p.model || '').toLowerCase().includes(s)
    )
  })

  return (
    <main>
      <div className="pageHeading">
        <h1>Productos</h1>
        <div className="searchWrapper">
          <Search value={q} onChange={setQ} />
        </div>
      </div>

      {loading && <Loader />}
      {!loading && error && (
        <section className="statePanel" role="alert">
          <h2>No pudimos cargar los productos</h2>
          <p>Comprueba tu conexión e inténtalo de nuevo.</p>
          <button
            className="btn"
            onClick={() => setRetry((value) => value + 1)}
          >
            Reintentar
          </button>
        </section>
      )}
      {!loading && !error && filtered.length === 0 && (
        <section className="statePanel" aria-live="polite">
          <h2>Sin resultados</h2>
          <p>No hay productos que coincidan con “{q}”.</p>
          <button className="secondaryBtn" onClick={() => setQ('')}>
            Limpiar búsqueda
          </button>
        </section>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid">
          {filtered.map((p) => (
            <ProductItem key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  )
}
