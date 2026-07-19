import React, {createContext, useContext, useState, useCallback, useMemo} from 'react'

type Toast = { id:number; message:string }
const ToastContext = createContext<{push:(msg:string)=>void}>({push:()=>{}})

export function ToastProvider({children}:{readonly children:React.ReactNode}){
  const [toasts,setToasts] = useState<Toast[]>([])
  const remove = useCallback((id:number)=>{
    setToasts(t=>t.filter(x=>x.id!==id))
  },[])

  const push = useCallback((message:string)=>{
    const id = Date.now()
    setToasts(t=>[...t,{id,message}])
    // schedule removal
    window.setTimeout(()=>remove(id),3000)
  },[remove])

  const value = useMemo(()=>({push}),[push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{position:'fixed',right:12,top:12,zIndex:1000}}>
        {toasts.map(t=> (
          <div key={t.id} style={{background:'#111',color:'#fff',padding:'8px 12px',borderRadius:6,marginTop:8}}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){return useContext(ToastContext)}
