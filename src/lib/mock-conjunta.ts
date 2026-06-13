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

// ─── Mock data (vacío — los datos reales vienen de la sesión y del contexto) ───

export const MOCK_DEPOSITS: ConjuntaDeposit[] = []
export const MOCK_EXPENSES: ConjuntaExpense[] = []

// Mantener para backwards compat (ConjuntaView ya no lo usa directamente)
export const CONJUNTA_MEMBERS: ConjuntaMember[] = []

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
