import { CURRENT_USER_ID, CONJUNTA_MEMBER_IDS } from './users'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PagoOrigen = 'personal' | 'conjunta'

export type GastoCategory =
  | 'alimentacion' | 'alquiler' | 'hogar' | 'salud' | 'transporte'
  | 'personal' | 'ocio' | 'suscripcion' | 'suministros' | 'trabajo' | 'viaje' | 'otro'

export interface CategoryMeta {
  slug: GastoCategory
  label: string
  colorClass: string
  dotClass: string
}

export const GASTO_CATEGORIES: CategoryMeta[] = [
  { slug: 'alimentacion', label: 'Alimentación', colorClass: 'bg-ambar/15 text-ambar',              dotClass: 'bg-ambar' },
  { slug: 'alquiler',     label: 'Alquiler',     colorClass: 'bg-noche-marina/15 text-petroleo',    dotClass: 'bg-noche-marina' },
  { slug: 'hogar',        label: 'Hogar',        colorClass: 'bg-petroleo/15 text-petroleo',         dotClass: 'bg-petroleo' },
  { slug: 'salud',        label: 'Salud',        colorClass: 'bg-teal-brand/15 text-teal-brand',    dotClass: 'bg-teal-brand' },
  { slug: 'transporte',   label: 'Transporte',   colorClass: 'bg-menta/25 text-petroleo',           dotClass: 'bg-menta' },
  { slug: 'personal',     label: 'Personal',     colorClass: 'bg-rojo-tierra/10 text-rojo-tierra',  dotClass: 'bg-rojo-tierra' },
  { slug: 'ocio',         label: 'Ocio',         colorClass: 'bg-arena/60 text-foreground',         dotClass: 'bg-arena' },
  { slug: 'suscripcion',  label: 'Suscripción',  colorClass: 'bg-petroleo/10 text-petroleo',        dotClass: 'bg-petroleo' },
  { slug: 'suministros',  label: 'Suministros',  colorClass: 'bg-teal-brand/10 text-teal-brand',   dotClass: 'bg-teal-brand' },
  { slug: 'trabajo',      label: 'Trabajo',      colorClass: 'bg-secondary text-muted-foreground',  dotClass: 'bg-muted-foreground' },
  { slug: 'viaje',        label: 'Viaje',        colorClass: 'bg-teal-brand/10 text-teal-brand',   dotClass: 'bg-teal-brand' },
  { slug: 'otro',         label: 'Otro',         colorClass: 'bg-secondary text-muted-foreground',  dotClass: 'bg-muted-foreground' },
]

export function getCategoryMeta(slug: GastoCategory): CategoryMeta {
  return GASTO_CATEGORIES.find((c) => c.slug === slug) ?? GASTO_CATEGORIES[GASTO_CATEGORIES.length - 1]
}

export interface GastoThirdParty {
  userId: string
  amount: number
}

/**
 * Unified expense record. A single Gasto flows to:
 * - GastosView (if paidVia === 'personal' && paidById === currentUser)
 * - ConjuntaView (if paidVia === 'conjunta') — using conjuntaAmount()
 * - Third-party debts (if thirdParty.length > 0) — each entry is a debt
 *   from that user, split equally among conjunta members if paidVia === 'conjunta'
 */
export type RecurringFrequency = 'weekly' | 'monthly' | 'bimonthly' | 'yearly'

export interface GastoRecurring {
  frequency: RecurringFrequency
  nextDate: string   // YYYY-MM-DD
}

export interface Gasto {
  id: string
  description: string
  amount: number       // TOTAL amount paid
  date: string         // YYYY-MM-DD
  category: GastoCategory
  paidById: string
  paidVia: PagoOrigen
  accountId?: string   // which account was debited
  notes?: string
  thirdParty: GastoThirdParty[]
  recurring?: GastoRecurring
}

// ─── Derived calculations ─────────────────────────────────────────────────────

/** Amount going to the payer's scope (personal or conjunta), after third-party portions */
export function netAmount(g: Gasto): number {
  return round2(g.amount - g.thirdParty.reduce((s, t) => s + t.amount, 0))
}

/** Returns gastos visible to a specific user */
export function gastosForUser(all: Gasto[], userId: string): Gasto[] {
  return all.filter((g) =>
    g.paidById === userId ||
    (g.paidVia === 'conjunta' && CONJUNTA_MEMBER_IDS.includes(userId)) ||
    g.thirdParty.some((t) => t.userId === userId)
  )
}

export function personalGastos(all: Gasto[], userId = CURRENT_USER_ID): Gasto[] {
  return all.filter((g) => g.paidVia === 'personal' && g.paidById === userId)
}

export function conjuntaGastos(all: Gasto[]): Gasto[] {
  return all.filter((g) => g.paidVia === 'conjunta')
}

export function filterByMonth(gastos: Gasto[], year: number, month: number): Gasto[] {
  return gastos.filter((g) => {
    const d = new Date(g.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

export function totalAmount(gastos: Gasto[]): number {
  return round2(gastos.reduce((s, g) => s + g.amount, 0))
}

export function categoryTotals(gastos: Gasto[]): Partial<Record<GastoCategory, number>> {
  const totals: Partial<Record<GastoCategory, number>> = {}
  for (const g of gastos) {
    totals[g.category] = round2((totals[g.category] ?? 0) + g.amount)
  }
  return totals
}

export function groupByDate(gastos: Gasto[]): [string, Gasto[]][] {
  const map = new Map<string, Gasto[]>()
  const sorted = [...gastos].sort((a, b) => b.date.localeCompare(a.date))
  for (const g of sorted) {
    if (!map.has(g.date)) map.set(g.date, [])
    map.get(g.date)!.push(g)
  }
  return Array.from(map.entries())
}

/** All third-party debts derived from conjunta gastos */
export interface ThirdPartyDebt {
  gastoId: string
  gastoDescription: string
  date: string
  userId: string
  totalOwed: number    // what this person owes for this gasto
  perMember: number    // split equally among conjunta members
}

export function thirdPartyDebts(all: Gasto[]): ThirdPartyDebt[] {
  const nMembers = CONJUNTA_MEMBER_IDS.length
  return conjuntaGastos(all).flatMap((g) =>
    g.thirdParty.map((tp) => ({
      gastoId: g.id,
      gastoDescription: g.description,
      date: g.date,
      userId: tp.userId,
      totalOwed: tp.amount,
      perMember: round2(tp.amount / nMembers),
    }))
  )
}

function round2(n: number) { return Math.round(n * 100) / 100 }

// ─── Datos iniciales (vacíos — añade los tuyos desde la app) ────────────────────

export const ALL_GASTOS: Gasto[] = []
