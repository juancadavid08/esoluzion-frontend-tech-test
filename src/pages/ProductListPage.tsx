import React, {useEffect, useState, useContext} from 'react'
import { getProducts } from '../api'
import ProductItem from '../components/ProductItem'
import Search from '../components/Search'
import { CartContext } from '../App'
import Loader from '../components/Loader'
import { useToast } from '../components/Toast'

export default function ProductListPage(){
  const [products,setProducts] = useState<Product[]>([])
  const [loading,setLoading] = useState(true)
  const [q,setQ] = useState('')
  const {setCount} = useContext(CartContext)
  const toast = useToast()

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    getProducts().then(data=>{
      if(!mounted) return
      setProducts(data)
      setLoading(false)
      const persisted = Number(localStorage.getItem('cartCount')||0)
      setCount(persisted)
    }).catch(()=>{
      setLoading(false)
      toast.push('Error cargando productos')
    })
    return ()=>{
      mounted = false
    }
  },[setCount,toast])

  const filtered = products.filter(p=>{
    if(!q) return true
    const s = q.toLowerCase()
    return (p.brand||'').toLowerCase().includes(s) || (p.model||'').toLowerCase().includes(s)
  })

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',marginTop:16, gap:12}}>
        <h2 style={{margin:0}}>Productos</h2>
        <div style={{marginLeft:'auto'}}>
          <Search value={q} onChange={setQ} />
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="grid">
          {filtered.map(p=> <ProductItem key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
