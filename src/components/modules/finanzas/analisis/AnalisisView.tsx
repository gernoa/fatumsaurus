'use client'

import { useState, useMemo } from 'react'
import {
  TrendingDown, TrendingUp, PiggyBank, Target,
  ChevronDown, ChevronUp, Info, ChevronLeft, ChevronRight,
  Calendar, BarChart3, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useGastos } from '@/contexts/gastosContext'
import { useUsers } from '@/lib/users'
import {
  getCategoryMeta,
  personalGastos,
  type GastoCategory,
  type Gasto,
} from '@/lib/gasto'

// ─── View modes ───────────────────────────────────────────────────────────────

type ViewMode   = 'mes' | 'año' | 'rango'
type RangePeriod = '3m' | '6m' | 'year' | 'last12'

const RANGE_LABELS: Record<RangePeriod, string> = {
  '3m':     'Últimos 3 meses',
  '6m':     'Últimos 6 meses',
  'year':   'Este año',
  'last12': 'Últimos 12 meses',
}

function getRangeFromTo(p: RangePeriod): { from: string; to: string; months: number } {
  const now = new Date()
  const to  = now.toISOString().slice(0, 10)
  let from: Date
  let months: number
  switch (p) {
    case '3m':     from = new Date(now.getFullYear(), now.getMonth() - 2, 1); months = 3; break
    case '6m':     from = new Date(now.getFullYear(), now.getMonth() - 5, 1); months = 6; break
    case 'year':   from = new Date(now.getFullYear(), 0, 1); months = now.getMonth() + 1; break
    case 'last12': from = new Date(now.getFullYear(), now.getMonth() - 11, 1); months = 12; break
  }
  return { from: from.toISOString().slice(0, 10), to, months }
}

// ─── Month helpers ────────────────────────────────────────────────────────────

function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// ─── Category data ────────────────────────────────────────────────────────────

interface CatData {
  slug:     GastoCategory
  total:    number
  count:    number
  avgMonth: number
  pct:      number
  gastos:   Gasto[]
}

