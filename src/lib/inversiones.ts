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

export type FrecuenciaPeriodicidad = 'monthly' | 'weekly' | 'yearly'

export const FREQ_LABELS_INV: Record<FrecuenciaPeriodicidad, string> = {
  monthly: 'Mensual',
  weekly:  'Semanal',
  yearly:  'Anual',
}

export interface ProductPeriodicidad {
  activa:            boolean
  frecuencia:        FrecuenciaPeriodicidad
  diaMes:            number    // 1–31; para monthly el día del mes, para yearly el día del año
  importePorDefecto: number
  paraAmbos:         boolean   // true = también programa para la pareja (producto con mismo nombre)
  proximaFecha:      string    // YYYY-MM-DD — calculado automáticamente
}

export interface InversionProduct {
  id:           string
  ownerId:      string   // userId
  name:         string
  platform:     string
  type:         ProductType
  currency:     string   // 'EUR', 'USD', etc.
  isActive:     boolean
  periodicidad?: ProductPeriodicidad
}

export interface Aportacion {
  id:        string
  productId: string
  userId:    string
  amount:    number
  date:      string     // YYYY-MM-DD
  notes?:    string
  estado:    'confirmada' | 'pendiente'
}

export interface Valoracion {
  id:        string
  productId: string
  userId:    string
  value:     number     // total current value at this date
  date:      string     // YYYY-MM-DD
}

export interface ProductoStats {
  product:              InversionProduct
  userId:               string
  totalAportado:        number
  valorActual:          number | null      // null if no valoración yet
  ganancia:             number | null
  rentabilidad:         number | null     // percentage
  lastValoracionDate:   string | null
}

// ─── Periodicidad helpers ─────────────────────────────────────────────────

export function calcProximaFecha(
  frecuencia: FrecuenciaPeriodicidad,
  diaMes: number,
  desde?: string
): string {
  const ref = desde ? new Date(desde + 'T00:00:00') : new Date()
  if (frecuencia === 'monthly') {
    let d = new Date(ref.getFullYear(), ref.getMonth(), diaMes)
    if (d <= ref) d = new Date(ref.getFullYear(), ref.getMonth() + 1, diaMes)
    return d.toISOString().slice(0, 10)
  }
  if (frecuencia === 'weekly') {
    const d = new Date(ref)
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0, 10)
  }
  // yearly
  let d = new Date(ref.getFullYear(), ref.getMonth(), diaMes)
  if (d <= ref) d = new Date(ref.getFullYear() + 1, ref.getMonth(), diaMes)
  return d.toISOString().slice(0, 10)
}

export function advanceProximaFecha(p: ProductPeriodicidad): string {
  return calcProximaFecha(p.frecuencia, p.diaMes, p.proximaFecha)
}

// ─── Calculation helpers ──────────────────────────────────────────────────

export function getProductStats(
  product: InversionProduct,
  userId: string,
  aportaciones: Aportacion[],
  valoraciones: Valoracion[]
): ProductoStats {
  const myAportaciones = aportaciones.filter(
    (a) => a.productId === product.id && a.userId === userId && a.estado === 'confirmada'
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

export const MOCK_PRODUCTS:     InversionProduct[] = []
export const MOCK_APORTACIONES: Aportacion[]       = []
export const MOCK_VALORACIONES: Valoracion[]       = []
