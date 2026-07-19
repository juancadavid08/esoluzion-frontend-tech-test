import React from 'react'

type Props = Readonly<{ value:string; onChange:(v:string)=>void }>
export default function Search({value,onChange}:Props){
  return (
    <input
      className="searchBox"
      placeholder="Buscar por marca o modelo..."
      value={value}
      onChange={e=>onChange(e.target.value)}
      style={{padding:8,borderRadius:6,border:'1px solid #ddd'}}
    />
  )
}
