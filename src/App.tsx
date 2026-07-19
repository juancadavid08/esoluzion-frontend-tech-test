import React, {useEffect, useState, createContext} from 'react'
import { Routes, Route, Link } from 'react-router-dom'
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
  setCount: (()=>undefined) as React.Dispatch<React.SetStateAction<number>>
})

export default function App(){
  const [count,setCount] = useState<number>(getPersistedCartCount())

  useEffect(()=>{
    function onStorage(e: StorageEvent){
      if(e.key==='cartCount') setCount(Number(e.newValue||0))
    }
    window.addEventListener('storage',onStorage)
    return ()=>window.removeEventListener('storage',onStorage)
  },[])

  const value = React.useMemo(()=>({count,setCount}),[count])

  return (
    <CartContext.Provider value={value}>
      <ToastProvider>
        <div className="container">
          <header className="header">
            <div style={{display:'flex',alignItems:'center'}}>
              <Link to="/" className="brand">ITX Shop</Link>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="breadcrumbs">SPA · Productos móviles</div>
              <div>🛒 <strong>{count}</strong></div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
          </Routes>
        </div>
      </ToastProvider>
    </CartContext.Provider>
  )
}
