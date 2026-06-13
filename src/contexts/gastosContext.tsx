'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ALL_GASTOS, type Gasto, type RecurringFrequency } from '@/lib/gasto'

function addPeriod(dateStr: string, freq: RecurringFrequency): string {
  const d = new Date(dateStr)
  if (freq === 'weekly')    d.setDate(d.getDate() + 7)
  if (freq === 'monthly')   d.setMonth(d.getMonth() + 1)
  if (freq === 'bimonthly') d.setMonth(d.getMonth() + 2)
  if (freq === 'yearly')    d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

interface GastosContextValue {
  gastos:       Gasto[]
  addGasto:     (g: Gasto) => void
  updateGasto:  (g: Gasto) => void
  deleteGasto:  (id: string) => void
  advanceRecurring: (templateId: string, paidDate: string) => void
}

const GastosContext = createContext<GastosContextValue | null>(null)

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = useState<Gasto[]>(ALL_GASTOS)

  function addGasto(g: Gasto) {
    setGastos((prev) => [g, ...prev])
  }

  function updateGasto(g: Gasto) {
    setGastos((prev) => prev.map((existing) => existing.id === g.id ? g : existing))
  }

  function deleteGasto(id: string) {
    setGastos((prev) => prev.filter((g) => g.id !== id))
  }

  // After registering a recurring expense, advance the template's nextDate
  function advanceRecurring(templateId: string, paidDate: string) {
    setGastos((prev) => prev.map((g) => {
      if (g.id !== templateId || !g.recurring) return g
      return {
        ...g,
        recurring: {
          ...g.recurring,
          nextDate: addPeriod(paidDate, g.recurring.frequency),
        },
      }
    }))
  }

  return (
    <GastosContext.Provider value={{ gastos, addGasto, updateGasto, deleteGasto, advanceRecurring }}>
      {children}
    </GastosContext.Provider>
  )
}

export function useGastos() {
  const ctx = useContext(GastosContext)
  if (!ctx) throw new Error('useGastos must be used within GastosProvider')
  return ctx
}
