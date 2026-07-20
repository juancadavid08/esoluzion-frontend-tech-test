const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://itx-frontend-test.onrender.com'
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

function _getCache<T>(key: string): T | null{
  try{
    const raw = localStorage.getItem(key)
    if(!raw) return null
    const obj = JSON.parse(raw)
    if(Date.now() - obj.ts > CACHE_TTL) return null
    return obj.data as T
  }catch(e){
    console.warn('Cache read error', e)
    return null
  }
}
function _setCache(key: string, data: unknown){
  try{localStorage.setItem(key,JSON.stringify({ts:Date.now(),data}))}catch(e){console.warn('Cache write error', e)}
}

export async function getProducts(): Promise<Product[]>{
  const key = 'cache:products'
  const cached = _getCache<Product[]>(key)
  if(cached) return cached
  const res = await fetch(`${API_BASE}/api/product`)
  if(!res.ok) throw new Error('Failed to fetch products')
  const data = await res.json()
  _setCache(key,data)
  return data
}

export async function getProductById(id: string | number): Promise<Product>{
  const key = `cache:product:${id}`
  const cached = _getCache<Product>(key)
  if(cached) return cached
  const res = await fetch(`${API_BASE}/api/product/${id}`)
  if(!res.ok) throw new Error('Failed to fetch product')
  const data = await res.json()
  _setCache(key,data)
  return data
}

export async function addToCart({id, colorCode, storageCode}:{id: string|number,colorCode:number,storageCode:number}){
  const res = await fetch(`${API_BASE}/api/cart`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, colorCode, storageCode})
  })
  if(!res.ok) throw new Error('Failed to add to cart')
  const data = await res.json() as { count?: number | string }

  // Some sandbox APIs return a constant count; keep a monotonic local count as fallback.
  const serverCount = Number(data.count ?? 0)
  const persistedCount = getPersistedCartCount()
  const nextCount = Number.isFinite(serverCount) && serverCount > persistedCount
    ? serverCount
    : persistedCount + 1

  try{localStorage.setItem('cartCount', String(nextCount))}catch(e){console.warn('Persist cart count error', e)}
  return { ...data, count: nextCount }
}

export function getPersistedCartCount(){
  try{return Number(localStorage.getItem('cartCount')||0)}catch(e){console.warn('Read persisted cart count', e); return 0}
}
