'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createMedicamento, type TipoMedicamento } from '@/lib/salud'

interface Props {
  onSaved:  () => void
  onClose:  () => void
}

const MOMENTOS_OPCIONES = ['desayuno', 'mañana', 'mediodía', 'comida', 'tarde', 'cena', 'noche', 'antes de dormir']

export function NuevoMedicamentoModal({ onSaved, onClose }: Props) {
  const TODAY = new Date().toISOString().split('T')[0]

  const [nombre,       setNombre]       = useState('')
  const [tipo,         setTipo]         = useState<TipoMedicamento>('Medicamento')
  const [stock,        setStock]        = useState('0')
  const [stockMinimo,  setStockMinimo]  = useState('10')
  // Tramo
  const [dosis,        setDosis]        = useState('1')
  const [unidad,       setUnidad]       = useState('comprimido')
  const [frecuencia,   setFrecuencia]   = useState('diaria')
  const [momentos,     setMomentos]     = useState<string[]>(['mañana'])
  const [inicio,       setInicio]       = useState(TODAY)
  const [fin,          setFin]          = useState('')
  // Custom momento
  const [otroMomento,  setOtroMomento]  = useState('')

  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  function toggleMomento(m: string) {
    setMomentos((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m])
  }

  function addMomentoCustom() {
    const m = otroMomento.trim().toLowerCase()
    if (m && !momentos.includes(m)) {
      setMomentos((prev) => [...prev, m])
      setOtroMomento('')
    }
  }

  async function handleSave() {
    setErr('')
    if (!nombre.trim()) { setErr('El nombre es obligatorio'); return }
    if (!unidad.trim()) { setErr('La unidad es obligatoria'); return }
    if (frecuencia !== 'si_necesario' && momentos.length === 0) {
      setErr('Añade al menos un momento del día'); return
    }

    setSaving(true)
    try {
      await createMedicamento(
        { nombre: nombre.trim(), tipo, stock: parseInt(stock) || 0, stock_minimo: parseInt(stockMinimo) || 10 },
        {
          dosis:      parseFloat(dosis.replace(',', '.')) || 1,
          unidad:     unidad.trim(),
          frecuencia,
          momentos:   frecuencia === 'si_necesario' ? [] : momentos,
          inicio,
          fin:        fin || null,
          activo:     true,
        }
      )
      onSaved()
      toast.success('Medicamento añadido')
      onClose()
    } catch {
      toast.error('No se pudo guardar el medicamento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm z-[--z-modal-backdrop]" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-[--z-modal] bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)] flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-foreground">Nuevo medicamento</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Nombre + tipo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Omeprazol 20mg"
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {(['Medicamento', 'Suplemento', 'Vitamina'] as TipoMedicamento[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={cn(
                    'flex-1 py-2 rounded-[10px] text-sm font-medium transition-colors',
                    tipo === t
                      ? 'bg-petroleo text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Stock actual</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min={0}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Stock mínimo</label>
              <input
                type="number"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                min={1}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {/* Separador tramo */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground mb-3">Pauta de dosificación</p>
          </div>

          {/* Dosis + unidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Dosis</label>
              <input
                type="text"
                inputMode="decimal"
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Unidad</label>
              <input
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="comprimido, cápsula, ml..."
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Frecuencia</label>
            <div className="flex gap-2">
              {[
                { id: 'diaria',       label: 'Diaria' },
                { id: 'semanal',      label: 'Semanal' },
                { id: 'si_necesario', label: 'Si necesario' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFrecuencia(id)}
                  className={cn(
                    'flex-1 py-2 rounded-[10px] text-sm font-medium transition-colors',
                    frecuencia === id
                      ? 'bg-petroleo text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Momentos del día */}
          {frecuencia !== 'si_necesario' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">¿Cuándo?</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {MOMENTOS_OPCIONES.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMomento(m)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                      momentos.includes(m)
                        ? 'bg-petroleo text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {/* Custom momento */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otroMomento}
                  onChange={(e) => setOtroMomento(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMomentoCustom()}
                  placeholder="Otro momento..."
                  className="flex-1 px-3 py-1.5 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
                />
                <button onClick={addMomentoCustom} className="px-3 py-1.5 rounded-[10px] bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Momentos seleccionados */}
              {momentos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {momentos.map((m) => (
                    <span key={m} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-petroleo/10 text-petroleo text-xs font-medium capitalize">
                      {m}
                      <button onClick={() => toggleMomento(m)} className="hover:text-rojo-tierra transition-colors">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fecha inicio / fin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Inicio</label>
              <input
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fin (opcional)</label>
              <input
                type="date"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                min={inicio}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {err && <p className="text-sm text-rojo-tierra">{err}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  )
}
