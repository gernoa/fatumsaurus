'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle, Check, X, Package, ChevronDown, ChevronUp, Pill, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  getMedicamentos, marcarToma, updateStock, deleteMedicamento,
  type Medicamento, type TipoMedicamento, type TomaHoy,
} from '@/lib/salud'
import { NuevoMedicamentoModal } from './NuevoMedicamentoModal'

const TIPO_CONFIG: Record<TipoMedicamento, { classes: string }> = {
  Medicamento: { classes: 'bg-red-100/80 text-red-700' },
  Suplemento:  { classes: 'bg-teal-100/80 text-teal-700' },
  Vitamina:    { classes: 'bg-amber-100/80 text-amber-700' },
}

function stockPct(stock: number, minimo: number): number {
  return Math.min((stock / (minimo * 4)) * 100, 100)
}

// ─── Botón de toma ─────────────────────────────────────────────────────────────

function TomaBtn({ toma, medId, tramoId, onToggle }: {
  toma:     TomaHoy
  medId:    string
  tramoId:  string | null | undefined
  onToggle: (t: TomaHoy, nuevo: 'tomada' | 'saltada' | 'pendiente') => void
}) {
  const [busy, setBusy] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  async function handleClick() {
    if (toma.estado === 'tomada') {
      // No se puede desmarcar fácilmente (requeriría borrar el registro), simplemente ignora
      return
    }
    const nuevoEstado: 'tomada' | 'saltada' = 'tomada'
    setBusy(true)
    try {
      const hora = new Date().toTimeString().slice(0, 5)
      await marcarToma({
        medicamento_id: medId,
        tramo_id:       tramoId ?? null,
        fecha_prevista: today,
        momento:        toma.momento,
        estado:         nuevoEstado,
        hora_real:      hora,
      })
      onToggle(toma, nuevoEstado)
    } catch {
      toast.error('No se pudo registrar la toma')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaltada() {
    if (toma.estado !== 'pendiente') return
    setBusy(true)
    try {
      await marcarToma({
        medicamento_id: medId,
        tramo_id:       tramoId ?? null,
        fecha_prevista: today,
        momento:        toma.momento,
        estado:         'saltada',
      })
      onToggle(toma, 'saltada')
    } catch {
      toast.error('No se pudo marcar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground capitalize w-20 text-right">{toma.momento}</span>
      <button
        onClick={handleClick}
        disabled={busy || toma.estado === 'tomada'}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:cursor-not-allowed',
          toma.estado === 'tomada'
            ? 'bg-teal-500 text-white'
            : toma.estado === 'saltada'
            ? 'bg-red-400 text-white'
            : 'bg-border/70 text-muted-foreground hover:bg-teal-100 hover:text-teal-700'
        )}
      >
        {toma.estado === 'tomada'
          ? <><Check className="w-3 h-3" /> Tomada {toma.hora && `· ${toma.hora}`}</>
          : toma.estado === 'saltada'
          ? <><X className="w-3 h-3" /> Saltada</>
          : busy
          ? 'Guardando...'
          : 'Marcar como tomada'
        }
      </button>
      {toma.estado === 'pendiente' && !busy && (
        <button
          onClick={handleSaltada}
          className="p-1 rounded text-muted-foreground/60 hover:text-red-500 transition-colors"
          title="Marcar como saltada"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Stock editor ─────────────────────────────────────────────────────────────

function StockEditor({ med, onUpdate }: { med: Medicamento; onUpdate: (stock: number) => void }) {
  const [edit,    setEdit]    = useState(false)
  const [val,     setVal]     = useState(med.stock.toString())
  const [saving,  setSaving]  = useState(false)

  async function save() {
    const n = parseInt(val)
    if (isNaN(n) || n < 0) return
    setSaving(true)
    try {
      await updateStock(med.id, n)
      onUpdate(n)
      setEdit(false)
    } catch {
      toast.error('No se pudo actualizar el stock')
    } finally {
      setSaving(false)
    }
  }

  if (!edit) return (
    <button onClick={() => setEdit(true)} className="flex items-center gap-1 group" title="Editar stock">
      <Package className="w-3.5 h-3.5 text-muted-foreground" />
      <span className={cn('text-sm font-bold', med.stock <= med.stock_minimo ? 'text-red-600' : med.stock <= med.stock_minimo * 1.5 ? 'text-amber-600' : undefined)}>
        {med.stock}
      </span>
      <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
    </button>
  )

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEdit(false) }}
        className="w-16 px-1.5 py-0.5 rounded-[6px] border border-border bg-background text-sm text-right focus:outline-none focus:ring-1 focus:ring-petroleo/40"
        autoFocus
        min={0}
      />
      <button onClick={save} disabled={saving} className="px-2 py-0.5 rounded-[6px] bg-petroleo text-white text-xs disabled:opacity-50">OK</button>
      <button onClick={() => setEdit(false)} className="p-0.5 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

// ─── Medicamento card ──────────────────────────────────────────────────────────

function MedCard({ med, onUpdate, onDelete }: {
  med:      Medicamento
  onUpdate: (updated: Medicamento) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  const [tomas,    setTomas]    = useState<TomaHoy[]>(med.tomas_hoy ?? [])

  const stockBajo    = med.stock <= med.stock_minimo
  const stockWarning = med.stock <= med.stock_minimo * 1.5 && !stockBajo
  const tipoConf     = TIPO_CONFIG[med.tipo]
  const pct          = stockPct(med.stock, med.stock_minimo)
  const stockColor   = stockBajo ? '#AE2012' : stockWarning ? '#EE9B00' : '#0A9396'
  const pendientes   = tomas.filter((t) => t.estado === 'pendiente').length

  const frecLabel = med.tramo_activo?.frecuencia === 'si_necesario'
    ? 'Si necesario'
    : med.tramo_activo?.frecuencia === 'diaria'
    ? 'Cada día'
    : med.tramo_activo?.frecuencia ?? ''

  function handleTomaToggle(toma: TomaHoy, nuevoEstado: 'tomada' | 'saltada' | 'pendiente') {
    setTomas((prev) => prev.map((t) => t.momento === toma.momento ? { ...t, estado: nuevoEstado, hora: nuevoEstado === 'tomada' ? new Date().toTimeString().slice(0, 5) : undefined } : t))
    if (nuevoEstado === 'tomada' && med.tramo_activo) {
      onUpdate({ ...med, stock: Math.max(med.stock - 1, 0) })
    }
  }

  return (
    <div className={cn('card-tech overflow-hidden', stockBajo && 'ring-1 ring-red-400/40')}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-foreground">{med.nombre}</span>
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', tipoConf.classes)}>{med.tipo}</span>
              {stockBajo && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Stock bajo
                </span>
              )}
            </div>
            {med.tramo_activo && (
              <p className="text-xs text-muted-foreground">
                {med.tramo_activo.dosis} {med.tramo_activo.unidad} · {frecLabel}
                {med.tramo_activo.momentos.length > 0 && ` · ${med.tramo_activo.momentos.join(', ')}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="text-right mr-1">
              <StockEditor med={med} onUpdate={(s) => onUpdate({ ...med, stock: s })} />
              <p className="text-[10px] text-muted-foreground">unidades</p>
            </div>
            <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stock bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stockColor }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Mínimo: {med.stock_minimo} unidades</p>
        </div>

        {/* Tomas de hoy */}
        {tomas.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
              Hoy
              {pendientes > 0 && <span className="ml-1.5 text-amber-600 normal-case font-normal">· {pendientes} pendiente{pendientes !== 1 ? 's' : ''}</span>}
            </p>
            {tomas.map((t, i) => (
              <TomaBtn key={i} toma={t} medId={med.id} tramoId={med.tramo_activo?.id} onToggle={handleTomaToggle} />
            ))}
          </div>
        )}

        {/* Si necesario */}
        {med.tramo_activo?.frecuencia === 'si_necesario' && (
          <button className="w-full mt-2 py-1.5 rounded-[8px] glass-subtle text-xs text-muted-foreground hover:text-foreground transition-colors">
            Registrar toma
          </button>
        )}

        {confirm && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
            <p className="text-xs text-muted-foreground flex-1">¿Eliminar este medicamento?</p>
            <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground">Cancelar</button>
            <button onClick={() => onDelete(med.id)} className="text-xs font-semibold text-rojo-tierra">Eliminar</button>
          </div>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Ocultar detalles' : 'Ver detalles del tramo'}
        </button>

        {expanded && med.tramo_activo && (
          <div className="mt-2 pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
            <p>Inicio: {new Date(med.tramo_activo.inicio + 'T00:00:00').toLocaleDateString('es-ES')}</p>
            {med.tramo_activo.fin && <p>Fin: {new Date(med.tramo_activo.fin + 'T00:00:00').toLocaleDateString('es-ES')}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export function MedicamentosView() {
  const [meds,    setMeds]    = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getMedicamentos()
      setMeds(data)
    } catch {
      toast.error('No se pudieron cargar los medicamentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleUpdate(updated: Medicamento) {
    setMeds((prev) => prev.map((m) => m.id === updated.id ? updated : m))
  }

  async function handleDelete(id: string) {
    const t = toast.loading('Eliminando...')
    try {
      await deleteMedicamento(id)
      setMeds((prev) => prev.filter((m) => m.id !== id))
      toast.success('Eliminado', { id: t })
    } catch {
      toast.error('No se pudo eliminar', { id: t })
    }
  }

  const totalPendientes = meds.flatMap((m) => m.tomas_hoy ?? []).filter((t) => t.estado === 'pendiente').length
  const stockBajos      = meds.filter((m) => m.stock <= m.stock_minimo).length

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="card-tech h-28 animate-pulse bg-secondary/50" />)}
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        {/* Resumen */}
        {meds.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="card-tech p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{meds.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">activos</p>
            </div>
            <div className={cn('card-tech p-4 text-center', totalPendientes > 0 && 'ring-1 ring-amber-400/30')}>
              <p className={cn('text-2xl font-bold', totalPendientes > 0 ? 'text-amber-600' : 'text-teal-brand')}>{totalPendientes}</p>
              <p className="text-xs text-muted-foreground mt-0.5">pendientes hoy</p>
            </div>
            <div className={cn('card-tech p-4 text-center', stockBajos > 0 && 'ring-1 ring-red-400/30')}>
              <p className={cn('text-2xl font-bold', stockBajos > 0 ? 'text-red-600' : 'text-foreground')}>{stockBajos}</p>
              <p className="text-xs text-muted-foreground mt-0.5">stock bajo</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Tus medicamentos</h3>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
          >
            <Plus className="w-4 h-4" />
            Añadir
          </button>
        </div>

        {meds.length === 0 ? (
          <div className="glass rounded-[16px] p-12 text-center text-muted-foreground">
            <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes medicamentos registrados.</p>
            <button
              onClick={() => setModal(true)}
              className="mt-4 px-4 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              Añadir primer medicamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {meds.map((m) => <MedCard key={m.id} med={m} onUpdate={handleUpdate} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {modal && (
        <NuevoMedicamentoModal onSaved={load} onClose={() => setModal(false)} />
      )}
    </>
  )
}
