'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type PatrimonioAccount } from '@/lib/patrimonio'
import { useSession } from '@/contexts/sessionContext'

interface PatrimonioContextValue {
  accounts:      PatrimonioAccount[]
  addAccount:    (a: Omit<PatrimonioAccount, 'id'>) => void
  updateAccount: (id: string, patch: Partial<PatrimonioAccount>) => void
  deleteAccount: (id: string) => void
}

const PatrimonioContext = createContext<PatrimonioContextValue | null>(null)

function storageKey(userId: string) {
  return `fatum_patrimonio_${userId}`
}

function loadAccounts(userId: string): PatrimonioAccount[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? (JSON.parse(raw) as PatrimonioAccount[]) : []
  } catch {
    return []
  }
}

export function PatrimonioProvider({ children }: { children: ReactNode }) {
  const { user } = useSession()

  const [accounts, setAccounts] = useState<PatrimonioAccount[]>(() =>
    loadAccounts(user.id)
  )

  // Persist to localStorage whenever accounts change
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(storageKey(user.id), JSON.stringify(accounts))
  }, [accounts, user.id])

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
