import React, { useEffect, useState, createContext } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import { getPersistedCartCount } from './api'
import { ToastProvider } from './components/Toast'

type CartContextValue = {
  count: number
  setCount: React.Dispatch<React.SetStateAction<number>>
}

export const CartContext = createContext<CartContextValue>({
  count: 0,
  setCount: (() => undefined) as React.Dispatch<React.SetStateAction<number>>
})

function Header({ count }: { readonly count: number }) {
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/product/')

  return (
    <header className="header">
      <Link to="/" className="brand">
        ITX Shop
      </Link>
      <div className="headerMeta">
        <nav aria-label="Migas de pan">
          <ol className="breadcrumbs">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              {isDetail ? (
                <Link to="/">Productos</Link>
              ) : (
                <span aria-current="page">Productos</span>
              )}
            </li>
            {isDetail && (
              <li>
                <span aria-current="page">Detalle</span>
              </li>
            )}
          </ol>
        </nav>
        <div
          className="cartCount"
          aria-label={`${count} productos en el carrito`}
        >
          🛒 <strong>{count}</strong>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [count, setCount] = useState<number>(getPersistedCartCount())

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'cartCount') setCount(Number(e.newValue || 0))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = React.useMemo(() => ({ count, setCount }), [count])

  return (
    <CartContext.Provider value={value}>
      <ToastProvider>
        <div className="container">
          <Header count={count} />

          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </CartContext.Provider>
  )
}
