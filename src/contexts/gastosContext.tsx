'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { dbToGasto, gastoToDbInsert, type Gasto, type RecurringFrequency } from '@/lib/gasto'

function addPeriod(dateStr: string, freq: RecurringFrequency): string {
  const d = new Date(dateStr)
  if (freq === 'weekly')    d.setDate(d.getDate() + 7)
  if (freq === 'monthly')   d.setMonth(d.getMonth() + 1)
  if (freq === 'bimonthly') d.setMonth(d.getMonth() + 2)
  if (freq === 'yearly')    d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

interface GastosContextValue {
  gastos:           Gasto[]
  loading:          boolean
  addGasto:         (g: Gasto) => Promise<void>
  updateGasto:      (g: Gasto) => void
  deleteGasto:      (id: string) => void
  refreshGastos:    () => Promise<void>
  advanceRecurring: (templateId: string, paidDate: string) => void
}

const GastosContext = createContext<GastosContextValue | null>(null)

export function GastosProvider({ children }: { children: ReactNode }) {
  const [gastos,  setGastos]  = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchGastos() {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await sb
      .from('gastos')
      .select('*')
      .or(`user_id.eq.${user.id},paid_by_id.eq.${user.id}`)
      .order('date', { ascending: false })

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setGastos(data.map((row: any) => dbToGasto(row)))
    }
    setLoading(false)
  }

  useEffect(() => { fetchGastos() }, [])

  async function addGasto(g: Gasto) {
    // Optimistic add with temp id
    setGastos((prev) => [g, ...prev])
    try {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) throw new Error('No autenticado')
      const { data, error } = await sb
        .from('gastos')
        .insert(gastoToDbInsert(g, user.id))
        .select('id')
        .single()
      if (error) throw error
      // Replace temp id with real UUID
      setGastos((prev) => prev.map((existing) =>
        existing.id === g.id ? { ...existing, id: data.id } : existing
      ))
    } catch (e) {
      // Revert optimistic add on failure
      setGastos((prev) => prev.filter((existing) => existing.id !== g.id))
      throw e
    }
  }

  function updateGasto(g: Gasto) {
    setGastos((prev) => prev.map((existing) => existing.id === g.id ? g : existing))
    // Only update DB for real UUIDs (not temp ids like 'g-1234')
    if (!g.id.startsWith('g-')) {
      const sb = createClient()
      sb.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        sb.from('gastos').update({
          description: g.description,
          amount:      g.amount,
          date:        g.date,
          category:    g.category,
          paid_via:    g.paidVia,
          compartido:  g.paidVia === 'conjunta',
          notes:       g.notes ?? null,
        }).eq('id', g.id).then(({ error }) => {
          if (error) console.error('Failed to update gasto:', error)
        })
      })
    }
  }

  function deleteGasto(id: string) {
    setGastos((prev) => prev.filter((g) => g.id !== id))
    if (!id.startsWith('g-')) {
      const sb = createClient()
      sb.from('gastos').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to delete gasto:', error)
      })
    }
  }

  async function refreshGastos() {
    setLoading(true)
    await fetchGastos()
  }

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
    <GastosContext.Provider value={{ gastos, loading, addGasto, updateGasto, deleteGasto, refreshGastos, advanceRecurring }}>
      {children}
    </GastosContext.Provider>
  )
}

export function useGastos() {
  const ctx = useContext(GastosContext)
  if (!ctx) throw new Error('useGastos must be used inside GastosProvider')
  return ctx
}
