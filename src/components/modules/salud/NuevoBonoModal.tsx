'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useSession } from '@/contexts/sessionContext'
import { createBono, updateBono, type Especialista, type Bono, type PagadoVia } from '@/lib/salud'

function getPaidViaPref(): PagadoVia {
  if (typeof window === 'undefined') return 'personal'
  return (localStorage.getItem('fatum_paid_via') as PagadoVia) || 'personal'
}

interface Props {
  especialista: Especialista
  bono?:        Bono          // si se pasa, modo edición
  onSaved:      (bono: Bono) => void
  onClose:      () => void
}

export function NuevoBonoModal({ especialista, bono, onSaved, onClose }: Props) {
  const { partner } = useSession()
  const TODAY = new Date().toISOString().split('T')[0]
  const isEdit = !!bono

  const [sesiones,   setSesiones]   = useState(bono?.sesiones_contratadas?.toString() ?? '10')
  const [precio,     setPrecio]     = useState(bono?.precio_total?.toString() ?? '')
  const [fechaPago,  setFechaPago]  = useState(bono?.fecha_pago ?? TODAY)
  const [pagadoVia,  setPagadoVia]  = useState<PagadoVia>(bono?.pagado_via ?? getPaidViaPref())
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  const conjuntaLabel = partner ? `Conjunta con ${partner.display_name}` : 'Cuenta conjunta'

  function handlePagadoVia(v: PagadoVia) {
    setPagadoVia(v)
    localStorage.setItem('fatum_paid_via', v)
  }

  const precioNum = parseFloat(precio.replace(',', '.')) || 0
  const deudaPareja = precioNum / 2

  async function handleSave() {
    setErr('')
    const ses = parseInt(sesiones)
    if (!ses || ses < 1) { setErr('Indica el número de sesiones'); return }
    if (!precioNum)       { setErr('Indica el precio del bono'); return }

    setSaving(true)
    try {
      let result: Bono
      if (isEdit && bono) {
        result = await updateBono(
          bono.id,
          { sesiones_contratadas: ses, precio_total: precioNum, fecha_pago: fechaPago, pagado_via: pagadoVia },
          bono.gasto_id
        )
        toast.success('Bono actualizado')
      } else {
        result = await createBono({
          especialista_id:      especialista.id,
          especialista_nombre:  especialista.nombre,
          especialista_tipo:    especialista.tipo,
          sesiones_contratadas: ses,
          precio_total:         precioNum,
          fecha_pago:           fechaPago,
          pagado_via:           pagadoVia,
        })
        toast.success('Bono añadido y gasto registrado en Finanzas')
      }
      onSaved(result)
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      toast.error(`No se pudo guardar el bono: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm z-[--z-modal-backdrop]" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm z-[--z-modal] glass rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.25)]">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">{isEdit ? 'Editar bono' : 'Añadir bono'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{especialista.nombre} · {especialista.tipo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Aviso si la pareja no está configurada */}
          {!partner && (
            <div className="flex items-start gap-2 bg-ambar/10 border border-ambar/25 rounded-[10px] px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-ambar flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">
                No tienes pareja configurada.{' '}
                <Link href="/ajustes" onClick={onClose} className="font-semibold underline">
                  Configúrala en Ajustes
                </Link>{' '}
                para que el 50-50 muestre el nombre correcto.
              </p>
            </div>
          )}

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
                { id: 'personal' as PagadoVia, label: 'Mi cuenta' },
                { id: 'conjunta' as PagadoVia, label: conjuntaLabel },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => handlePagadoVia(id)}
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
                <span className="text-muted-foreground">{partner ? `${partner.display_name} te deberá` : 'Tu pareja te deberá'}</span>
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
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Añadir bono'}
          </button>
        </div>
      </div>
    </>
  )
}
