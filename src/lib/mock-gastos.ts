export interface GastoPersonal {
  id: string
  description: string
  amount: number
  category: GastoCategory
  date: string // YYYY-MM-DD
  notes?: string
}

export type GastoCategory =
  | 'alimentacion'
  | 'hogar'
  | 'salud'
  | 'transporte'
  | 'personal'
  | 'ocio'
  | 'suscripcion'
  | 'trabajo'
  | 'viaje'
  | 'otro'

export interface CategoryMeta {
  slug: GastoCategory
  label: string
  colorClass: string
  dotClass: string
}

export const GASTO_CATEGORIES: CategoryMeta[] = [
  { slug: 'alimentacion', label: 'Alimentación', colorClass: 'bg-ambar/15 text-ambar',            dotClass: 'bg-ambar' },
  { slug: 'hogar',        label: 'Hogar',        colorClass: 'bg-petroleo/15 text-petroleo',       dotClass: 'bg-petroleo' },
  { slug: 'salud',        label: 'Salud',        colorClass: 'bg-teal-brand/15 text-teal-brand',   dotClass: 'bg-teal-brand' },
  { slug: 'transporte',   label: 'Transporte',   colorClass: 'bg-menta/25 text-petroleo',          dotClass: 'bg-menta' },
  { slug: 'personal',     label: 'Personal',     colorClass: 'bg-rojo-tierra/10 text-rojo-tierra', dotClass: 'bg-rojo-tierra' },
  { slug: 'ocio',         label: 'Ocio',         colorClass: 'bg-arena/60 text-foreground',        dotClass: 'bg-arena' },
  { slug: 'suscripcion',  label: 'Suscripción',  colorClass: 'bg-petroleo/10 text-petroleo',       dotClass: 'bg-petroleo' },
  { slug: 'trabajo',      label: 'Trabajo',      colorClass: 'bg-secondary text-muted-foreground', dotClass: 'bg-muted-foreground' },
  { slug: 'viaje',        label: 'Viaje',        colorClass: 'bg-teal-brand/10 text-teal-brand',   dotClass: 'bg-teal-brand' },
  { slug: 'otro',         label: 'Otro',         colorClass: 'bg-secondary text-muted-foreground', dotClass: 'bg-muted-foreground' },
]

export function getCategoryMeta(slug: GastoCategory): CategoryMeta {
  return GASTO_CATEGORIES.find((c) => c.slug === slug) ?? GASTO_CATEGORIES[GASTO_CATEGORIES.length - 1]
}

export const MOCK_GASTOS: GastoPersonal[] = [
  // ── Junio 2026 ──────────────────────────────────────────────────────────────
  { id: 'g1',  description: 'Supermercado',          amount: 67.40, category: 'alimentacion', date: '2026-06-13' },
  { id: 'g2',  description: 'Farmacia',              amount: 23.50, category: 'salud',        date: '2026-06-12' },
  { id: 'g3',  description: 'Gasolina',              amount: 58.00, category: 'transporte',   date: '2026-06-11' },
  { id: 'g4',  description: 'Restaurante La Tasca',  amount: 24.50, category: 'alimentacion', date: '2026-06-10' },
  { id: 'g5',  description: 'Spotify',               amount:  9.99, category: 'suscripcion',  date: '2026-06-09' },
  { id: 'g6',  description: 'Café El Comercio',      amount:  4.20, category: 'alimentacion', date: '2026-06-08' },
  { id: 'g7',  description: 'Netflix',               amount: 15.99, category: 'suscripcion',  date: '2026-06-05' },
  { id: 'g8',  description: 'Zara',                  amount: 45.00, category: 'personal',     date: '2026-06-04' },
  { id: 'g9',  description: 'Amazon — accesorios',   amount: 32.00, category: 'hogar',        date: '2026-06-02' },

  // ── Mayo 2026 ────────────────────────────────────────────────────────────────
  { id: 'g10', description: 'Supermercado',          amount: 89.30, category: 'alimentacion', date: '2026-05-31' },
  { id: 'g11', description: 'Gasolina',              amount: 62.00, category: 'transporte',   date: '2026-05-28' },
  { id: 'g12', description: 'Clínica dental',        amount: 85.00, category: 'salud',        date: '2026-05-25' },
  { id: 'g13', description: 'Restaurante cumpleaños',amount: 31.50, category: 'alimentacion', date: '2026-05-22' },
  { id: 'g14', description: 'Ropa temporada',        amount: 68.00, category: 'personal',     date: '2026-05-20' },
  { id: 'g15', description: 'Amazon — hogar',        amount: 24.50, category: 'hogar',        date: '2026-05-15' },
  { id: 'g16', description: 'Café',                  amount:  3.80, category: 'alimentacion', date: '2026-05-12' },
  { id: 'g17', description: 'Spotify',               amount:  9.99, category: 'suscripcion',  date: '2026-05-09' },
  { id: 'g18', description: 'Netflix',               amount: 15.99, category: 'suscripcion',  date: '2026-05-05' },
  { id: 'g19', description: 'Farmacia',              amount: 14.20, category: 'salud',        date: '2026-05-03' },
  { id: 'g20', description: 'Parking centro',        amount:  8.00, category: 'transporte',   date: '2026-05-01' },
]

export function filterByMonth(gastos: GastoPersonal[], year: number, month: number): GastoPersonal[] {
  return gastos.filter((g) => {
    const d = new Date(g.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
}

export function totalForMonth(gastos: GastoPersonal[], year: number, month: number): number {
  return filterByMonth(gastos, year, month).reduce((s, g) => s + g.amount, 0)
}

export function categoryTotals(gastos: GastoPersonal[]): Record<GastoCategory, number> {
  const totals = {} as Record<GastoCategory, number>
  for (const g of gastos) {
    totals[g.category] = (totals[g.category] ?? 0) + g.amount
  }
  return totals
}

export function groupByDate(gastos: GastoPersonal[]): [string, GastoPersonal[]][] {
  const map = new Map<string, GastoPersonal[]>()
  const sorted = [...gastos].sort((a, b) => b.date.localeCompare(a.date))
  for (const g of sorted) {
    if (!map.has(g.date)) map.set(g.date, [])
    map.get(g.date)!.push(g)
  }
  return Array.from(map.entries())
}
