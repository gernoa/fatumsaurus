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

// ─── Mock data ────────────────────────────────────────────────────────────────

export const ALL_GASTOS: Gasto[] = [
  // ── Personal — Junio ─────────────────────────────────────────────────────
  { id: 'g1',  description: 'Supermercado',          amount: 67.40, category: 'alimentacion', date: '2026-06-13', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g2',  description: 'Farmacia',              amount: 23.50, category: 'salud',        date: '2026-06-12', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g3',  description: 'Gasolina',              amount: 58.00, category: 'transporte',   date: '2026-06-11', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g4',  description: 'Restaurante La Tasca',  amount: 24.50, category: 'alimentacion', date: '2026-06-10', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g5',  description: 'Spotify',               amount:  9.99, category: 'suscripcion',  date: '2026-06-09', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g6',  description: 'Café El Comercio',      amount:  4.20, category: 'alimentacion', date: '2026-06-08', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g7',  description: 'Netflix',               amount: 15.99, category: 'suscripcion',  date: '2026-06-05', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g8',  description: 'Zara',                  amount: 45.00, category: 'personal',     date: '2026-06-04', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g9',  description: 'Amazon — accesorios',   amount: 32.00, category: 'hogar',        date: '2026-06-02', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },

  // ── Personal — Mayo ──────────────────────────────────────────────────────
  { id: 'g10', description: 'Supermercado',           amount: 89.30, category: 'alimentacion', date: '2026-05-31', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g11', description: 'Gasolina',               amount: 62.00, category: 'transporte',   date: '2026-05-28', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g12', description: 'Clínica dental',         amount: 85.00, category: 'salud',        date: '2026-05-25', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g13', description: 'Restaurante cumpleaños', amount: 31.50, category: 'alimentacion', date: '2026-05-22', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g14', description: 'Ropa temporada',         amount: 68.00, category: 'personal',     date: '2026-05-20', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g15', description: 'Amazon — hogar',         amount: 24.50, category: 'hogar',        date: '2026-05-15', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g16', description: 'Café',                   amount:  3.80, category: 'alimentacion', date: '2026-05-12', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g17', description: 'Spotify',                amount:  9.99, category: 'suscripcion',  date: '2026-05-09', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g18', description: 'Netflix',                amount: 15.99, category: 'suscripcion',  date: '2026-05-05', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g19', description: 'Farmacia',               amount: 14.20, category: 'salud',        date: '2026-05-03', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },
  { id: 'g20', description: 'Parking centro',         amount:  8.00, category: 'transporte',   date: '2026-05-01', paidById: 'ainhoa', paidVia: 'personal', thirdParty: [] },

  // ── Conjunta — gastos del hogar ──────────────────────────────────────────
  { id: 'e1',  description: 'Alquiler enero',    amount: 750, category: 'alquiler',    date: '2026-01-05', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e2',  description: 'Factura luz',        amount:  75, category: 'suministros', date: '2026-01-15', paidById: 'javier', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e3',  description: 'Factura gas',        amount:  50, category: 'suministros', date: '2026-01-18', paidById: 'javier', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e4',  description: 'Internet',           amount:  25, category: 'suministros', date: '2026-01-22', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e5',  description: 'Alquiler febrero',   amount: 750, category: 'alquiler',    date: '2026-02-05', paidById: 'javier', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e6',  description: 'Factura luz',        amount:  70, category: 'suministros', date: '2026-02-14', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e7',  description: 'Factura gas',        amount:  45, category: 'suministros', date: '2026-02-18', paidById: 'javier', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e8',  description: 'Internet',           amount:  25, category: 'suministros', date: '2026-02-22', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e9',  description: 'Limpieza hogar',     amount:  10, category: 'hogar',       date: '2026-02-28', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e10', description: 'Alquiler marzo',     amount: 750, category: 'alquiler',    date: '2026-03-05', paidById: 'javier', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e11', description: 'Factura luz',        amount:  80, category: 'suministros', date: '2026-03-14', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e12', description: 'Factura gas',        amount:  45, category: 'suministros', date: '2026-03-18', paidById: 'javier', paidVia: 'conjunta', thirdParty: [] },
  { id: 'e13', description: 'Internet',           amount:  25, category: 'suministros', date: '2026-03-22', paidById: 'ainhoa', paidVia: 'conjunta', thirdParty: [] },

  // ── EJEMPLO MIXTO: conjunta + parte para mamá ─────────────────────────────
  {
    id: 'mx1',
    description: 'Mercadona (con compra de mamá)',
    amount: 95.99,
    category: 'alimentacion',
    date: '2026-03-28',
    paidById: 'ainhoa',
    paidVia: 'conjunta',
    thirdParty: [{ userId: 'madre', amount: 18.00 }],
  },
]
