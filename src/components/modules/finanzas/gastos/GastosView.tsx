'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, TrendingDown, TrendingUp, Copy, RefreshCw, Clock, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  GASTO_CATEGORIES,
  getCategoryMeta,
  filterByMonth,
  totalAmount,
  categoryTotals,
  groupByDate,
  type Gasto,
  type RecurringFrequency,
} from '@/lib/gasto'
import { useGastos } from '@/contexts/gastosContext'
import { useUsers } from '@/lib/users'
import { useSession } from '@/contexts/sessionContext'
import { NuevoGastoModal } from './NuevoGastoModal'
import { NuevoBonoModal } from '@/components/modules/salud/NuevoBonoModal'
import { createClient } from '@/lib/supabase/client'
import { type Especialista, type Bono } from '@/lib/salud'

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
  const { gastos: allGastos, loading, addGasto, updateGasto, deleteGasto, advanceRecurring, refreshGastos } = useGastos()
  const { currentUser, allUsers } = useUsers()
  const { partner } = useSession()

  const [year,  setYear]  = useState(NOW.getFullYear())
  const [month, setMonth] = useState(NOW.getMonth() + 1)
  const [showModal,    setShowModal]    = useState(false)
  const [editingGasto, setEditingGasto] = useState<Gasto | undefined>(undefined)

  // Modal contextual para gastos de especialista (origin='salud')
  const [loadingBono,   setLoadingBono]   = useState(false)
  const [bonoCtx, setBonoCtx] = useState<{ bono: Bono; especialista: Especialista } | null>(null)

  // Mostrar todos los gastos: los propios + los compartidos del partner
  // (el filtro definitivo lo hace RLS una vez actualizado)
  const gastos = useMemo(
    () => allGastos.filter((g) =>
      g.paidById === currentUser.id ||   // yo lo pagué
      g.compartido                       // está compartido (visible para todos los implicados)
    ),
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

  // ── Abrir gasto para editar — ruta directa si tiene origen de módulo ─────────
  async function handleOpenEdit(g: Gasto) {
    if (g.origin === 'salud' && g.id) {
      setLoadingBono(true)
      try {
        const sb = createClient()
        // Buscar el bono vinculado a este gasto
        const { data: bono } = await sb
          .from('salud_bonos')
          .select('*')
          .eq('gasto_id', g.id)
          .maybeSingle()

        if (bono) {
          const { data: esp } = await sb
            .from('salud_especialistas')
            .select('*')
            .eq('id', bono.especialista_id)
            .maybeSingle()
          if (esp) {
            setBonoCtx({ bono, especialista: { ...esp, bonos: [], sesiones: [] } })
            setLoadingBono(false)
            return
          }
        }
      } catch {
        // Si falla la carga del bono, abrimos el modal genérico
      }
      setLoadingBono(false)
    }
    setEditingGasto(g)
    setShowModal(true)
  }

  function handleSaveGasto(g: Gasto) {
    const wasEditing = !!editingGasto?.id
    const prevEditingId = editingGasto?.id
    setShowModal(false)
    setEditingGasto(undefined)

    if (wasEditing) {
      updateGasto(g)
      toast.success('Gasto actualizado')
    } else {
      const t = toast.loading('Guardando...')
      addGasto(g)
        .then(() => toast.success('Gasto guardado', { id: t }))
        .catch(() => toast.error('Error al guardar', { id: t }))
      if (prevEditingId === undefined) {
        const template = allGastos.find(
          (t) => t.recurring && t.recurring.nextDate === g.date && t.description === g.description
        )
        if (template) advanceRecurring(template.id, g.date)
      }
    }
  }

  function handleDeleteGasto(id: string) {
    deleteGasto(id)
    toast.success('Gasto eliminado')
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
        <UpcomingRecurring gastos={gastos.filter((g) => g.paidById === currentUser.id)} onRegister={handleRegisterRecurring} />

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
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="card-tech h-14 animate-pulse bg-secondary/50" />)}
          </div>
        ) : grouped.length === 0 ? (
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
                  const isPartnerGasto = g.paidById !== currentUser.id
                  const payer = isPartnerGasto
                    ? allUsers.find((u) => u.id === g.paidById)
                    : null
                  const isLoadingThis = loadingBono && editingGasto?.id === g.id

                  return (
                    <div
                      key={g.id}
                      onClick={() => { if (!isLoadingThis) handleOpenEdit(g) }}
                      className="group card-tech px-4 py-3 cursor-pointer flex items-center gap-3"
                    >
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.dotClass)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {isPartnerGasto && payer && (
                            <span className="flex items-center gap-1 text-[10px] text-petroleo font-medium">
                              <UserCircle2 className="w-3 h-3" />
                              {payer.name}
                            </span>
                          )}
                          {g.compartido && (
                            <span className="text-[10px] text-teal-brand font-medium">50-50</span>
                          )}
                          {g.notes && <p className="text-[11px] text-muted-foreground truncate">{g.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {g.recurring && <RefreshCw className="w-3 h-3 text-petroleo/50" />}
                        {g.origin === 'salud' && (
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-teal-brand/70 hidden sm:block">Salud</span>
                        )}
                        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:block', cat.colorClass)}>
                          {cat.label}
                        </span>
                        <p className={cn('text-sm font-semibold', isPartnerGasto ? 'text-muted-foreground' : 'text-foreground')}>
                          {isPartnerGasto ? '' : '-'}{formatCurrency(g.amount)}
                        </p>
                        {!isPartnerGasto && (
                          <button
                            onClick={(e) => handleDuplicateGasto(g, e)}
                            className="p-1 rounded-[6px] text-muted-foreground/40 hover:text-petroleo hover:bg-petroleo/8 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            title="Duplicar gasto"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isLoadingThis && (
                          <div className="w-3.5 h-3.5 border-2 border-petroleo/40 border-t-petroleo rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal genérico de gasto */}
      {showModal && (
        <NuevoGastoModal
          initialGasto={editingGasto}
          onSave={handleSaveGasto}
          onDelete={editingGasto?.id ? handleDeleteGasto : undefined}
          onClose={() => { setShowModal(false); setEditingGasto(undefined) }}
        />
      )}

      {/* Modal de bono de especialista (cuando el gasto viene de Salud) */}
      {bonoCtx && (
        <NuevoBonoModal
          especialista={bonoCtx.especialista}
          bono={bonoCtx.bono}
          onSaved={async () => {
            setBonoCtx(null)
            await refreshGastos()
            toast.success('Bono actualizado')
          }}
          onClose={() => setBonoCtx(null)}
        />
      )}
    </>
  )
}
