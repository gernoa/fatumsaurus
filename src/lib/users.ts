export interface AppUser {
  id: string
  name: string
  initial: string
}

export const APP_USERS: AppUser[] = [
  { id: 'ainhoa', name: 'Ainhoa', initial: 'A' },
  { id: 'javier', name: 'Javier', initial: 'J' },
  { id: 'madre',  name: 'Mamá',   initial: 'M' },
]

export const CURRENT_USER_ID = 'ainhoa'
export const CONJUNTA_MEMBER_IDS = ['ainhoa', 'javier']

export function getUser(id: string): AppUser {
  return APP_USERS.find((u) => u.id === id) ?? { id, name: id, initial: id[0]?.toUpperCase() ?? '?' }
}
