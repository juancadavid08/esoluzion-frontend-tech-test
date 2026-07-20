import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from 'react'

type Toast = { id: number; message: string }
const ToastContext = createContext<{ push: (msg: string) => void }>({
  push: () => {}
})

export function ToastProvider({
  children
}: {
  readonly children: React.ReactNode
}) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message: string) => {
      const id = Date.now()
      setToasts((t) => [...t, { id, message }])
      // schedule removal
      window.setTimeout(() => remove(id), 3000)
    },
    [remove]
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toastRegion" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="status">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
