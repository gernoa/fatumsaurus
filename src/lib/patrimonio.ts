export type AccountType = 'personal' | 'conjunta'

export interface PatrimonioAccount {
  id: string
  ownerId: string      // userId, 'shared' for conjunta
  name: string         // "BBVA corriente", "Openbank ahorro"...
  bank?: string        // optional bank name
  type: AccountType
  emoji: string
  balance: number      // current balance (manual)
  lastUpdated: string  // YYYY-MM-DD
  isActive: boolean
}

export const ACCOUNT_EMOJIS = ['🏦', '🏧', '💰', '💳', '🐖', '🏠', '💼', '🌍', '📈', '💵']

export const DEFAULT_ACCOUNTS: PatrimonioAccount[] = [
  {
    id: 'acc-default-personal',
    ownerId: 'ainhoa',
    name: 'Mi cuenta',
    type: 'personal',
    emoji: '🏦',
    balance: 0,
    lastUpdated: '2026-06-13',
    isActive: true,
  },
  {
    id: 'acc-default-conjunta',
    ownerId: 'shared',
    name: 'Cuenta conjunta',
    type: 'conjunta',
    emoji: '🏠',
    balance: 0,
    lastUpdated: '2026-06-13',
    isActive: true,
  },
]
