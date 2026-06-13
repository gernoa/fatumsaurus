'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { type PatrimonioAccount } from '@/lib/patrimonio'
import { useSession } from '@/contexts/sessionContext'

interface PatrimonioContextValue {
  accounts:      PatrimonioAccount[]
  addAccount:    (a: Omit<PatrimonioAccount, 'id'>) => void
  updateAccount: (id: string, patch: Partial<PatrimonioAccount>) => void
  deleteAccount: (id: string) => void
}

const PatrimonioContext = createContext<PatrimonioContextValue | null>(null)

export function PatrimonioProvider({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const today    = new Date().toISOString().split('T')[0]

  const [accounts, setAccounts] = useState<PatrimonioAccount[]>(() => [
    {
      id:             'acc-default-personal',
      ownerId:        user.id,
      name:           'Mi cuenta',
      type:           'personal',
      emoji:          '🏦',
      balance:        0,
      lastUpdated:    today,
      isActive:       true,
      participantIds: [user.id],
    },
    {
      id:             'acc-default-conjunta',
      ownerId:        'shared',
      name:           'Cuenta conjunta',
      type:           'conjunta',
      emoji:          '🏠',
      balance:        0,
      lastUpdated:    today,
      isActive:       true,
      participantIds: [user.id],
    },
  ])

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
