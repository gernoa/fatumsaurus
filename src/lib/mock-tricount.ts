export interface TricountUser {
  id: string
  name: string
  initial: string
}

export interface TricountExpense {
  id: string
  groupId: string
  description: string
  amount: number
  paidById: string
  date: string
  // Equal split among all group participants by default
}

export interface TricountGroup {
  id: string
  name: string
  participantIds: string[]
  expenses: TricountExpense[]
  settled: boolean
  createdAt: string
}

export interface Balance {
  userId: string
  paid: number
  owes: number
  net: number // positive = is owed, negative = owes
}

export interface Settlement {
  fromId: string
  toId: string
  amount: number
}

// ─── Mock users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: Record<string, TricountUser> = {
  ainhoa:  { id: 'ainhoa',  name: 'Ainhoa',  initial: 'A' },
  javier:  { id: 'javier',  name: 'Javier',  initial: 'J' },
  madre:   { id: 'madre',   name: 'Mamá',    initial: 'M' },
}

export const CURRENT_USER_ID = 'ainhoa'

// ─── Mock groups ──────────────────────────────────────────────────────────────

export const MOCK_TRICOUNT_GROUPS: TricountGroup[] = [
  {
    id: 'casa',
    name: 'Casa',
    participantIds: ['ainhoa', 'javier'],
    settled: false,
    createdAt: '2026-01-01',
    expenses: [
      { id: 'c1', groupId: 'casa', description: 'Alquiler enero',  amount: 900, paidById: 'javier', date: '2026-01-01' },
      { id: 'c2', groupId: 'casa', description: 'Factura luz',     amount: 65,  paidById: 'ainhoa', date: '2026-01-12' },
      { id: 'c3', groupId: 'casa', description: 'Factura gas',     amount: 45,  paidById: 'javier', date: '2026-01-14' },
      { id: 'c4', groupId: 'casa', description: 'Internet',        amount: 30,  paidById: 'ainhoa', date: '2026-01-15' },
      { id: 'c5', groupId: 'casa', description: 'Servicio limpieza', amount: 35, paidById: 'javier', date: '2026-01-20' },
      { id: 'c6', groupId: 'casa', description: 'Alquiler febrero', amount: 900, paidById: 'javier', date: '2026-02-01' },
      { id: 'c7', groupId: 'casa', description: 'Factura luz',     amount: 58,  paidById: 'ainhoa', date: '2026-02-13' },
      { id: 'c8', groupId: 'casa', description: 'Factura gas',     amount: 40,  paidById: 'javier', date: '2026-02-14' },
      { id: 'c9', groupId: 'casa', description: 'Internet',        amount: 30,  paidById: 'ainhoa', date: '2026-02-15' },
    ],
  },
  {
    id: 'menorca',
    name: 'Menorca 2026',
    participantIds: ['ainhoa', 'javier', 'madre'],
    settled: false,
    createdAt: '2026-05-01',
    expenses: [
      { id: 'm1', groupId: 'menorca', description: 'Vuelos ida y vuelta', amount: 360, paidById: 'ainhoa',  date: '2026-05-10' },
      { id: 'm2', groupId: 'menorca', description: 'Apartamento 7 noches', amount: 450, paidById: 'javier', date: '2026-05-10' },
      { id: 'm3', groupId: 'menorca', description: 'Comidas y cenas',      amount: 180, paidById: 'ainhoa',  date: '2026-05-15' },
      { id: 'm4', groupId: 'menorca', description: 'Excursión en barco',   amount: 90,  paidById: 'javier',  date: '2026-05-16' },
      { id: 'm5', groupId: 'menorca', description: 'Cena especial',        amount: 90,  paidById: 'madre',   date: '2026-05-17' },
    ],
  },
  {
    id: 'cumple',
    name: 'Cumple Ainhoa',
    participantIds: ['ainhoa', 'javier', 'madre'],
    settled: true,
    createdAt: '2026-03-15',
    expenses: [
      { id: 'b1', groupId: 'cumple', description: 'Cena restaurante', amount: 120, paidById: 'ainhoa', date: '2026-03-20' },
      { id: 'b2', groupId: 'cumple', description: 'Copas después',    amount: 45,  paidById: 'javier', date: '2026-03-20' },
    ],
  },
]

// ─── Balance calculation ───────────────────────────────────────────────────────

export function calculateBalances(group: TricountGroup): Balance[] {
  const n = group.participantIds.length
  const paid: Record<string, number> = {}
  const owes: Record<string, number> = {}

  for (const id of group.participantIds) {
    paid[id] = 0
    owes[id] = 0
  }

  for (const expense of group.expenses) {
    paid[expense.paidById] += expense.amount
    const share = expense.amount / n
    for (const id of group.participantIds) {
      owes[id] += share
    }
  }

  return group.participantIds.map((id) => ({
    userId: id,
    paid: round2(paid[id]),
    owes: round2(owes[id]),
    net: round2(paid[id] - owes[id]),
  }))
}

export function calculateSettlements(balances: Balance[]): Settlement[] {
  const credits = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ userId: b.userId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount)

  const debts = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ userId: b.userId, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount)

  const settlements: Settlement[] = []
  let ci = 0
  let di = 0

  while (ci < credits.length && di < debts.length) {
    const credit = credits[ci]
    const debt = debts[di]
    const amount = round2(Math.min(credit.amount, debt.amount))

    if (amount > 0.01) {
      settlements.push({ fromId: debt.userId, toId: credit.userId, amount })
    }

    credit.amount = round2(credit.amount - amount)
    debt.amount = round2(debt.amount - amount)

    if (credit.amount < 0.01) ci++
    if (debt.amount < 0.01) di++
  }

  return settlements
}

export function groupTotal(group: TricountGroup): number {
  return round2(group.expenses.reduce((sum, e) => sum + e.amount, 0))
}

export function myNetInGroup(group: TricountGroup): number {
  return calculateBalances(group).find((b) => b.userId === CURRENT_USER_ID)?.net ?? 0
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
