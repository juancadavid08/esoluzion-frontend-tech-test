import React from 'react'

type Props = Readonly<{ value: string; onChange: (v: string) => void }>
export default function Search({ value, onChange }: Props) {
  return (
    <div className="searchBox">
      <label htmlFor="product-search" className="srOnly">
        Buscar por marca o modelo
      </label>
      <input
        id="product-search"
        type="search"
        placeholder="Buscar por marca o modelo..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
