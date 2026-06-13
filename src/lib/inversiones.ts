import { CURRENT_USER_ID } from './users'

// ─── Types ─────────────────────────────────────────────────────────────────

export type ProductType = 'fondo' | 'accion' | 'etf' | 'cripto' | 'plan_pensiones' | 'otro'

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  fondo:          'Fondo',
  accion:         'Acción',
  etf:            'ETF',
  cripto:         'Cripto',
  plan_pensiones: 'Plan pensiones',
  otro:           'Otro',
}

export const PRODUCT_TYPE_EMOJIS: Record<ProductType, string> = {
  fondo:          '📊',
  accion:         '📈',
  etf:            '🌐',
  cripto:         '₿',
  plan_pensiones: '🏛️',
  otro:           '💼',
}

export interface InversionProduct {
  id: string
  ownerId: string   // userId
  name: string
  platform: string
  type: ProductType
  currency: string  // 'EUR', 'USD', etc.
  isActive: boolean
}

export interface Aportacion {
  id: string
  productId: string
  userId: string
  amount: number
  date: string      // YYYY-MM-DD
  notes?: string
}

export interface Valoracion {
  id: string
  productId: string
  userId: string
  value: number     // total current value at this date
  date: string      // YYYY-MM-DD
}

export interface ProductoStats {
  product: InversionProduct
  userId: string
  totalAportado: number
  valorActual: number | null      // null if no valoración yet
  ganancia: number | null
  rentabilidad: number | null     // percentage
  lastValoracionDate: string | null
}

// ─── Calculation helpers ──────────────────────────────────────────────────

export function getProductStats(
  product: InversionProduct,
  userId: string,
  aportaciones: Aportacion[],
  valoraciones: Valoracion[]
): ProductoStats {
  const myAportaciones = aportaciones.filter(
    (a) => a.productId === product.id && a.userId === userId
  )
  const myValoraciones = valoraciones
    .filter((v) => v.productId === product.id && v.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date))

  const totalAportado = round2(myAportaciones.reduce((s, a) => s + a.amount, 0))
  const latest = myValoraciones[0]
  const valorActual = latest?.value ?? null
  const ganancia = valorActual !== null ? round2(valorActual - totalAportado) : null
  const rentabilidad =
    ganancia !== null && totalAportado > 0
      ? round2((ganancia / totalAportado) * 100)
      : null

  return {
    product,
    userId,
    totalAportado,
    valorActual,
    ganancia,
    rentabilidad,
    lastValoracionDate: latest?.date ?? null,
  }
}

export function getPortfolioTotals(stats: ProductoStats[]) {
  const totalAportado = round2(stats.reduce((s, p) => s + p.totalAportado, 0))
  const statsWith     = stats.filter((p) => p.valorActual !== null)
  const valorActual   = statsWith.length > 0
    ? round2(statsWith.reduce((s, p) => s + (p.valorActual ?? 0), 0))
    : null
  const ganancia      = valorActual !== null ? round2(valorActual - totalAportado) : null
  const rentabilidad  =
    ganancia !== null && totalAportado > 0
      ? round2((ganancia / totalAportado) * 100)
      : null
  return { totalAportado, valorActual, ganancia, rentabilidad }
}

function round2(n: number) { return Math.round(n * 100) / 100 }

// ─── Mock data ─────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: InversionProduct[] = [
  { id: 'inv-1', ownerId: 'ainhoa', name: 'Cartera indexada',   platform: 'Indexa Capital', type: 'fondo',  currency: 'EUR', isActive: true },
  { id: 'inv-2', ownerId: 'ainhoa', name: 'ETF MSCI World',     platform: 'Degiro',         type: 'etf',    currency: 'EUR', isActive: true },
  { id: 'inv-3', ownerId: 'javier', name: 'Cartera defensiva',  platform: 'Indexa Capital', type: 'fondo',  currency: 'EUR', isActive: true },
  { id: 'inv-4', ownerId: 'javier', name: 'Bitcoin',            platform: 'Coinbase',       type: 'cripto', currency: 'EUR', isActive: true },
]

