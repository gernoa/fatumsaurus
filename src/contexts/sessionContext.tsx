'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface UserProfile {
  id:           string
  display_name: string
  avatar_type:  string
  avatar_value: string | null
  email:        string
  partner_id:   string | null
}

interface SessionContextValue {
  user:     UserProfile
  allUsers: UserProfile[]
  partner:  UserProfile | null
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({
  user,
  allUsers,
  partner,
  children,
}: {
  user:     UserProfile
  allUsers: UserProfile[]
  partner:  UserProfile | null
  children: ReactNode
}) {
  return (
    <SessionContext.Provider value={{ user, allUsers, partner }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
