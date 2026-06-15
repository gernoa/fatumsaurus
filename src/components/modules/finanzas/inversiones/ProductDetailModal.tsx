'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  getProductStats,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_EMOJIS,
  FREQ_LABELS_INV,
  type InversionProduct,
  type Aportacion,
  type Valoracion,
} from '@/lib/inversiones'
import { useInversiones } from '@/contexts/inversionesContext'
import { useUsers } from '@/lib/users'

interface Props {
  product:   InversionProduct
  onEdit:    () => void
  onDelete:  () => void
  onClose:   () => void
}

export function ProductDetailModal({ product, onEdit, onDelete, onClose }: Props) {
  const {
    aportaciones, valoraciones,
    updateAportacion, deleteAportacion,
    updateValoracion, deleteValoracion,
  } = useInversiones()
  const { getUser } = useUsers()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const productAportaciones = useMemo(() =>
    aportaciones
      .filter((a) => a.productId === product.id && a.userId === product.ownerId && a.estado === 'confirmada')
      .sort((a, b) => b.date.localeCompare(a.date)),
    [aportaciones, product.id, product.ownerId]
  )

  const productValoraciones = useMemo(() =>
    valoraciones
      .filter((v) => v.productId === product.id && v.userId === product.ownerId)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [valoraciones, product.id, product.ownerId]
  )

  const stats = useMemo(
    () => getProductStats(product, product.ownerId, aportaciones, valoraciones),
    [product, aportaciones, valoraciones]
  )

  const owner    = getUser(product.ownerId)
  const sinVal   = stats.valorActual === null
  const peri     = product.periodicidad

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-lg max-h-[92vh] flex flex-col glass rounded-t-[24px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.25)]">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[10px] bg-petroleo/10 flex items-center justify-center text-xl flex-shrink-0">
              {PRODUCT_TYPE_EMOJIS[product.type]}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">{product.name}</h2>
              <p className="text-xs text-muted-foreground">
                {product.platform} · {PRODUCT_TYPE_LABELS[product.type]} · {product.currency}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-3">
            <button
              onClick={onEdit}
              className="p-2 rounded-[8px] text-muted-foreground hover:text-petroleo hover:bg-petroleo/8 transition-colors"
              title="Editar producto"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-[8px] text-muted-foreground hover:text-rojo-tierra hover:bg-rojo-tierra/8 transition-colors"
              title="Eliminar producto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Owner badge */}
          <div className="px-5 pt-3 pb-0">
            <div className="inline-flex items-center gap-1.5 bg-secondary/60 rounded-full px-2.5 py-1">
              <div className="w-4 h-4 rounded-full bg-petroleo text-white text-[10px] font-bold flex items-center justify-center">
                {owner.initial}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{owner.name}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Aportado" value={formatCurrency(stats.totalAportado)} />
              <StatCard
                label="Valor actual"
                value={sinVal ? '—' : formatCurrency(stats.valorActual!)}
                muted={sinVal}
              />
              {stats.ganancia !== null ? (
                <StatCard
                  label="Ganancia"
                  value={`${stats.ganancia >= 0 ? '+' : ''}${formatCurrency(stats.ganancia)}`}
                  accent={stats.ganancia >= 0 ? 'positive' : 'negative'}
                  sub={stats.rentabilidad !== null ? `${stats.rentabilidad >= 0 ? '+' : ''}${stats.rentabilidad.toFixed(1)}%` : undefined}
                />
              ) : (
                <StatCard label="Ganancia" value="—" muted />
              )}
            </div>
          </div>

          {/* Periodicidad */}
          <div className="px-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Periodicidad</p>
              <button
                onClick={onEdit}
                className="text-[10px] font-semibold text-petroleo hover:text-teal-brand transition-colors"
              >
                {peri?.activa ? 'Editar' : 'Añadir'}
              </button>
            </div>
            {peri?.activa ? (
              <div className="flex items-center gap-2.5 bg-petroleo/6 border border-petroleo/15 rounded-[10px] px-3.5 py-2.5">
                <RefreshCw className="w-3.5 h-3.5 text-petroleo flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(peri.importePorDefecto)} {FREQ_LABELS_INV[peri.frecuencia].toLowerCase()}
                    {peri.frecuencia === 'monthly' ? ` · día ${peri.diaMes}` : ''}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Próxima aportación: <span className="font-medium text-foreground">{formatDateShort(peri.proximaFecha)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-secondary/40 rounded-[10px] px-3.5 py-2.5 border border-dashed border-border">
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground/60">Sin aportación periódica configurada</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border mx-5" />

          {/* Historial — two columns */}
          <div className="grid grid-cols-2 divide-x divide-border">
            <HistorialColumn
              title="Aportaciones"
              rows={productAportaciones}
              renderValue={(a: Aportacion) => formatCurrency(a.amount)}
              parseAmount={(a: Aportacion) => a.amount.toString()}
              onUpdate={(id, date, raw) => {
                const amount = parseFloat(raw.replace(',', '.'))
                if (amount > 0) updateAportacion(id, { date, amount })
              }}
              onDelete={deleteAportacion}
            />
            <HistorialColumn
              title="Valoraciones"
              rows={productValoraciones}
              renderValue={(v: Valoracion) => formatCurrency(v.value)}
              parseAmount={(v: Valoracion) => v.value.toString()}
              onUpdate={(id, date, raw) => {
                const value = parseFloat(raw.replace(',', '.'))
                if (value > 0) updateValoracion(id, { date, value })
              }}
              onDelete={deleteValoracion}
            />
          </div>

          <div className="h-6" />
        </div>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  muted,
  accent,
}: {
  label:   string
  value:   string
  sub?:    string
  muted?:  boolean
  accent?: 'positive' | 'negative'
}) {
  return (
    <div className="bg-secondary/40 rounded-[12px] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className={cn(
        'text-sm font-bold',
        muted ? 'text-muted-foreground/50'
          : accent === 'positive' ? 'text-teal-brand'
          : accent === 'negative' ? 'text-rojo-tierra'
          : 'text-foreground'
      )}>{value}</p>
      {sub && (
        <p className={cn(
          'text-[10px] font-semibold mt-0.5',
          accent === 'positive' ? 'text-teal-brand' : 'text-rojo-tierra'
        )}>{sub}</p>
      )}
    </div>
  )
}