export const MOCK_APORTACIONES: Aportacion[] = [
  // Ainhoa — Indexa: 100€/mes durante 6 meses
  { id: 'ap-1',  productId: 'inv-1', userId: 'ainhoa', amount: 100, date: '2026-01-01' },
  { id: 'ap-2',  productId: 'inv-1', userId: 'ainhoa', amount: 100, date: '2026-02-01' },
  { id: 'ap-3',  productId: 'inv-1', userId: 'ainhoa', amount: 100, date: '2026-03-01' },
  { id: 'ap-4',  productId: 'inv-1', userId: 'ainhoa', amount: 100, date: '2026-04-01' },
  { id: 'ap-5',  productId: 'inv-1', userId: 'ainhoa', amount: 100, date: '2026-05-01' },
  { id: 'ap-6',  productId: 'inv-1', userId: 'ainhoa', amount: 100, date: '2026-06-01' },
  // Ainhoa — ETF: 50€/mes
  { id: 'ap-7',  productId: 'inv-2', userId: 'ainhoa', amount: 50, date: '2026-01-01' },
  { id: 'ap-8',  productId: 'inv-2', userId: 'ainhoa', amount: 50, date: '2026-02-01' },
  { id: 'ap-9',  productId: 'inv-2', userId: 'ainhoa', amount: 50, date: '2026-03-01' },
  { id: 'ap-10', productId: 'inv-2', userId: 'ainhoa', amount: 50, date: '2026-04-01' },
  { id: 'ap-11', productId: 'inv-2', userId: 'ainhoa', amount: 50, date: '2026-05-01' },
  { id: 'ap-12', productId: 'inv-2', userId: 'ainhoa', amount: 50, date: '2026-06-01' },
  // Javier — Indexa: 150€/mes
  { id: 'ap-13', productId: 'inv-3', userId: 'javier', amount: 150, date: '2026-01-01' },
  { id: 'ap-14', productId: 'inv-3', userId: 'javier', amount: 150, date: '2026-02-01' },
  { id: 'ap-15', productId: 'inv-3', userId: 'javier', amount: 150, date: '2026-03-01' },
  { id: 'ap-16', productId: 'inv-3', userId: 'javier', amount: 150, date: '2026-04-01' },
  { id: 'ap-17', productId: 'inv-3', userId: 'javier', amount: 150, date: '2026-05-01' },
  { id: 'ap-18', productId: 'inv-3', userId: 'javier', amount: 150, date: '2026-06-01' },
  // Javier — Bitcoin: 50€/mes
  { id: 'ap-19', productId: 'inv-4', userId: 'javier', amount: 50, date: '2026-02-01' },
  { id: 'ap-20', productId: 'inv-4', userId: 'javier', amount: 50, date: '2026-03-01' },
  { id: 'ap-21', productId: 'inv-4', userId: 'javier', amount: 50, date: '2026-04-01' },
  { id: 'ap-22', productId: 'inv-4', userId: 'javier', amount: 50, date: '2026-05-01' },
  { id: 'ap-23', productId: 'inv-4', userId: 'javier', amount: 50, date: '2026-06-01' },
]

export const MOCK_VALORACIONES: Valoracion[] = [
  // Ainhoa — Indexa: rentabilidad positiva (+8%)
  { id: 'val-1', productId: 'inv-1', userId: 'ainhoa', value: 102, date: '2026-01-31' },
  { id: 'val-2', productId: 'inv-1', userId: 'ainhoa', value: 318, date: '2026-03-31' },
  { id: 'val-3', productId: 'inv-1', userId: 'ainhoa', value: 648, date: '2026-06-01' },
  // Ainhoa — ETF: ligeramente negativo (-1,7%)
  { id: 'val-4', productId: 'inv-2', userId: 'ainhoa', value: 155, date: '2026-03-31' },
  { id: 'val-5', productId: 'inv-2', userId: 'ainhoa', value: 295, date: '2026-06-01' },
  // Javier — Indexa: rentabilidad positiva (+6,9%)
  { id: 'val-6', productId: 'inv-3', userId: 'javier', value: 320, date: '2026-03-31' },
  { id: 'val-7', productId: 'inv-3', userId: 'javier', value: 962, date: '2026-06-01' },
  // Javier — Bitcoin: negativo (-6,7%)
  { id: 'val-8', productId: 'inv-4', userId: 'javier', value: 210, date: '2026-05-31' },
  { id: 'val-9', productId: 'inv-4', userId: 'javier', value: 233, date: '2026-06-01' },
]

export { CURRENT_USER_ID }
