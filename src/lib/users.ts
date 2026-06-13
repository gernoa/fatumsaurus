import { useSession } from '@/contexts/sessionContext'
import type { UserProfile } from '@/contexts/sessionContext'

export interface AppUser {
  id:      string
  name:    string
  initial: string
}

// Datos estáticos — vacíos, solo existen para que gasto.ts/inversiones.ts no rompan.
// Los componentes React deben usar useUsers() en su lugar.
export const APP_USERS: AppUser[]       = []
export const CURRENT_USER_ID            = ''
export const CONJUNTA_MEMBER_IDS: string[] = []

function profileToAppUser(u: UserProfile): AppUser {
  return {
    id:      u.id,
    name:    u.display_name,
    initial: u.display_name[0]?.toUpperCase() ?? '?',
  }
}

// Lookup por ID en una lista dada (fallback al placeholder si no se encuentra)
export function getUser(id: string, users: AppUser[] = APP_USERS): AppUser {
  return users.find((u) => u.id === id) ?? { id, name: id.substring(0, 8), initial: id[0]?.toUpperCase() ?? '?' }
}

// Hook para usar en componentes React en lugar de las constantes estáticas
export function useUsers() {
  const { user, allUsers, partner } = useSession()

  const appUsers: AppUser[]         = allUsers.map(profileToAppUser)
  const currentUser: AppUser        = profileToAppUser(user)
  const partnerUser: AppUser | null = partner ? profileToAppUser(partner) : null
  const otherUsers: AppUser[]       = appUsers.filter((u) => u.id !== user.id)

  function getUserById(id: string): AppUser {
    return appUsers.find((u) => u.id === id) ?? { id, name: id.substring(0, 8), initial: id[0]?.toUpperCase() ?? '?' }
  }

  return {
    currentUser,
    partnerUser,
    allUsers: appUsers,
    otherUsers,
    getUser: getUserById,
  }
}
