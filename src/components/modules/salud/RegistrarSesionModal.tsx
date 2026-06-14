'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { registrarSesion, type Especialista, type Sesion, type PagadoVia } from '@/lib/salud'

interface Props {
  especialista: Especialista
  onSaved:     (sesion: Sesion) => void
  onClose:     () => void
}

function formatMinutos(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function RegistrarSesionModal({ especialista, onSaved, onClose }: Props) {
  const TODAY   = new Date().toISOString().split('T')[0]
  const [fecha,     setFecha]     = useState(TODAY)
  const [duracion,  setDuracion]  = useState(especialista.duracion_sesion.toString())
  const [notas,     setNotas]     = useState('')
  const [pagadoVia, setPagadoVia] = useState<PagadoVia>('personal')
  const [saving,    setSaving]    = useState(false)

  const esBono      = especialista.modalidad === 'bono'
  const esPorSesion = especialista.modalidad === 'por_sesion'
  const durInt      = parseInt(duracion) || especialista.duracion_sesion

  // Calcular pool restante para especialistas de bono
  const totalMinBonos = esBono
    ? (especialista.bonos ?? []).reduce((acc, b) => acc + b.sesiones_contratadas * especialista.duracion_sesion, 0)
    : 0
  const consumido = (especialista.sesiones ?? []).reduce((acc, s) => acc + s.duracion, 0)
  const restante  = Math.max(totalMinBonos - consumido, 0)
  const sesRestantes = especialista.duracion_sesion > 0 ? restante / especialista.duracion_sesion : 0

  async function handleSave() {
    setSaving(true)
    try {
      const sesion = await registrarSesion({
        especialista_id:     especialista.id,
        especialista_nombre: especialista.nombre,
        especialista_tipo:   especialista.tipo,
        fecha,
        duracion:  durInt,
        notas:     notas.trim() || undefined,
        pagado_via: esPorSesion ? pagadoVia : undefined,
        precio:     esPorSesion ? (especialista.precio_sesion ?? undefined) : undefined,
      })
      onSaved(sesion)
      toast.success('Sesión registrada')
      onClose()
    } catch {
      toast.error('No se pudo registrar la sesión')
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
            <h2 className="font-semibold text-foreground">Registrar sesión</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{especialista.nombre} · {especialista.tipo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Duración (min)</label>
              <input
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                min={5}
                step={5}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {/* Info de bono: pool restante */}
          {esBono && totalMinBonos > 0 && (
            <div className="glass-subtle rounded-[12px] p-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sesiones restantes en el pool</span>
                <span className="font-semibold text-foreground">{sesRestantes.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tiempo restante</span>
                <span>{formatMinutos(restante)}</span>
              </div>
              {durInt > 0 && restante > 0 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Después de esta sesión quedarán</span>
                  <span className="font-medium">{formatMinutos(Math.max(restante - durInt, 0))}</span>
                </div>
              )}
            </div>
          )}

          {/* Info de pago por sesión: gasto + 50-50 */}
          {esPorSesion && especialista.precio_sesion && (
            <div className="glass-subtle rounded-[12px] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gasto en Finanzas</span>
                <span className="font-semibold text-foreground">{formatCurrency(especialista.precio_sesion)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>50-50 con pareja → te deberá</span>
                <span className="font-semibold text-teal-brand">{formatCurrency(especialista.precio_sesion / 2)}</span>
              </div>
            </div>
          )}

          {/* Cuenta de pago (solo para por_sesion con precio) */}
          {esPorSesion && especialista.precio_sesion && (
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
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ejercicios, observaciones..."
              rows={3}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>
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
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </>
  )
}
