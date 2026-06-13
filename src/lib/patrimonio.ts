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
    participantIds: ['ainhoa'],
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
    participantIds: ['ainhoa', 'javier'],
  },
]
