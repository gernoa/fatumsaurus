'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  ALL_GASTOS,
  GASTO_CATEGORIES,
  getCategoryMeta,
  personalGastos,
  filterByMonth,
  totalAmount,
  categoryTotals,
  groupByDate,
  type Gasto,
} from '@/lib/gasto'
import { NuevoGastoModal } from './NuevoGastoModal'

const MONTHS = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function dayLabel(dateStr: string): string {
  const today = '2026-06-13'
  const yesterday = '2026-06-12'
  if (dateStr === today) return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'short',
  })
}

export function GastosView() {
  const [gastos, setGastos] = useState<Gasto[]>(() => personalGastos(ALL_GASTOS))
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(6)
  const [showModal, setShowModal] = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>(undefined)

  const monthGastos = useMemo(() => filterByMonth(gastos, year, month), [gastos, year, month])
  const thisTotal   = useMemo(() => totalAmount(monthGastos), [monthGastos])

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  const prevMonthGastos = useMemo(() => filterByMonth(gastos, prevYear, prevMonth), [gastos, prevYear, prevMonth])
  const prevTotal = useMemo(() => totalAmount(prevMonthGastos), [prevMonthGastos])

  const trendPct = prevTotal > 0 ? ((thisTotal - prevTotal) / prevTotal) * 100 : null
  const catTotals = useMemo(() => categoryTotals(monthGastos), [monthGastos])
  const grouped   = useMemo(() => groupByDate(monthGastos), [monthGastos])

  const handlePrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const handleNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const handleSaveGasto = (g: Gasto) => {
    const wasEditing = !!editingGasto
    setShowModal(false)
    setEditingGasto(undefined)

    if (g.paidVia === 'personal') {
      if (wasEditing) {
        setGastos(prev => prev.map(existing => existing.id === g.id ? g : existing))
        toast.success('Gasto actualizado')
      } else {
        setGastos(prev => [g, ...prev])
        toast.success('Gasto guardado')
      }
    } else {
      toast.success(wasEditing ? 'Gasto conjunta actualizado' : 'Gasto conjunta registrado')
    }
  }

  const handleEditGasto = (g: Gasto) => {
    setEditingGasto(g)
    setShowModal(true)
  }

  // Top categories (those with spend > 0, sorted desc)
  const topCats = GASTO_CATEGORIES
    .filter((c) => (catTotals[c.slug] ?? 0) > 0)
    .sort((a, b) => (catTotals[b.slug] ?? 0) - (catTotals[a.slug] ?? 0))

  return (
    <>
      <div className="px-6 pt-4 pb-6 space-y-5">

        {/* Month selector + new button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-petroleo hover:bg-teal-brand rounded-[10px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo gasto
          </button>
        </div>

        {/* Summary card */}
        <div className="bg-card rounded-[16px] border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total {MONTHS[month].toLowerCase()}</p>
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {formatCurrency(thisTotal)}
              </p>
            </div>
            {trendPct !== null && (
              <div className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-sm font-semibold',
                trendPct <= 0
                  ? 'bg-teal-brand/10 text-teal-brand'
                  : 'bg-rojo-tierra/10 text-rojo-tierra'
              )}>
                {trendPct <= 0
                  ? <TrendingDown className="w-4 h-4" />
                  : <TrendingUp className="w-4 h-4" />
                }
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
              {topCats.map((cat) => {
                const total = catTotals[cat.slug] ?? 0
                return (
                  <div
                    key={cat.slug}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium', cat.colorClass)}
                  >
                    <span>{cat.label}</span>
                    <span className="font-bold">{formatCurrency(total)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Expense list */}
        {grouped.length === 0 ? (
          <div className="flex items-center justify-center h-32 rounded-[16px] border border-dashed border-border bg-secondary/40">
            <p className="text-sm text-muted-foreground">Sin gastos en {MONTHS[month].toLowerCase()}</p>
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
                      onClick={() => handleEditGasto(g)}
                      className="flex items-center gap-3 bg-card rounded-[12px] border border-border px-4 py-3 shadow-[0_1px_8px_rgba(0,18,25,0.05)] hover:shadow-[0_2px_12px_rgba(0,18,25,0.09)] transition-shadow cursor-pointer"
                    >
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.dotClass)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
                        {g.notes && (
                          <p className="text-[11px] text-muted-foreground truncate">{g.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:block', cat.colorClass)}>
                          {cat.label}
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          -{formatCurrency(g.amount)}
                        </p>
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
