export interface ConjuntaDeposit {
  id: string
  userId: string
  amount: number
  description: string
  date: string
}

export interface ConjuntaExpense {
  id: string
  description: string
  amount: number
  category: ConjuntaCategory
  date: string
}

export type ConjuntaCategory =
  | 'Alquiler'
  | 'Suministros'
  | 'Alimentación'
  | 'Hogar'
  | 'Otro'

export interface ConjuntaMember {
  id: string
  name: string
  initial: string
}

export interface ConjuntaBalance {
  userId: string
  deposited: number
  fairShare: number
  net: number // positive = is owed, negative = owes
}

// ─── Members ──────────────────────────────────────────────────────────────────

export const CONJUNTA_MEMBERS: ConjuntaMember[] = [
  { id: 'ainhoa', name: 'Ainhoa', initial: 'A' },
  { id: 'javier', name: 'Javier', initial: 'J' },
]

export const CURRENT_USER_ID = 'ainhoa'

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_DEPOSITS: ConjuntaDeposit[] = [
  { id: 'd1',  userId: 'ainhoa', amount: 300, description: 'Aportación enero',   date: '2026-01-01' },
  { id: 'd2',  userId: 'javier', amount: 700, description: 'Aportación enero',   date: '2026-01-01' },
  { id: 'd3',  userId: 'ainhoa', amount: 300, description: 'Aportación febrero', date: '2026-02-01' },
  { id: 'd4',  userId: 'javier', amount: 700, description: 'Aportación febrero', date: '2026-02-01' },
  { id: 'd5',  userId: 'ainhoa', amount: 300, description: 'Aportación marzo',   date: '2026-03-01' },
  { id: 'd6',  userId: 'javier', amount: 700, description: 'Aportación marzo',   date: '2026-03-01' },
]

export const MOCK_EXPENSES: ConjuntaExpense[] = [
  { id: 'e1',  description: 'Alquiler enero',    amount: 750, category: 'Alquiler',    date: '2026-01-05' },
  { id: 'e2',  description: 'Factura luz',        amount: 75,  category: 'Suministros', date: '2026-01-15' },
  { id: 'e3',  description: 'Factura gas',        amount: 50,  category: 'Suministros', date: '2026-01-18' },
  { id: 'e4',  description: 'Internet',           amount: 25,  category: 'Suministros', date: '2026-01-22' },
  { id: 'e5',  description: 'Alquiler febrero',   amount: 750, category: 'Alquiler',    date: '2026-02-05' },
  { id: 'e6',  description: 'Factura luz',        amount: 70,  category: 'Suministros', date: '2026-02-14' },
  { id: 'e7',  description: 'Factura gas',        amount: 45,  category: 'Suministros', date: '2026-02-18' },
  { id: 'e8',  description: 'Internet',           amount: 25,  category: 'Suministros', date: '2026-02-22' },
  { id: 'e9',  description: 'Limpieza hogar',     amount: 10,  category: 'Hogar',       date: '2026-02-28' },
  { id: 'e10', description: 'Alquiler marzo',     amount: 750, category: 'Alquiler',    date: '2026-03-05' },
  { id: 'e11', description: 'Factura luz',        amount: 80,  category: 'Suministros', date: '2026-03-14' },
  { id: 'e12', description: 'Factura gas',        amount: 45,  category: 'Suministros', date: '2026-03-18' },
  { id: 'e13', description: 'Internet',           amount: 25,  category: 'Suministros', date: '2026-03-22' },
]

// ─── Calculations ─────────────────────────────────────────────────────────────

export function totalDeposited(): number {
  return MOCK_DEPOSITS.reduce((s, d) => s + d.amount, 0)
}

export function depositedBy(userId: string): number {
  return MOCK_DEPOSITS.filter((d) => d.userId === userId).reduce((s, d) => s + d.amount, 0)
}

export function totalExpenses(): number {
  return MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0)
}

export function accountBalance(): number {
  return totalDeposited() - totalExpenses()
}

export function calculateConjuntaBalances(): ConjuntaBalance[] {
  const n = CONJUNTA_MEMBERS.length
  const totalExp = totalExpenses()
  const fairShare = round2(totalExp / n)

  return CONJUNTA_MEMBERS.map((m) => {
    const deposited = depositedBy(m.id)
    const net = round2(deposited - fairShare)
    return { userId: m.id, deposited, fairShare, net }
  })
}

export type ConjuntaTransaction =
  | { kind: 'deposit'; data: ConjuntaDeposit }
  | { kind: 'expense'; data: ConjuntaExpense }

export function allTransactions(): ConjuntaTransaction[] {
  const deps: ConjuntaTransaction[] = MOCK_DEPOSITS.map((d) => ({ kind: 'deposit', data: d }))
  const exps: ConjuntaTransaction[] = MOCK_EXPENSES.map((e) => ({ kind: 'expense', data: e }))
  return [...deps, ...exps].sort((a, b) => {
    const da = a.kind === 'deposit' ? a.data.date : a.data.date
    const db = b.kind === 'deposit' ? b.data.date : b.data.date
    return db.localeCompare(da)
  })
}

export const CATEGORY_COLORS: Record<ConjuntaCategory, string> = {
  Alquiler:     'bg-petroleo/15 text-petroleo',
  Suministros:  'bg-teal-brand/15 text-teal-brand',
  Alimentación: 'bg-ambar/15 text-ambar',
  Hogar:        'bg-menta/20 text-petroleo',
  Otro:         'bg-secondary text-muted-foreground',
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
