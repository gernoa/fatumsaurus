'use client'

import { useMemo } from 'react'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp, Copy, RefreshCw, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  GASTO_CATEGORIES,
  getCategoryMeta,
  personalGastos,
  filterByMonth,
  totalAmount,
  categoryTotals,
  groupByDate,
  type Gasto,
  type RecurringFrequency,
} from '@/lib/gasto'
import { useGastos } from '@/contexts/gastosContext'
import { useUsers } from '@/lib/users'
import { NuevoGastoModal } from './NuevoGastoModal'

const TODAY = new Date().toISOString().split('T')[0]
const TODAY_DATE = new Date(TODAY)
const NOW = new Date()

const MONTHS = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const FREQ_SHORT: Record<RecurringFrequency, string> = {
  weekly: 'semanal',
  monthly: 'mensual',
  bimonthly: 'bimensual',
  yearly: 'anual',
}

function dayLabel(dateStr: string): string {
  if (dateStr === TODAY) return 'Hoy'
  const d = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((TODAY_DATE.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 1) return 'Ayer'
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d.getTime() - TODAY_DATE.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Upcoming recurring banner ────────────────────────────────────────────────

function UpcomingRecurring({ gastos, onRegister }: { gastos: Gasto[]; onRegister: (g: Gasto) => void }) {
  const upcoming = gastos
    .filter((g) => g.recurring)
    .map((g) => ({ g, days: daysUntil(g.recurring!.nextDate) }))
    .filter(({ days }) => days <= 14)
    .sort((a, b) => a.days - b.days)

  if (upcoming.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        Recurrentes próximos
      </p>
      {upcoming.map(({ g, days }) => {
        const isOverdue = days < 0
        const isDueToday = days === 0
        return (
          <div
            key={`upcoming-${g.id}`}
            className={cn(
              'flex items-center gap-3 rounded-[12px] px-4 py-3 border',
              isOverdue  ? 'bg-rojo-tierra/5 border-rojo-tierra/20'
              : isDueToday ? 'bg-ambar/8 border-ambar/25'
              : 'bg-petroleo/5 border-petroleo/15'
            )}
          >
            <RefreshCw className={cn(
              'w-3.5 h-3.5 flex-shrink-0',
              isOverdue ? 'text-rojo-tierra' : isDueToday ? 'text-ambar' : 'text-petroleo/60'
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
              <p className={cn(
                'text-[11px] font-medium',
                isOverdue ? 'text-rojo-tierra' : isDueToday ? 'text-ambar' : 'text-muted-foreground'
              )}>
                {isOverdue
                  ? `Venció hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`
                  : isDueToday ? 'Vence hoy'
                  : `En ${days} día${days !== 1 ? 's' : ''}`}
                {' · '}{FREQ_SHORT[g.recurring!.frequency]} · {formatCurrency(g.amount)} aprox.
              </p>
            </div>
            <button
              onClick={() => onRegister(g)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors',
                isOverdue || isDueToday
                  ? 'bg-petroleo text-white hover:bg-teal-brand'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              Registrar
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function GastosView() {
  const { gastos: allGastos, addGasto, updateGasto, advanceRecurring } = useGastos()
  const { currentUser } = useUsers()

  const [year,  setYear]  = useState(NOW.getFullYear())
  const [month, setMonth] = useState(NOW.getMonth() + 1)
  const [showModal,    setShowModal]    = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>(undefined)

  // Only personal gastos for this user
  const gastos = useMemo(
    () => personalGastos(allGastos, currentUser.id),
    [allGastos, currentUser.id]
  )

  const monthGastos  = useMemo(() => filterByMonth(gastos, year, month), [gastos, year, month])
  const thisTotal    = useMemo(() => totalAmount(monthGastos), [monthGastos])
  const prevMonth    = month === 1 ? 12 : month - 1
  const prevYear     = month === 1 ? year - 1 : year
  const prevMonthGastos = useMemo(() => filterByMonth(gastos, prevYear, prevMonth), [gastos, prevYear, prevMonth])
  const prevTotal    = useMemo(() => totalAmount(prevMonthGastos), [prevMonthGastos])
  const trendPct     = prevTotal > 0 ? ((thisTotal - prevTotal) / prevTotal) * 100 : null
  const catTotals    = useMemo(() => categoryTotals(monthGastos), [monthGastos])
  const grouped      = useMemo(() => groupByDate(monthGastos), [monthGastos])

  const handlePrev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const handleNext = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  function handleSaveGasto(g: Gasto) {
    const wasEditing = !!editingGasto?.id
    const prevEditingId = editingGasto?.id
    setShowModal(false)
    setEditingGasto(undefined)

    if (wasEditing) {
      updateGasto(g)
      toast.success('Gasto actualizado')
    } else {
      addGasto(g)
      // If registering a recurring, advance the template's nextDate
      if (prevEditingId === undefined) {
        const template = allGastos.find(
          (t) => t.recurring && t.recurring.nextDate === g.date && t.description === g.description
        )
        if (template) advanceRecurring(template.id, g.date)
      }
      toast.success(g.paidVia === 'conjunta' ? 'Gasto conjunto registrado' : 'Gasto guardado')
    }
  }

  function handleRegisterRecurring(template: Gasto) {
    setEditingGasto({
      ...template,
      id: '',
      date: template.recurring?.nextDate ?? TODAY,
      recurring: undefined,
    })
    setShowModal(true)
  }

  const handleDuplicateGasto = (g: Gasto, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingGasto({ ...g, id: '', date: TODAY })
    setShowModal(true)
    toast.info('Duplicando gasto — edita lo que necesites')
  }

  const topCats = GASTO_CATEGORIES
    .filter((c) => (catTotals[c.slug] ?? 0) > 0)
    .sort((a, b) => (catTotals[b.slug] ?? 0) - (catTotals[a.slug] ?? 0))

  return (
    <>
      <div className="px-6 pt-4 pb-6 space-y-5">

        {/* Month selector + new button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Mes anterior">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={handleNext} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" aria-label="Mes siguiente">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { setEditingGasto(undefined); setShowModal(true) }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-petroleo hover:bg-teal-brand rounded-[10px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo gasto
          </button>
        </div>

        {/* Upcoming recurring */}
        <UpcomingRecurring gastos={gastos} onRegister={handleRegisterRecurring} />

        {/* Summary card */}
        <div className="glass rounded-[16px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total {MONTHS[month].toLowerCase()}</p>
              <p className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(thisTotal)}</p>
            </div>
            {trendPct !== null && (
              <div className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-sm font-semibold',
                trendPct <= 0 ? 'bg-teal-brand/10 text-teal-brand' : 'bg-rojo-tierra/10 text-rojo-tierra'
              )}>
                {trendPct <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {trendPct > 0 ? '+' : ''}{trendPct.toFixed(1)}%
              </div>
            )}
          </div>
          {prevTotal > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {MONTHS[prevMonth]} fue {formatCurrency(prevTotal)}
            </p>
          )}
        </div>

        {/* Category breakdown */}
        {topCats.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Por categoría</p>
            <div className="flex flex-wrap gap-2">
              {topCats.map((cat) => (
                <div key={cat.slug} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium', cat.colorClass)}>
                  <span>{cat.label}</span>
                  <span className="font-bold">{formatCurrency(catTotals[cat.slug] ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense list */}
        {grouped.length === 0 ? (
          <div className="flex items-center justify-center h-32 rounded-[16px] border border-dashed border-border bg-secondary/40">
            <p className="text-sm text-muted-foreground">Sin gastos personales en {MONTHS[month].toLowerCase()}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, dayGastos]) => (
              <div key={date} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground capitalize pt-1">
                  {dayLabel(date)}
                </p>
                {dayGastos.map((g) => {
                  const cat = getCategoryMeta(g.category)
                  return (
                    <div
                      key={g.id}
                      onClick={() => { setEditingGasto(g); setShowModal(true) }}
                      className="group card-tech px-4 py-3 cursor-pointer"
                    >
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.dotClass)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
                        {g.notes && <p className="text-[11px] text-muted-foreground truncate">{g.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {g.recurring && <RefreshCw className="w-3 h-3 text-petroleo/50" />}
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:block', cat.colorClass)}>
                          {cat.label}
                        </span>
                        <p className="text-sm font-semibold text-foreground">-{formatCurrency(g.amount)}</p>
                        <button
                          onClick={(e) => handleDuplicateGasto(g, e)}
                          className="p-1 rounded-[6px] text-muted-foreground/40 hover:text-petroleo hover:bg-petroleo/8 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                          title="Duplicar gasto"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NuevoGastoModal
          initialGasto={editingGasto}
          onSave={handleSaveGasto}
          onClose={() => { setShowModal(false); setEditingGasto(undefined) }}
        />
      )}
    </>
  )
}
