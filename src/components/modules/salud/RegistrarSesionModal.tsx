'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useSession } from '@/contexts/sessionContext'
import { registrarSesion, updateSesion, type Especialista, type Sesion, type PagadoVia } from '@/lib/salud'

interface Props {
  especialista: Especialista
  sesion?:      Sesion          // si se pasa → modo edición
  onSaved:      (sesion: Sesion) => void
  onClose:      () => void
}

function formatMinutos(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function getPaidViaPref(): PagadoVia {
  if (typeof window === 'undefined') return 'personal'
  return (localStorage.getItem('fatum_paid_via') as PagadoVia) || 'personal'
}

export function RegistrarSesionModal({ especialista, sesion, onSaved, onClose }: Props) {
  const { partner } = useSession()
  const editMode  = !!sesion
  const TODAY     = new Date().toISOString().split('T')[0]

  const [fecha,     setFecha]     = useState(sesion?.fecha    ?? TODAY)
  const [hora,      setHora]      = useState(sesion?.hora     ?? '')
  const [duracion,  setDuracion]  = useState((sesion?.duracion ?? especialista.duracion_sesion).toString())
  const [notas,     setNotas]     = useState(sesion?.notas    ?? '')
  const [realizada, setRealizada] = useState(sesion?.realizada ?? false)
  const [pagadoVia, setPagadoVia] = useState<PagadoVia>(sesion?.pagado_via ?? getPaidViaPref())
  const [saving,    setSaving]    = useState(false)

  const esBono      = especialista.modalidad === 'bono'
  const esPorSesion = especialista.modalidad === 'por_sesion'
  const durInt      = parseInt(duracion) || especialista.duracion_sesion

  const conjuntaLabel = partner ? `Conjunta con ${partner.display_name}` : 'Cuenta conjunta'

  // Pool restante para bono (solo sesiones realizadas)
  const totalMinBonos = esBono
    ? (especialista.bonos ?? []).reduce((acc, b) => acc + b.sesiones_contratadas * especialista.duracion_sesion, 0)
    : 0
  const consumido = (especialista.sesiones ?? [])
    .filter(s => s.realizada && s.id !== sesion?.id)  // excluir la sesión en edición
    .reduce((acc, s) => acc + s.duracion, 0)
  const restante = Math.max(totalMinBonos - consumido, 0)
  const sesRestantes = especialista.duracion_sesion > 0 ? restante / especialista.duracion_sesion : 0

  function handlePaidViaChange(v: PagadoVia) {
    setPagadoVia(v)
    localStorage.setItem('fatum_paid_via', v)
  }

  async function handleSave() {
    setSaving(true)
    try {
      let saved: Sesion
      if (editMode && sesion) {
        saved = await updateSesion(sesion.id, {
          fecha,
          hora:     hora || null,
          duracion: durInt,
          notas:    notas.trim() || null,
          realizada,
          pagado_via: esPorSesion ? pagadoVia : undefined,
        })
      } else {
        saved = await registrarSesion({
          especialista_id:     especialista.id,
          especialista_nombre: especialista.nombre,
          especialista_tipo:   especialista.tipo,
          fecha,
          hora:     hora || null,
          duracion: durInt,
          notas:    notas.trim() || undefined,
          realizada,
          pagado_via: esPorSesion ? pagadoVia : undefined,
          precio:     esPorSesion ? (especialista.precio_sesion ?? undefined) : undefined,
        })
      }
      onSaved(saved)
      toast.success(editMode ? 'Sesión actualizada' : 'Sesión registrada')
      onClose()
    } catch {
      toast.error('No se pudo guardar la sesión')
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
            <h2 className="font-semibold text-foreground">
              {editMode ? 'Editar sesión' : 'Registrar sesión'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{especialista.nombre} · {especialista.tipo}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Fecha + Hora */}
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {/* Duración */}
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

          {/* Realizada checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setRealizada((v) => !v)}
              className={cn(
                'w-5 h-5 rounded-[5px] border-2 flex items-center justify-center transition-colors flex-shrink-0',
                realizada ? 'bg-petroleo border-petroleo' : 'border-border bg-background'
              )}
            >
              {realizada && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Sesión realizada</p>
              <p className="text-xs text-muted-foreground">
                {realizada
                  ? esBono ? 'Consume tiempo del bono' : 'Se registra el gasto en Finanzas'
                  : 'Sesión prevista — no consume bono todavía'}
              </p>
            </div>
          </label>

          {/* Info pool bono */}
          {esBono && totalMinBonos > 0 && realizada && (
            <div className="glass-subtle rounded-[12px] p-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pool restante (sin esta sesión)</span>
                <span className="font-semibold text-foreground">{sesRestantes.toFixed(1)} ses</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Después de esta sesión</span>
                <span>{formatMinutos(Math.max(restante - durInt, 0))}</span>
              </div>
            </div>
          )}

          {/* Info pago por sesión */}
          {esPorSesion && especialista.precio_sesion && realizada && (
            <div className="glass-subtle rounded-[12px] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gasto en Finanzas</span>
                <span className="font-semibold text-foreground">{formatCurrency(especialista.precio_sesion)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>50-50 → {partner ? `${partner.display_name} te deberá` : 'tu pareja te deberá'}</span>
                <span className="font-semibold text-teal-brand">{formatCurrency(especialista.precio_sesion / 2)}</span>
              </div>
            </div>
          )}

          {/* Cuenta (solo por sesión + realizada) */}
          {esPorSesion && especialista.precio_sesion && realizada && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pagar con</label>
              <div className="flex gap-2">
                {([
                  { id: 'personal' as PagadoVia, label: 'Mi cuenta' },
                  { id: 'conjunta' as PagadoVia, label: conjuntaLabel },
                ] as const).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handlePaidViaChange(id)}
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

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ejercicios, observaciones..."
              rows={2}
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
            {saving ? 'Guardando...' : editMode ? 'Guardar cambios' : 'Registrar'}
          </button>
        </div>
      </div>
    </>
  )
}
