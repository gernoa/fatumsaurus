'use client'

import { useState } from 'react'
import { Plus, X, Check, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import { useUsers } from '@/lib/users'

// ─── Types ────────────────────────────────────────────────────────────────────

type DeudaEstado = 'pendiente' | 'parcial' | 'saldada'
type DeudaTipo   = 'me-deben' | 'debo'

interface Deuda {
  id:            string
  tipo:          DeudaTipo
  concepto:      string
  importe:       number
  importePagado: number
  personaId:     string | null   // uuid si es usuario de la app
  personaNombre: string          // nombre libre si no es usuario
  fecha:         string          // YYYY-MM-DD
  notas?:        string
  estado:        DeudaEstado
}

// ─── Mock data ────────────────────────────────────────────────────────────────

let _id = 100
const uid = () => String(++_id)

const MOCK_DEUDAS: Deuda[] = []

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  initial?: Deuda
  onSave:  (d: Omit<Deuda, 'id' | 'estado' | 'importePagado'>) => void
  onClose: () => void
}

function DeudaModal({ initial, onSave, onClose }: ModalProps) {
  const { otherUsers } = useUsers()
  const TODAY = new Date().toISOString().split('T')[0]
  const [tipo,    setTipo]    = useState<DeudaTipo>(initial?.tipo ?? 'me-deben')
  const [concepto,setConcepto]= useState(initial?.concepto ?? '')
  const [importe, setImporte] = useState(initial?.importe?.toString() ?? '')
  const [persona, setPersona] = useState(initial?.personaNombre ?? '')
  const [fecha,   setFecha]   = useState(initial?.fecha ?? TODAY)
  const [notas,   setNotas]   = useState(initial?.notas ?? '')

  const isValid = concepto.trim() && parseFloat(importe) > 0 && persona.trim()

  function handleSave() {
    if (!isValid) return
    onSave({
      tipo,
      concepto: concepto.trim(),
      importe:  parseFloat(importe.replace(',', '.')),
      personaId: null,
      personaNombre: persona.trim(),
      fecha,
      notas: notas.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-[24px] sm:rounded-[20px] shadow-xl">

        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">{initial ? 'Editar deuda' : 'Nueva deuda'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Tipo */}
          <div className="flex rounded-[10px] border border-border overflow-hidden">
            {(['me-deben', 'debo'] as DeudaTipo[]).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-semibold transition-colors',
                  tipo === t
                    ? t === 'me-deben' ? 'bg-teal-brand text-white' : 'bg-rojo-tierra text-white'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                {t === 'me-deben' ? 'Me deben' : 'Debo yo'}
              </button>
            ))}
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Concepto</label>
            <input
              type="text"
              placeholder="ej: Cena del martes"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
            />
          </div>

          {/* Importe + Persona */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Importe</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Persona</label>
              <input
                type="text"
                placeholder="Nombre"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                list="personas-list"
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
              />
              <datalist id="personas-list">
                {otherUsers.map((u) => (
                  <option key={u.id} value={u.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Fecha + Notas */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Notas <span className="font-normal normal-case">(opcional)</span></label>
            <textarea
              rows={2}
              placeholder="Contexto extra…"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!isValid} className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {initial ? 'Guardar cambios' : 'Añadir deuda'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Deuda card ───────────────────────────────────────────────────────────────

function DeudaCard({
  deuda, onEdit, onDelete, onSaldar,
}: {
  deuda:    Deuda
  onEdit:   (d: Deuda) => void
  onDelete: (id: string) => void
  onSaldar: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const saldada = deuda.estado === 'saldada'
  const isMeDeben = deuda.tipo === 'me-deben'

  return (
    <div className={cn(
      'bg-card rounded-[14px] border shadow-[0_1px_8px_rgba(0,18,25,0.05)] overflow-hidden',
      saldada ? 'border-border opacity-60' : 'border-border'
    )}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Color dot */}
        <div className={cn(
          'w-2.5 h-2.5 rounded-full flex-shrink-0',
          saldada     ? 'bg-muted-foreground/30' :
          isMeDeben   ? 'bg-teal-brand'          : 'bg-rojo-tierra'
        )} />

        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold text-foreground truncate', saldada && 'line-through text-muted-foreground')}>
            {deuda.concepto}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {deuda.personaNombre} · {formatDateShort(deuda.fecha)}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className={cn(
            'text-sm font-bold',
            saldada   ? 'text-muted-foreground' :
            isMeDeben ? 'text-teal-brand'        : 'text-rojo-tierra'
          )}>
            {isMeDeben ? '+' : '-'}{formatCurrency(deuda.importe)}
          </p>
          {saldada && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">Saldada</span>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pt-0 border-t border-border space-y-2">
          {deuda.notas && (
            <p className="text-xs text-muted-foreground italic">{deuda.notas}</p>
          )}
          <div className="flex gap-2">
            {!saldada && (
              <button
                onClick={() => onSaldar(deuda.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-white bg-teal-brand hover:bg-petroleo transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Marcar como saldada
              </button>
            )}
            <button
              onClick={() => onEdit(deuda)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium text-muted-foreground bg-secondary hover:text-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar
            </button>
            <button
              onClick={() => onDelete(deuda.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium text-rojo-tierra bg-rojo-tierra/8 hover:bg-rojo-tierra/15 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function DeudasView() {
  const [deudas,      setDeudas]      = useState<Deuda[]>(MOCK_DEUDAS)
  const [showModal,   setShowModal]   = useState(false)
  const [editingDeuda,setEditingDeuda]= useState<Deuda | undefined>()
  const [showSaldadas,setShowSaldadas]= useState(false)

  const activas  = deudas.filter((d) => d.estado !== 'saldada')
  const saldadas = deudas.filter((d) => d.estado === 'saldada')

  const totalMeDeben = activas.filter((d) => d.tipo === 'me-deben').reduce((s, d) => s + d.importe, 0)
  const totalDebo    = activas.filter((d) => d.tipo === 'debo').reduce((s, d) => s + d.importe, 0)
  const balance      = totalMeDeben - totalDebo

  function handleSave(data: Omit<Deuda, 'id' | 'estado' | 'importePagado'>) {
    if (editingDeuda) {
      setDeudas((prev) => prev.map((d) => d.id === editingDeuda.id ? { ...d, ...data } : d))
      toast.success('Deuda actualizada')
    } else {
      const nueva: Deuda = { ...data, id: `d-${uid()}`, estado: 'pendiente', importePagado: 0 }
      setDeudas((prev) => [nueva, ...prev])
      toast.success('Deuda añadida')
    }
    setShowModal(false)
    setEditingDeuda(undefined)
  }

  function handleSaldar(id: string) {
    setDeudas((prev) => prev.map((d) => d.id === id ? { ...d, estado: 'saldada', importePagado: d.importe } : d))
    toast.success('Deuda marcada como saldada')
  }

  function handleDelete(id: string) {
    setDeudas((prev) => prev.filter((d) => d.id !== id))
    toast.success('Deuda eliminada')
  }

  return (
    <>
      <div className="px-6 pt-4 pb-6 space-y-5">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-teal-brand/10 rounded-[14px] border border-teal-brand/20 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold text-teal-brand uppercase tracking-wide mb-1">Te deben</p>
            <p className="text-lg font-bold text-teal-brand">{formatCurrency(totalMeDeben)}</p>
          </div>
          <div className="bg-rojo-tierra/8 rounded-[14px] border border-rojo-tierra/20 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold text-rojo-tierra uppercase tracking-wide mb-1">Debes tú</p>
            <p className="text-lg font-bold text-rojo-tierra">{formatCurrency(totalDebo)}</p>
          </div>
          <div className={cn(
            'rounded-[14px] border px-4 py-3 text-center',
            balance >= 0 ? 'bg-petroleo/8 border-petroleo/20' : 'bg-rojo-tierra/8 border-rojo-tierra/20'
          )}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Balance</p>
            <p className={cn('text-lg font-bold', balance >= 0 ? 'text-petroleo' : 'text-rojo-tierra')}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Nueva deuda button */}
        <button
          onClick={() => { setEditingDeuda(undefined); setShowModal(true) }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] border border-dashed border-petroleo/30 text-sm font-medium text-petroleo hover:bg-petroleo/5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva deuda
        </button>

        {/* Active debts */}
        {activas.length === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-[14px] border border-dashed border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground">Sin deudas activas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activas.map((d) => (
              <DeudaCard
                key={d.id}
                deuda={d}
                onEdit={(deuda) => { setEditingDeuda(deuda); setShowModal(true) }}
                onDelete={handleDelete}
                onSaldar={handleSaldar}
              />
            ))}
          </div>
        )}

        {/* Saldadas */}
        {saldadas.length > 0 && (
          <div>
            <button
              onClick={() => setShowSaldadas((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              {showSaldadas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Saldadas ({saldadas.length})
            </button>
            {showSaldadas && (
              <div className="space-y-2">
                {saldadas.map((d) => (
                  <DeudaCard
                    key={d.id}
                    deuda={d}
                    onEdit={(deuda) => { setEditingDeuda(deuda); setShowModal(true) }}
                    onDelete={handleDelete}
                    onSaldar={handleSaldar}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <DeudaModal
          initial={editingDeuda}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingDeuda(undefined) }}
        />
      )}
    </>
  )
}
