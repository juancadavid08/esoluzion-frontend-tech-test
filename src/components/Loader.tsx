import React from 'react'

export default function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="srOnly">Cargando</span>
    </div>
  )
}