function buildCatData(gastos: Gasto[], months: number): CatData[] {
  const grand = gastos.reduce((s, g) => s + g.amount, 0)
  const map   = new Map<GastoCategory, { total: number; count: number; gs: Gasto[] }>()
  for (const g of gastos) {
    const curr = map.get(g.category) ?? { total: 0, count: 0, gs: [] }
    map.set(g.category, { total: curr.total + g.amount, count: curr.count + 1, gs: [...curr.gs, g] })
  }
  return Array.from(map.entries())
    .map(([slug, { total, count, gs }]) => ({
      slug, total, count,
      avgMonth: months > 0 ? total / months : total,
      pct: grand > 0 ? (total / grand) * 100 : 0,
      gastos: gs.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.total - a.total)
}

// ─── Category row — expandable ────────────────────────────────────────────────

function CategoryRow({
  cat, showAvg, expanded, onToggle,
}: {
  cat: CatData; showAvg: boolean; expanded: boolean; onToggle: () => void
}) {
  const meta = getCategoryMeta(cat.slug)
  return (
    <div className="rounded-[12px] overflow-hidden border border-border/40 bg-white/15">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors"
      >
        <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0', meta.colorClass)}>
          {meta.label}
        </span>
        <span className="text-[11px] text-muted-foreground flex-1">
          {cat.count} gasto{cat.count !== 1 ? 's' : ''}
        </span>
        {showAvg && (
          <span className="text-[11px] text-muted-foreground hidden sm:block mr-2">
            {formatCurrency(cat.avgMonth)}<span className="opacity-60">/mes</span>
          </span>
        )}
        <span className="text-sm font-semibold text-foreground w-24 text-right">{formatCurrency(cat.total)}</span>
        <span className="text-[11px] text-muted-foreground w-8 text-right">{cat.pct.toFixed(0)}%</span>
        <span className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-secondary/50 mx-4 mb-1 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', meta.dotClass)} style={{ width: `${cat.pct}%` }} />
      </div>

      {/* Expanded: individual expenses */}
      {expanded && (
        <div className="border-t border-border/40 divide-y divide-border/25">
          {cat.gastos.map((g) => (
            <div key={g.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(g.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {g.notes ? ` · ${g.notes}` : ''}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground flex-shrink-0">
                {formatCurrency(g.amount)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 bg-petroleo/5">
            <span className="text-xs font-semibold text-petroleo">Total {meta.label}</span>
            <span className="text-sm font-bold text-petroleo">{formatCurrency(cat.total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Monthly bar chart ────────────────────────────────────────────────────────

function MonthlyBars({ gastos, title }: { gastos: Gasto[]; title: string }) {
  const months = useMemo(() => {
    const map = new Map<string, number>()
    for (const g of gastos) {
      const key = g.date.slice(0, 7)
      map.set(key, (map.get(key) ?? 0) + g.amount)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
  }, [gastos])

  if (months.length < 2) return null
  const maxVal = Math.max(...months.map(([, v]) => v))

  return (
    <div className="glass rounded-[16px] p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-[8px] bg-petroleo/10 flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-petroleo" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {months.map(([key, val]) => {
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
          const [y, m] = key.split('-')
          const label = new Date(Number(y), Number(m) - 1, 1)
            .toLocaleDateString('es-ES', { month: 'short' })
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '88px' }}>
                <div
                  className="w-full max-w-[32px] rounded-t-[4px] bg-petroleo/40 group-hover:bg-teal-brand/60 transition-colors relative"
                  style={{ height: `${Math.max(4, pct)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-noche-marina text-white text-[10px] font-medium px-2 py-1 rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    {formatCurrency(val)}
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground capitalize">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Budget planner ───────────────────────────────────────────────────────────

const INCOME_KEY = 'fatum_ingresos_mensuales'
function getStoredIncome(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(INCOME_KEY) ?? ''
}

function BudgetPlanner({ avgMonthly }: { avgMonthly: number }) {
  const [income,   setIncome]   = useState(getStoredIncome)
  const [showTips, setShowTips] = useState(false)
  const incomeNum  = parseFloat(income.replace(',', '.')) || 0
  const surplus    = incomeNum - avgMonthly
  const surplusPct = incomeNum > 0 ? (surplus / incomeNum) * 100 : null
  const saving20   = incomeNum * 0.20
  const invest10   = incomeNum * 0.10

  return (
    <div className="glass rounded-[16px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-petroleo/10 flex items-center justify-center">
            <PiggyBank className="w-3.5 h-3.5 text-petroleo" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Planificador de presupuesto</h3>
        </div>
        <button onClick={() => setShowTips((v) => !v)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {showTips && (
        <div className="bg-petroleo/6 border border-petroleo/15 rounded-[10px] px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          Regla 50/30/20: destina el 50% a necesidades (vivienda, comida…), el 30% a ocio y personal, y el 20% al ahorro. El 10% del ahorro puede ir a inversiones.
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Ingresos mensuales netos</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
          <input
            type="number" inputMode="decimal" value={income}
            onChange={(e) => { setIncome(e.target.value); localStorage.setItem(INCOME_KEY, e.target.value) }}
            placeholder="2.000,00"
            className="w-full pl-8 pr-4 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
          />
        </div>
      </div>

      {incomeNum > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary/40 rounded-[10px] px-3 py-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Ingresos</p>
              <p className="text-sm font-bold text-foreground">{formatCurrency(incomeNum)}</p>
            </div>
            <div className="bg-rojo-tierra/6 rounded-[10px] px-3 py-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Gastos/mes</p>
              <p className="text-sm font-bold text-rojo-tierra">{formatCurrency(avgMonthly)}</p>
            </div>
            <div className={cn('rounded-[10px] px-3 py-2.5 text-center', surplus >= 0 ? 'bg-teal-brand/8' : 'bg-rojo-tierra/8')}>
              <p className="text-[10px] text-muted-foreground mb-0.5">Disponible</p>
              <p className={cn('text-sm font-bold', surplus >= 0 ? 'text-teal-brand' : 'text-rojo-tierra')}>
                {surplus >= 0 ? '+' : ''}{formatCurrency(surplus)}
              </p>
            </div>
          </div>

          {surplusPct !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Gastos {(100 - surplusPct).toFixed(0)}%</span>
                <span>{surplus >= 0 ? `Disponible ${surplusPct.toFixed(0)}%` : 'Déficit'}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden flex gap-0.5">
                <div className="h-full bg-rojo-tierra/70 rounded-l-full transition-all duration-500"
                     style={{ width: `${Math.min(100, 100 - surplusPct)}%` }} />
                {surplus > 0 && (
                  <div className="h-full bg-teal-brand/60 rounded-r-full transition-all duration-500"
                       style={{ width: `${Math.max(0, surplusPct)}%` }} />
                )}
              </div>
            </div>
          )}

          {surplus > 0 && (
            <div className="border-t border-border/50 pt-3 space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Proyección si destinas</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-teal-brand/6 border border-teal-brand/15 rounded-[10px] px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground">20% al ahorro</p>
                  <p className="text-sm font-bold text-teal-brand mt-0.5">{formatCurrency(saving20)}/mes</p>
                  <p className="text-[11px] text-muted-foreground">{formatCurrency(saving20 * 12)} al año</p>
                </div>
                <div className="bg-petroleo/6 border border-petroleo/15 rounded-[10px] px-3 py-2.5">
                  <p className="text-[10px] text-muted-foreground">10% a inversión</p>
                  <p className="text-sm font-bold text-petroleo mt-0.5">{formatCurrency(invest10)}/mes</p>
                  <p className="text-[11px] text-muted-foreground">{formatCurrency(invest10 * 12)} al año</p>
                </div>
              </div>
            </div>
          )}

          {surplus <= 0 && (
            <div className="bg-rojo-tierra/6 border border-rojo-tierra/20 rounded-[10px] px-4 py-3 text-xs text-muted-foreground">
              Tus gastos superan tus ingresos en{' '}
              <span className="font-semibold text-rojo-tierra">{formatCurrency(Math.abs(surplus))}/mes</span>.
              Revisa las categorías más altas para identificar dónde ajustar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function AnalisisView() {
  const { gastos: allGastos, loading } = useGastos()
  const { currentUser }                = useUsers()
  const [viewMode, setViewMode]        = useState<ViewMode>('mes')
  const [monthKey, setMonthKey]        = useState<string>(getCurrentMonthKey)
  const [yearKey, setYearKey]          = useState<number>(() => new Date().getFullYear())
  const [rangePeriod, setRangePeriod]  = useState<RangePeriod>('3m')
  const [expandedCat, setExpandedCat]  = useState<GastoCategory | null>(null)
  const [showAllCats, setShowAllCats]  = useState(false)

  const myGastos = useMemo(
    () => personalGastos(allGastos, currentUser.id).filter((g) => !g.recurring),
    [allGastos, currentUser.id]
  )

  const { filtered, months, label } = useMemo(() => {
    if (viewMode === 'mes') {
      return {
        filtered: myGastos.filter((g) => g.date.startsWith(monthKey)),
        months:   1,
        label:    monthLabel(monthKey),
      }
    }
    if (viewMode === 'año') {
      const currentMonthNum = new Date().getMonth() + 1
      const isCurrentYear   = yearKey === new Date().getFullYear()
      return {
        filtered: myGastos.filter((g) => g.date.startsWith(yearKey.toString())),
        months:   isCurrentYear ? currentMonthNum : 12,
        label:    `Año ${yearKey}`,
      }
    }
    const { from, to, months: m } = getRangeFromTo(rangePeriod)
    return {
      filtered: myGastos.filter((g) => g.date >= from && g.date <= to),
      months:   m,
      label:    RANGE_LABELS[rangePeriod],
    }
  }, [viewMode, myGastos, monthKey, yearKey, rangePeriod])

  const grandTotal = filtered.reduce((s, g) => s + g.amount, 0)
  const avgMonthly = months > 0 ? grandTotal / months : grandTotal
  const catData    = useMemo(() => buildCatData(filtered, months), [filtered, months])
  const visible    = showAllCats ? catData : catData.slice(0, 7)

  // Trend vs previous period
  const prevTotal = useMemo(() => {
    if (viewMode === 'mes') {
      const prev = shiftMonth(monthKey, -1)
      return myGastos.filter((g) => g.date.startsWith(prev)).reduce((s, g) => s + g.amount, 0)
    }
    if (viewMode === 'año') {
      return myGastos.filter((g) => g.date.startsWith((yearKey - 1).toString())).reduce((s, g) => s + g.amount, 0)
    }
    const { from } = getRangeFromTo(rangePeriod)
    const prevTo   = new Date(new Date(from).getTime() - 86400000).toISOString().slice(0, 10)
    const prevFrom = new Date(new Date(from).getTime() - months * 30 * 86400000).toISOString().slice(0, 10)
    return myGastos.filter((g) => g.date >= prevFrom && g.date <= prevTo).reduce((s, g) => s + g.amount, 0)
  }, [viewMode, myGastos, monthKey, yearKey, rangePeriod, months])

  const trendPct = prevTotal > 0 ? ((grandTotal - prevTotal) / prevTotal) * 100 : null

  const canForwardMonth = monthKey < getCurrentMonthKey()
  const canForwardYear  = yearKey < new Date().getFullYear()

  if (loading) {
    return (
      <div className="px-6 pt-8 pb-6 flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Cargando análisis…</p>
      </div>
    )
  }

  return (
    <div className="px-6 pt-4 pb-8 space-y-4">

      {/* Mode tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/60 rounded-[12px] w-fit">
        {([
          { mode: 'mes' as ViewMode,  icon: Calendar,  label: 'Mes'   },
          { mode: 'año' as ViewMode,  icon: BarChart3,  label: 'Año'   },
          { mode: 'rango' as ViewMode, icon: Clock,     label: 'Rango' },
        ]).map(({ mode, icon: Icon, label: lbl }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-xs font-semibold transition-all',
              viewMode === mode
                ? 'bg-white/70 text-petroleo shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {lbl}
          </button>
        ))}
      </div>

      {/* Navigation control */}
      {viewMode === 'mes' && (
        <div className="flex items-center justify-between card-tech px-4 py-2.5">
          <button
            onClick={() => setMonthKey((k) => shiftMonth(k, -1))}
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold text-foreground">{monthLabel(monthKey)}</p>
          <button
            onClick={() => setMonthKey((k) => shiftMonth(k, 1))}
            disabled={!canForwardMonth}
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewMode === 'año' && (
        <div className="flex items-center justify-between card-tech px-4 py-2.5">
          <button
            onClick={() => setYearKey((y) => y - 1)}
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold text-foreground">{yearKey}</p>
          <button
            onClick={() => setYearKey((y) => y + 1)}
            disabled={!canForwardYear}
            className="p-1.5 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {viewMode === 'rango' && (
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(RANGE_LABELS) as [RangePeriod, string][]).map(([p, lbl]) => (
            <button
              key={p}
              onClick={() => setRangePeriod(p)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors',
                rangePeriod === p ? 'bg-petroleo text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
      )}

      {/* Summary hero */}
      <div className="glass rounded-[20px] p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight leading-none">
              {formatCurrency(grandTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              {formatCurrency(avgMonthly)}/mes · {catData.length} categoría{catData.length !== 1 ? 's' : ''}
            </p>
          </div>
          {trendPct !== null && (
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-semibold flex-shrink-0',
              trendPct <= 0 ? 'bg-teal-brand/10 text-teal-brand' : 'bg-rojo-tierra/10 text-rojo-tierra'
            )}>
              {trendPct <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {trendPct > 0 ? '+' : ''}{trendPct.toFixed(1)}%
            </div>
          )}
        </div>

        {catData.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Mayor gasto</p>
              <p className="text-xs font-semibold text-foreground">{getCategoryMeta(catData[0].slug).label}</p>
              <p className="text-xs text-muted-foreground">{catData[0].pct.toFixed(0)}% del total</p>
            </div>
            <div className="text-center border-x border-border/50">
              <p className="text-[10px] text-muted-foreground mb-1">Nº de gastos</p>
              <p className="text-sm font-bold text-foreground">{filtered.length}</p>
              <p className="text-xs text-muted-foreground">en el periodo</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Ticket medio</p>
              <p className="text-xs font-semibold text-foreground">
                {filtered.length > 0 ? formatCurrency(grandTotal / filtered.length) : '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Monthly bar chart — year and range views */}
      {(viewMode === 'año' || viewMode === 'rango') && (
        <MonthlyBars
          gastos={viewMode === 'año' ? filtered : myGastos}
          title={viewMode === 'año' ? `Evolución ${yearKey}` : 'Evolución mensual'}
        />
      )}

      {/* Categories */}
      {catData.length === 0 ? (
        <div className="flex items-center justify-center h-32 rounded-[16px] border border-dashed border-border bg-secondary/30">
          <p className="text-sm text-muted-foreground">Sin gastos en este periodo</p>
        </div>
      ) : (
        <div className="glass rounded-[16px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-petroleo/10 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-petroleo" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Desglose por categoría</h3>
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex-1">Categoría</span>
            {viewMode !== 'mes' && (
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide hidden sm:block mr-2">Prom/mes</span>
            )}
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-24 text-right">Total</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-8 text-right">%</span>
            <span className="w-4" />
          </div>

          <div className="space-y-2">
            {visible.map((cat) => (
              <CategoryRow
                key={cat.slug}
                cat={cat}
                showAvg={viewMode !== 'mes'}
                expanded={expandedCat === cat.slug}
                onToggle={() => setExpandedCat(expandedCat === cat.slug ? null : cat.slug)}
              />
            ))}
          </div>

          {catData.length > 7 && (
            <button
              onClick={() => setShowAllCats((v) => !v)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-petroleo hover:text-teal-brand transition-colors pt-2 border-t border-border/40"
            >
              {showAllCats
                ? <><ChevronUp className="w-3.5 h-3.5" /> Mostrar menos</>
                : <><ChevronDown className="w-3.5 h-3.5" /> Ver todas ({catData.length - 7} más)</>
              }
            </button>
          )}
        </div>
      )}

      {/* Budget planner */}
      <BudgetPlanner avgMonthly={avgMonthly} />

    </div>
  )
}
