'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface UserProfile {
  id:           string
  display_name: string
  avatar_type:  string
  avatar_value: string | null
  email:        string
}

interface SessionContextValue {
  user: UserProfile
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({
  user,
  children,
}: {
  user:     UserProfile
  children: ReactNode
}) {
  return (
    <SessionContext.Provider value={{ user }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
