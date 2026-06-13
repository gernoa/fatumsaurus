'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { type PatrimonioAccount, DEFAULT_ACCOUNTS } from '@/lib/patrimonio'

interface PatrimonioContextValue {
  accounts: PatrimonioAccount[]
  addAccount: (a: Omit<PatrimonioAccount, 'id'>) => void
  updateAccount: (id: string, patch: Partial<PatrimonioAccount>) => void
  deleteAccount: (id: string) => void
}

const PatrimonioContext = createContext<PatrimonioContextValue | null>(null)

export function PatrimonioProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<PatrimonioAccount[]>(DEFAULT_ACCOUNTS)

  function addAccount(a: Omit<PatrimonioAccount, 'id'>) {
    setAccounts((prev) => [...prev, { ...a, id: `acc-${Date.now()}` }])
  }

  function updateAccount(id: string, patch: Partial<PatrimonioAccount>) {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a))
  }

  function deleteAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <PatrimonioContext.Provider value={{ accounts, addAccount, updateAccount, deleteAccount }}>
      {children}
    </PatrimonioContext.Provider>
  )
}

export function usePatrimonio() {
  const ctx = useContext(PatrimonioContext)
  if (!ctx) throw new Error('usePatrimonio must be used inside PatrimonioProvider')
  return ctx
}