// ─── History column (shared for aportaciones and valoraciones) ────────────────

type HistorialItem = { id: string; date: string }

function HistorialColumn<T extends HistorialItem>({
  title,
  rows,
  renderValue,
  parseAmount,
  onUpdate,
  onDelete,
}: {
  title:       string
  rows:        T[]
  renderValue: (row: T) => string
  parseAmount: (row: T) => string
  onUpdate:    (id: string, date: string, amount: string) => void
  onDelete:    (id: string) => void
}) {
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [editDate,   setEditDate]   = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [showAll,    setShowAll]    = useState(false)

  const VISIBLE = 5
  const displayed = showAll ? rows : rows.slice(0, VISIBLE)
  const hasMore   = rows.length > VISIBLE

  function startEdit(row: T) {
    setEditingId(row.id)
    setEditDate(row.date)
    setEditAmount(parseAmount(row))
  }

  function confirmEdit() {
    if (!editingId) return
    onUpdate(editingId, editDate, editAmount)
    setEditingId(null)
  }

  function cancelEdit() { setEditingId(null) }

  return (
    <div className="flex flex-col">
      {/* Column header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="text-xs font-bold text-foreground mt-0.5">{rows.length} registros</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center px-4 py-8">
          <p className="text-[11px] text-muted-foreground/60 text-center">Sin registros</p>
        </div>
      ) : (
        <div>
          {displayed.map((row) => {
            const isEditing = editingId === row.id
            return (
              <div key={row.id} className={cn(
                'border-b border-border/50 last:border-0',
                isEditing ? 'bg-petroleo/4' : 'hover:bg-secondary/30 group'
              )}>
                {isEditing ? (
                  /* Edit mode */
                  <div className="px-3 py-2 space-y-1.5">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-2 py-1 text-xs text-foreground bg-background border border-petroleo/30 rounded-[6px] focus:outline-none focus:ring-1 focus:ring-petroleo/50"
                    />
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit() }}
                          className="w-full pl-6 pr-2 py-1 text-xs font-semibold text-foreground bg-background border border-petroleo/30 rounded-[6px] focus:outline-none focus:ring-1 focus:ring-petroleo/50 text-right"
                        />
                      </div>
                      <button onClick={confirmEdit} className="p-1 rounded-[5px] bg-petroleo text-white hover:bg-teal-brand transition-colors flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={cancelEdit} className="p-1 rounded-[5px] bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center gap-1.5 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground">{formatDateShort(row.date)}</p>
                      <p className="text-xs font-semibold text-foreground">{renderValue(row)}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => startEdit(row)}
                        className="p-1 rounded-[5px] text-muted-foreground hover:text-petroleo hover:bg-petroleo/8 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="p-1 rounded-[5px] text-muted-foreground hover:text-rojo-tierra hover:bg-rojo-tierra/8 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full flex items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-petroleo hover:text-teal-brand hover:bg-petroleo/4 transition-colors"
            >
              {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAll ? 'Ver menos' : `Ver ${rows.length - VISIBLE} más`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
