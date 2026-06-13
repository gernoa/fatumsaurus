export type AccountType = 'personal' | 'conjunta'

export interface Account {
  id: string
  ownerId: string   // userId, or 'shared' for conjunta
  name: string
  type: AccountType
  emoji: string
}

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-corriente', ownerId: 'ainhoa', name: 'Cuenta corriente', type: 'personal', emoji: '🏦' },
  { id: 'acc-visa',      ownerId: 'ainhoa', name: 'Tarjeta Visa',      type: 'personal', emoji: '💳' },
  { id: 'acc-conjunta',  ownerId: 'shared', name: 'Cuenta conjunta',   type: 'conjunta', emoji: '🏠' },
]

export function getAccountsForUser(userId: string): Account[] {
  return MOCK_ACCOUNTS.filter((a) => a.ownerId === userId || a.type === 'conjunta')
}

export function getAccount(id: string): Account | undefined {
  return MOCK_ACCOUNTS.find((a) => a.id === id)
}

export const DEFAULT_PERSONAL_ACCOUNT_ID = 'acc-corriente'
export const CONJUNTA_ACCOUNT_ID = 'acc-conjunta'
