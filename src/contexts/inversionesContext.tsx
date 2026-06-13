'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  MOCK_PRODUCTS,
  MOCK_APORTACIONES,
  MOCK_VALORACIONES,
  type InversionProduct,
  type Aportacion,
  type Valoracion,
} from '@/lib/inversiones'

let _id = 1000
const uid = () => String(++_id)

interface InversionesContextValue {
  products:    InversionProduct[]
  aportaciones: Aportacion[]
  valoraciones: Valoracion[]

  addProduct:    (p: Omit<InversionProduct, 'id'>) => void
  updateProduct: (id: string, patch: Partial<InversionProduct>) => void
  deleteProduct: (id: string) => void

  addAportaciones: (items: Omit<Aportacion, 'id'>[]) => void
  addValoraciones: (items: Omit<Valoracion, 'id'>[]) => void
}

const InversionesContext = createContext<InversionesContextValue | null>(null)

export function InversionesProvider({ children }: { children: ReactNode }) {
  const [products,     setProducts]     = useState<InversionProduct[]>(MOCK_PRODUCTS)
  const [aportaciones, setAportaciones] = useState<Aportacion[]>(MOCK_APORTACIONES)
  const [valoraciones, setValoraciones] = useState<Valoracion[]>(MOCK_VALORACIONES)

  function addProduct(p: Omit<InversionProduct, 'id'>) {
    setProducts((prev) => [...prev, { ...p, id: `inv-${uid()}` }])
  }

  function updateProduct(id: string, patch: Partial<InversionProduct>) {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p))
  }

  function deleteProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function addAportaciones(items: Omit<Aportacion, 'id'>[]) {
    const withIds = items.map((a) => ({ ...a, id: `ap-${uid()}` }))
    setAportaciones((prev) => [...prev, ...withIds])
  }

  function addValoraciones(items: Omit<Valoracion, 'id'>[]) {
    const withIds = items.map((v) => ({ ...v, id: `val-${uid()}` }))
    setValoraciones((prev) => [...prev, ...withIds])
  }

  return (
    <InversionesContext.Provider
      value={{
        products, aportaciones, valoraciones,
        addProduct, updateProduct, deleteProduct,
        addAportaciones, addValoraciones,
      }}
    >
      {children}
    </InversionesContext.Provider>
  )
}

export function useInversiones() {
  const ctx = useContext(InversionesContext)
  if (!ctx) throw new Error('useInversiones must be inside InversionesProvider')
  return ctx
}
