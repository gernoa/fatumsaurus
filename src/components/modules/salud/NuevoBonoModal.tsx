'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { createBono, type Especialista, type Bono, type PagadoVia } from '@/lib/salud'

interface Props {
  especialista: Especialista
  onSaved:      (bono: Bono) => void
  onClose:      () => void
}

export function NuevoBonoModal({ especialista, onSaved, onClose }: Props) {
  const TODAY = new Date().toISOString().split('T')[0]

  const [sesiones,   setSesiones]   = useState('10')
  const [precio,     setPrecio]     = useState('')
  const [fechaPago,  setFechaPago]  = useState(TODAY)
  const [pagadoVia,  setPagadoVia]  = useState<PagadoVia>('personal')
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  const precioNum = parseFloat(precio.replace(',', '.')) || 0
  const deudaPareja = precioNum / 2

  async function handleSave() {
    setErr('')
    const ses = parseInt(sesiones)
    if (!ses || ses < 1) { setErr('Indica el número de sesiones'); return }
    if (!precioNum)       { setErr('Indica el precio del bono'); return }

    setSaving(true)
    try {
      const bono = await createBono({
        especialista_id:      especialista.id,
        especialista_nombre:  especialista.nombre,
        especialista_tipo:    especialista.tipo,
        sesiones_contratadas: ses,
        precio_total:         precioNum,
        fecha_pago:           fechaPago,
        pagado_via:           pagadoVia,
      })
      onSaved(bono)
      toast.success('Bono añadido y gasto registrado en Finanzas')
      onClose()
    } catch {
      toast.error('No se pudo guardar el bono')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm z-[--z-modal-backdrop]" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm z-[--z-modal] bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)]">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Añadir bono</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{especialista.nombre} · {especialista.tipo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nº sesiones</label>
              <input
                type="number"
                value={sesiones}
                onChange={(e) => setSesiones(e.target.value)}
                min={1}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Precio total (€)</label>
              <input
                type="text"
                inputMode="decimal"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="350,00"
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Fecha de pago</label>
            <input
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Pagar con</label>
            <div className="flex gap-2">
              {([
                { id: 'personal', label: 'Mi cuenta' },
                { id: 'conjunta', label: 'Cuenta conjunta' },
              ] as const).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setPagadoVia(id)}
                  className={cn(
                    'flex-1 py-2 rounded-[10px] text-sm font-medium transition-colors',
                    pagadoVia === id
                      ? 'bg-petroleo text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Resumen económico */}
          {precioNum > 0 && (
            <div className="glass-subtle rounded-[12px] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gasto en Finanzas</span>
                <span className="font-semibold text-foreground">{formatCurrency(precioNum)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tu parte (50%)</span>
                <span className="font-medium text-foreground">{formatCurrency(deudaPareja)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tu pareja te deberá</span>
                <span className="font-semibold text-teal-brand">{formatCurrency(deudaPareja)}</span>
              </div>
              {parseInt(sesiones) > 0 && (
                <div className="pt-1.5 mt-1.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Coste por sesión ({especialista.duracion_sesion}min)</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(precioNum / parseInt(sesiones))}
                  </span>
                </div>
              )}
            </div>
          )}

          {err && <p className="text-sm text-rojo-tierra">{err}</p>}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Añadir bono'}
          </button>
        </div>
      </div>
    </>
  )
}
