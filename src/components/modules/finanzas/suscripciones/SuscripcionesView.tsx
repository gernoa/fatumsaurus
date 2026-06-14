'use client'

import { useState, useMemo } from 'react'
import { Plus, Bell, BellOff, Pencil, Trash2, Users, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  CYCLE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  monthlyAmount,
  yearlyAmount,
  daysUntilRenewal,
  type Suscripcion,
  type BillingCycle,
  type SuscripcionCategory,
} from '@/lib/suscripciones'
import { useSuscripciones } from '@/contexts/suscripcionesContext'
import { SuscripcionModal } from './SuscripcionModal'

const TODAY = new Date().toISOString().split('T')[0]

type FilterView = 'todas' | 'compartidas' | 'mias'

export function SuscripcionesView() {
  const { suscripciones, remove, toggle } = useSuscripciones()

  const [filter,    setFilter]    = useState<FilterView>('todas')
  const [editItem,  setEditItem]  = useState<Suscripcion | undefined>()
  const [showModal, setShowModal] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const active   = suscripciones.filter((s) => s.active)
  const inactive = suscripciones.filter((s) => !s.active)

  const displayed = useMemo(() => {
    let list = active
    if (filter === 'compartidas') list = list.filter((s) => s.shared)
    if (filter === 'mias')        list = list.filter((s) => !s.shared)
    return list.sort((a, b) => a.nextDate.localeCompare(b.nextDate))
  }, [active, filter])

  // Totales
  const totalMensual = active.reduce((s, x) => s + monthlyAmount(x), 0)
  const totalAnual   = active.reduce((s, x) => s + yearlyAmount(x), 0)
  const numShared    = active.filter((s) => s.shared).length

  // Próximas renovaciones (≤ 7 días)
  const upcoming = active.filter((s) => {
    const d = daysUntilRenewal(s, TODAY)
    return d >= 0 && d <= 7
  }).sort((a, b) => a.nextDate.localeCompare(b.nextDate))

  function openNew() {
    setEditItem(undefined)
    setShowModal(true)
  }

  function openEdit(s: Suscripcion) {
    setEditItem(s)
    setShowModal(true)
  }

  function handleDelete(s: Suscripcion) {
    remove(s.id)
    toast.success(`"${s.name}" eliminada`)
  }

  function handleToggle(s: Suscripcion) {
    toggle(s.id)
    toast.success(s.active ? `"${s.name}" pausada` : `"${s.name}" reactivada`)
  }

  return (
    <>
      <div className="px-6 pt-4 pb-24 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Al mes" value={formatCurrency(totalMensual)} sub={`${active.length} activas`} />
          <SummaryCard label="Al año" value={formatCurrency(totalAnual)} accent />
          <SummaryCard label="Compartidas" value={String(numShared)} sub={`de ${active.length}`} icon={<Users className="w-3.5 h-3.5" />} />
        </div>

        {/* Upcoming renewals */}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ambar flex items-center gap-1.5">
              <Bell className="w-3 h-3" />
              Próximas renovaciones
            </p>
            <div className="space-y-1.5">
              {upcoming.map((s) => {
                const days = daysUntilRenewal(s, TODAY)
                return (
                  <div key={s.id} className="flex items-center gap-3 bg-ambar/5 border border-ambar/20 rounded-[12px] px-4 py-2.5">
                    <span className="text-lg">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatCurrency(s.amount)} · {CYCLE_LABELS[s.cycle]}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-ambar">
                        {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatDateShort(s.nextDate)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-1.5 bg-secondary/60 rounded-[12px] p-1">
          {(['todas', 'compartidas', 'mias'] as FilterView[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-[9px] transition-all capitalize',
                filter === f ? 'bg-white/70 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'todas' ? 'Todas' : f === 'compartidas' ? 'Compartidas' : 'Solo mías'}
            </button>
          ))}
        </div>

        {/* Suscripción list */}
        {displayed.length === 0 ? (
          <EmptyState onAdd={openNew} />
        ) : (
          <div className="space-y-2">
            {displayed.map((s) => (
              <SuscripcionRow
                key={s.id}
                suscripcion={s}
                onEdit={() => openEdit(s)}
                onDelete={() => handleDelete(s)}
                onToggle={() => handleToggle(s)}
              />
            ))}
          </div>
        )}

        {/* Inactive */}
        {inactive.length > 0 && (
          <div>
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <BellOff className="w-3 h-3" />
              {showInactive ? 'Ocultar' : `Ver ${inactive.length} pausada${inactive.length !== 1 ? 's' : ''}`}
            </button>
            {showInactive && (
              <div className="mt-2 space-y-2">
                {inactive.map((s) => (
                  <SuscripcionRow
                    key={s.id}
                    suscripcion={s}
                    onEdit={() => openEdit(s)}
                    onDelete={() => handleDelete(s)}
                    onToggle={() => handleToggle(s)}
                    muted
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 pointer-events-none z-40">
        <div className="max-w-2xl mx-auto px-6 pb-4 pointer-events-auto flex justify-end">
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-3 rounded-[14px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand shadow-lg shadow-petroleo/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nueva suscripción
          </button>
        </div>
      </div>

      {showModal && (
        <SuscripcionModal
          initial={editItem}
          onClose={() => { setShowModal(false); setEditItem(undefined) }}
        />
      )}
    </>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, accent, icon,
}: { label: string; value: string; sub?: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={cn(
      'rounded-[14px] px-3.5 py-3',
      accent ? 'bg-petroleo text-white' : 'bg-secondary/50 text-foreground'
    )}>
      <p className={cn('text-[10px] font-semibold uppercase tracking-wide mb-1', accent ? 'text-white/60' : 'text-muted-foreground')}>
        {label}
      </p>
      <p className={cn('text-lg font-bold', accent ? 'text-white' : 'text-foreground')}>{value}</p>
      {(sub || icon) && (
        <p className={cn('text-[10px] mt-0.5 flex items-center gap-1', accent ? 'text-white/60' : 'text-muted-foreground')}>
          {icon}{sub}
        </p>
      )}
    </div>
  )
}

// ─── Suscripción row ──────────────────────────────────────────────────────────

function SuscripcionRow({
  suscripcion: s,
  onEdit,
  onDelete,
  onToggle,
  muted,
}: {
  suscripcion: Suscripcion
  onEdit:    () => void
  onDelete:  () => void
  onToggle:  () => void
  muted?:    boolean
}) {
  const days = daysUntilRenewal(s, TODAY)
  const isUrgent = days >= 0 && days <= 3
  const isWarn   = days >= 0 && days <= 7 && !isUrgent

  return (
    <div className={cn(
      'card-tech px-4 py-3 flex items-center gap-3 transition-all',
      muted ? 'opacity-50' : ''
    )}>
      {/* Color dot + icon */}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: s.color + '18' }}
      >
        {s.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
          {s.shared && <Users className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {CATEGORY_LABELS[s.category]} · {CYCLE_LABELS[s.cycle]}
        </p>
      </div>

      {/* Next renewal */}
      <div className="text-right flex-shrink-0 mr-1">
        <p className="text-sm font-bold text-foreground">{formatCurrency(s.amount)}</p>
        <p className={cn(
          'text-[10px] font-medium flex items-center justify-end gap-0.5 mt-0.5',
          isUrgent ? 'text-rojo-tierra' : isWarn ? 'text-ambar' : 'text-muted-foreground'
        )}>
          <Calendar className="w-2.5 h-2.5" />
          {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : days < 0 ? `Vencida` : `${formatDateShort(s.nextDate)}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button onClick={onToggle} title={s.active ? 'Pausar' : 'Reactivar'}
          className="p-1.5 rounded-[7px] text-muted-foreground hover:text-ambar hover:bg-ambar/8 transition-colors">
          {s.active ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onEdit} title="Editar"
          className="p-1.5 rounded-[7px] text-muted-foreground hover:text-petroleo hover:bg-petroleo/8 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} title="Eliminar"
          className="p-1.5 rounded-[7px] text-muted-foreground hover:text-rojo-tierra hover:bg-rojo-tierra/8 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-[16px] border border-dashed border-border bg-secondary/30">
      <div className="w-12 h-12 rounded-[12px] bg-secondary flex items-center justify-center text-2xl">📦</div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Sin suscripciones</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Añade tus servicios de streaming, software y suscripciones para controlar el gasto mensual.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand transition-colors"
      >
        <Plus className="w-4 h-4" />
        Añadir suscripción
      </button>
    </div>
  )
}
