export type AccountType = 'personal' | 'conjunta'

export interface PatrimonioAccount {
  id: string
  ownerId: string        // userId, 'shared' for conjunta
  name: string
  bank?: string
  type: AccountType
  emoji: string
  balance: number
  lastUpdated: string    // YYYY-MM-DD
  isActive: boolean
  participantIds: string[] // for conjunta: who splits expenses; for personal: [ownerId]
}

export const ACCOUNT_EMOJIS = ['🏦', '🏧', '💰', '💳', '🐖', '🏠', '💼', '🌍', '📈', '💵']

// Las cuentas por defecto se generan en PatrimonioProvider con el ID real del usuario
export const DEFAULT_ACCOUNTS: PatrimonioAccount[] = []
