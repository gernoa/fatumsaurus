'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  MOCK_PRODUCTS,
  MOCK_APORTACIONES,
  MOCK_VALORACIONES,
  advanceProximaFecha,
  type InversionProduct,
  type Aportacion,
  type Valoracion,
} from '@/lib/inversiones'

let _id = 1000
const uid = () => String(++_id)

interface InversionesContextValue {
  products:     InversionProduct[]
  aportaciones: Aportacion[]
  valoraciones: Valoracion[]

  addProduct:    (p: Omit<InversionProduct, 'id'>) => void
  updateProduct: (id: string, patch: Partial<InversionProduct>) => void
  deleteProduct: (id: string) => void

  addAportaciones:   (items: Omit<Aportacion, 'id'>[]) => void
  updateAportacion:  (id: string, patch: Partial<Omit<Aportacion, 'id'>>) => void
  deleteAportacion:  (id: string) => void
  confirmAportacion: (id: string, actualAmount: number, actualDate: string) => void

  addValoraciones:    (items: Omit<Valoracion, 'id'>[]) => void
  updateValoracion:   (id: string, patch: Partial<Omit<Valoracion, 'id'>>) => void
  deleteValoracion:   (id: string) => void

  generatePendingAportaciones: (today: string, partnerUserId?: string) => void
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

  function updateAportacion(id: string, patch: Partial<Omit<Aportacion, 'id'>>) {
    setAportaciones((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a))
  }

  function deleteAportacion(id: string) {
    setAportaciones((prev) => prev.filter((a) => a.id !== id))
  }

  function confirmAportacion(id: string, actualAmount: number, actualDate: string) {
    // Confirm with the actual values
    setAportaciones((prev) => prev.map((a) =>
      a.id === id ? { ...a, amount: actualAmount, date: actualDate, estado: 'confirmada' } : a
    ))

    // Advance proximaFecha on the product's periodicidad
    setAportaciones((currentAps) => {
      const aportacion = currentAps.find((a) => a.id === id)
      if (!aportacion) return currentAps

      setProducts((currentProds) => currentProds.map((p) => {
        if (p.id !== aportacion.productId || !p.periodicidad) return p
        return {
          ...p,
          periodicidad: {
            ...p.periodicidad,
            proximaFecha: advanceProximaFecha(p.periodicidad),
          },
        }
      }))

      return currentAps
    })
  }

  function addValoraciones(items: Omit<Valoracion, 'id'>[]) {
    const withIds = items.map((v) => ({ ...v, id: `val-${uid()}` }))
    setValoraciones((prev) => [...prev, ...withIds])
  }

  function updateValoracion(id: string, patch: Partial<Omit<Valoracion, 'id'>>) {
    setValoraciones((prev) => prev.map((v) => v.id === id ? { ...v, ...patch } : v))
  }

  function deleteValoracion(id: string) {
    setValoraciones((prev) => prev.filter((v) => v.id !== id))
  }

  // Creates pending aportaciones for products with periodicidad due today or earlier
  function generatePendingAportaciones(today: string, partnerUserId?: string) {
    setProducts((currentProds) => {
      setAportaciones((currentAps) => {
        const newPending: Aportacion[] = []

        for (const product of currentProds) {
          if (!product.isActive || !product.periodicidad?.activa) continue
          const p = product.periodicidad
          if (p.proximaFecha > today) continue

          const alreadyPending = currentAps.some(
            (a) => a.productId === product.id && a.date === p.proximaFecha && a.estado === 'pendiente'
          )
          if (alreadyPending) continue

          newPending.push({
            id: `ap-${uid()}`,
            productId: product.id,
            userId: product.ownerId,
            amount: p.importePorDefecto,
            date: p.proximaFecha,
            estado: 'pendiente',
          })

          // If paraAmbos, also create for partner's matching product
          if (p.paraAmbos && partnerUserId) {
            const partnerProduct = currentProds.find(
              (pp) => pp.ownerId === partnerUserId && pp.name === product.name && pp.isActive
            )
            if (partnerProduct) {
              const partnerAlready = currentAps.some(
                (a) => a.productId === partnerProduct.id && a.date === p.proximaFecha && a.estado === 'pendiente'
              )
              if (!partnerAlready) {
                newPending.push({
                  id: `ap-${uid()}`,
                  productId: partnerProduct.id,
                  userId: partnerUserId,
                  amount: p.importePorDefecto,
                  date: p.proximaFecha,
                  estado: 'pendiente',
                })
              }
            }
          }
        }

        if (newPending.length === 0) return currentAps
        return [...currentAps, ...newPending]
      })

      return currentProds
    })
  }

  return (
    <InversionesContext.Provider
      value={{
        products, aportaciones, valoraciones,
        addProduct, updateProduct, deleteProduct,
        addAportaciones, updateAportacion, deleteAportacion, confirmAportacion,
        addValoraciones, updateValoracion, deleteValoracion,
        generatePendingAportaciones,
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
