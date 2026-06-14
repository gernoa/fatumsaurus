'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { MOCK_SUSCRIPCIONES, type Suscripcion } from '@/lib/suscripciones'

let _id = 100
const uid = () => String(++_id)

interface SuscripcionesContextValue {
  suscripciones: Suscripcion[]
  add:    (s: Omit<Suscripcion, 'id'>) => void
  update: (id: string, patch: Partial<Omit<Suscripcion, 'id'>>) => void
  remove: (id: string) => void
  toggle: (id: string) => void
}

const SuscripcionesContext = createContext<SuscripcionesContextValue | null>(null)

export function SuscripcionesProvider({ children }: { children: ReactNode }) {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>(MOCK_SUSCRIPCIONES)

  function add(s: Omit<Suscripcion, 'id'>) {
    setSuscripciones((prev) => [...prev, { ...s, id: `sus-${uid()}` }])
  }

  function update(id: string, patch: Partial<Omit<Suscripcion, 'id'>>) {
    setSuscripciones((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s))
  }

  function remove(id: string) {
    setSuscripciones((prev) => prev.filter((s) => s.id !== id))
  }

  function toggle(id: string) {
    setSuscripciones((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s))
  }

  return (
    <SuscripcionesContext.Provider value={{ suscripciones, add, update, remove, toggle }}>
      {children}
    </SuscripcionesContext.Provider>
  )
}

export function useSuscripciones() {
  const ctx = useContext(SuscripcionesContext)
  if (!ctx) throw new Error('useSuscripciones must be inside SuscripcionesProvider')
  return ctx
}
