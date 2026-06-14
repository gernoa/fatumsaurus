export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly'
export type SuscripcionCategory =
  | 'streaming' | 'musica' | 'software' | 'nube' | 'juegos'
  | 'fitness' | 'noticias' | 'educacion' | 'trabajo' | 'otro'

export interface Suscripcion {
  id:          string
  name:        string
  category:    SuscripcionCategory
  amount:      number           // importe del ciclo
  cycle:       BillingCycle
  nextDate:    string           // ISO YYYY-MM-DD — próxima renovación
  startDate:   string           // ISO — fecha de inicio
  color:       string           // hex
  icon:        string           // emoji
  shared:      boolean          // ¿compartida con pareja?
  url?:        string
  notes?:      string
  active:      boolean
}

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly:    'Semanal',
  monthly:   'Mensual',
  quarterly: 'Trimestral',
  yearly:    'Anual',
}

export const CYCLE_MONTHS: Record<BillingCycle, number> = {
  weekly:    0.25,
  monthly:   1,
  quarterly: 3,
  yearly:    12,
}

export const CATEGORY_LABELS: Record<SuscripcionCategory, string> = {
  streaming:  'Streaming vídeo',
  musica:     'Música',
  software:   'Software',
  nube:       'Almacenamiento nube',
  juegos:     'Juegos',
  fitness:    'Fitness / salud',
  noticias:   'Noticias',
  educacion:  'Educación',
  trabajo:    'Trabajo',
  otro:       'Otro',
}

export const CATEGORY_EMOJIS: Record<SuscripcionCategory, string> = {
  streaming:  '🎬',
  musica:     '🎵',
  software:   '💻',
  nube:       '☁️',
  juegos:     '🎮',
  fitness:    '🏋️',
  noticias:   '📰',
  educacion:  '📚',
  trabajo:    '💼',
  otro:       '📦',
}

export const DEFAULT_COLORS: Record<SuscripcionCategory, string> = {
  streaming:  '#E50914',
  musica:     '#1DB954',
  software:   '#0A9396',
  nube:       '#005F73',
  juegos:     '#7B2FBE',
  fitness:    '#EE9B00',
  noticias:   '#001219',
  educacion:  '#CA6702',
  trabajo:    '#4A6070',
  otro:       '#94A3B8',
}

/** Coste mensual normalizado */
export function monthlyAmount(s: Suscripcion): number {
  return s.amount / CYCLE_MONTHS[s.cycle]
}

/** Coste anual normalizado */
export function yearlyAmount(s: Suscripcion): number {
  return monthlyAmount(s) * 12
}

/** Días hasta la próxima renovación (puede ser negativo si ya venció) */
export function daysUntilRenewal(s: Suscripcion, today: string): number {
  const diff = new Date(s.nextDate).getTime() - new Date(today).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** Avanza la fecha de renovación al siguiente ciclo */
export function advanceNextDate(s: Suscripcion): string {
  const d = new Date(s.nextDate)
  switch (s.cycle) {
    case 'weekly':    d.setDate(d.getDate() + 7);  break
    case 'monthly':   d.setMonth(d.getMonth() + 1); break
    case 'quarterly': d.setMonth(d.getMonth() + 3); break
    case 'yearly':    d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().split('T')[0]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_SUSCRIPCIONES: Suscripcion[] = [
  {
    id: 'sus-1', name: 'Netflix', category: 'streaming',
    amount: 17.99, cycle: 'monthly', nextDate: '2026-06-28', startDate: '2023-01-01',
    color: '#E50914', icon: '🎬', shared: true, active: true,
  },
  {
    id: 'sus-2', name: 'Spotify', category: 'musica',
    amount: 10.99, cycle: 'monthly', nextDate: '2026-06-22', startDate: '2022-06-01',
    color: '#1DB954', icon: '🎵', shared: true, active: true,
  },
  {
    id: 'sus-3', name: 'iCloud 200 GB', category: 'nube',
    amount: 2.99, cycle: 'monthly', nextDate: '2026-07-05', startDate: '2021-05-01',
    color: '#005F73', icon: '☁️', shared: false, active: true,
  },
  {
    id: 'sus-4', name: 'HBO Max', category: 'streaming',
    amount: 8.99, cycle: 'monthly', nextDate: '2026-07-12', startDate: '2024-01-15',
    color: '#4B0082', icon: '🎬', shared: true, active: true,
  },
  {
    id: 'sus-5', name: 'Adobe Creative Cloud', category: 'software',
    amount: 65.99, cycle: 'yearly', nextDate: '2026-09-01', startDate: '2025-09-01',
    color: '#FF0000', icon: '💻', shared: false, active: true,
  },
]
