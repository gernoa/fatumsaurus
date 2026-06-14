'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, ChevronUp, Clock, TrendingUp, Zap, Users2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { getEspecialistas, deleteEspecialista, type Especialista, type Sesion } from '@/lib/salud'
import { NuevoEspecialistaModal } from './NuevoEspecialistaModal'
import { RegistrarSesionModal } from './RegistrarSesionModal'

function minutosConsumidos(sesiones: Sesion[] = []): number {
  return sesiones.reduce((acc, s) => acc + s.duracion, 0)
}

function formatMinutos(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function formatFechaCorta(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

// ─── Bono card ─────────────────────────────────────────────────────────────────

function BonoCard({ esp, onDelete, onSesionAdded }: { esp: Especialista; onDelete: (id: string) => void; onSesionAdded: (id: string, s: Sesion) => void }) {
  const [expanded,    setExpanded]    = useState(false)
  const [sesionModal, setSesionModal] = useState(false)
  const [confirm,     setConfirm]     = useState(false)

  const totalMin  = (esp.sesiones_contratadas ?? 10) * esp.duracion_sesion
  const consumido = minutosConsumidos(esp.sesiones)
  const restante  = Math.max(totalMin - consumido, 0)
  const pct       = Math.min((consumido / totalMin) * 100, 100)
  const costePorMin  = esp.precio_total ? esp.precio_total / totalMin : 0
  const costeSesion  = costePorMin * esp.duracion_sesion
  const sesEquiv     = restante / esp.duracion_sesion

  const warning = pct >= 75
  const danger  = pct >= 90
  const barColor = danger ? '#AE2012' : warning ? '#EE9B00' : '#0A9396'

  return (
    <>
      <div className="card-tech overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: '#005F73' }}>
              {iniciales(esp.nombre)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{esp.nombre}</p>
              <p className="text-sm text-muted-foreground">{esp.tipo} · Bono de sesiones</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {esp.precio_total && (
                <div className="text-right mr-2">
                  <p className="text-xs text-muted-foreground">Total bono</p>
                  <p className="font-semibold text-foreground">{formatCurrency(esp.precio_total)}</p>
                </div>
              )}
              <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Barra */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
              <span>{formatMinutos(consumido)} consumidos</span>
              <span>{formatMinutos(totalMin)} totales</span>
            </div>
            <div className="h-2.5 bg-border/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-muted-foreground">{Math.round(pct)}% consumido</span>
              {danger  && <span className="text-red-600 font-semibold">¡Bono casi agotado!</span>}
              {warning && !danger && <span className="text-amber-600 font-medium">Pocas sesiones</span>}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="glass-subtle rounded-[10px] p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Restante</p>
              <p className="text-base font-bold" style={{ color: barColor }}>{sesEquiv.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">sesiones</p>
            </div>
            <div className="glass-subtle rounded-[10px] p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Tiempo restante</p>
              <p className="text-base font-bold text-foreground">{formatMinutos(restante)}</p>
              <p className="text-[10px] text-muted-foreground">de {formatMinutos(totalMin)}</p>
            </div>
            <div className="glass-subtle rounded-[10px] p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">Coste real</p>
              <p className="text-base font-bold text-foreground">{costePorMin > 0 ? formatCurrency(costeSesion) : '—'}</p>
              <p className="text-[10px] text-muted-foreground">/ sesión {esp.duracion_sesion}min</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSesionModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar sesión
            </button>
            {(esp.sesiones?.length ?? 0) > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="px-3 py-2 rounded-[10px] glass-subtle text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          {confirm && (
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1">¿Eliminar este especialista?</p>
              <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground">Cancelar</button>
              <button onClick={() => onDelete(esp.id)} className="text-xs font-semibold text-rojo-tierra">Eliminar</button>
            </div>
          )}

          {expanded && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Sesiones ({esp.sesiones?.length ?? 0})
              </p>
              {(esp.sesiones ?? []).map((s, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-sm py-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formatFechaCorta(s.fecha)}</span>
                    {s.notas && <span className="text-muted-foreground/60 text-xs truncate">· {s.notas}</span>}
                  </div>
                  <span className="text-muted-foreground flex-shrink-0">{formatMinutos(s.duracion)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {sesionModal && (
        <RegistrarSesionModal
          especialista={esp}
          onSaved={(s) => onSesionAdded(esp.id, s)}
          onClose={() => setSesionModal(false)}
        />
      )}
    </>
  )
}

// ─── Por sesión card ────────────────────────────────────────────────────────────

function PorSesionCard({ esp, onDelete, onSesionAdded }: { esp: Especialista; onDelete: (id: string) => void; onSesionAdded: (id: string, s: Sesion) => void }) {
  const [expanded,    setExpanded]    = useState(false)
  const [sesionModal, setSesionModal] = useState(false)
  const [confirm,     setConfirm]     = useState(false)

  const totalSesiones = esp.sesiones?.length ?? 0
  const totalGastado  = totalSesiones * (esp.precio_sesion ?? 0)

  return (
    <>
      <div className="card-tech overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: '#CA6702' }}>
              {iniciales(esp.nombre)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{esp.nombre}</p>
              <p className="text-sm text-muted-foreground">{esp.tipo} · Pago por sesión</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {esp.precio_sesion && (
                <p className="text-xs text-muted-foreground mr-2">{formatCurrency(esp.precio_sesion)} / sesión</p>
              )}
              <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="glass-subtle rounded-[10px] p-3 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-brand flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">{totalSesiones}</p>
                <p className="text-[11px] text-muted-foreground">sesiones totales</p>
              </div>
            </div>
            <div className="glass-subtle rounded-[10px] p-3 flex items-center gap-3">
              <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#EE9B00' }} />
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalGastado)}</p>
                <p className="text-[11px] text-muted-foreground">total invertido</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSesionModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar sesión
            </button>
            {totalSesiones > 0 && (
              <button onClick={() => setExpanded((v) => !v)} className="px-3 py-2 rounded-[10px] glass-subtle text-sm text-muted-foreground hover:text-foreground transition-colors">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          {confirm && (
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1">¿Eliminar este especialista?</p>
              <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground">Cancelar</button>
              <button onClick={() => onDelete(esp.id)} className="text-xs font-semibold text-rojo-tierra">Eliminar</button>
            </div>
          )}

          {expanded && totalSesiones > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sesiones</p>
              {(esp.sesiones ?? []).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatFechaCorta(s.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{formatMinutos(s.duracion)}</span>
                    {esp.precio_sesion && <span className="font-medium text-foreground">{formatCurrency(esp.precio_sesion)}</span>}
                  </div>
                </div>
              ))}
              {esp.precio_sesion && totalSesiones > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(totalGastado)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {sesionModal && (
        <RegistrarSesionModal
          especialista={esp}
          onSaved={(s) => onSesionAdded(esp.id, s)}
          onClose={() => setSesionModal(false)}
        />
      )}
    </>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export function EspecialistasView() {
  const [especialistas, setEspecialistas] = useState<Especialista[]>([])
  const [loading,       setLoading]       = useState(true)
  const [modalNuevo,    setModalNuevo]    = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getEspecialistas()
      setEspecialistas(data)
    } catch {
      toast.error('No se pudieron cargar los especialistas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleDelete(id: string) {
    const t = toast.loading('Eliminando...')
    deleteEspecialista(id)
      .then(() => { setEspecialistas((prev) => prev.filter((e) => e.id !== id)); toast.success('Eliminado', { id: t }) })
      .catch(() => toast.error('No se pudo eliminar', { id: t }))
  }

  function handleSesionAdded(espId: string, sesion: Sesion) {
    setEspecialistas((prev) =>
      prev.map((e) => e.id === espId ? { ...e, sesiones: [sesion, ...(e.sesiones ?? [])] } : e)
    )
  }

  if (loading) return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {[1, 2].map((i) => <div key={i} className="card-tech h-72 animate-pulse bg-secondary/50" />)}
    </div>
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{especialistas.length} especialista{especialistas.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setModalNuevo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo especialista
          </button>
        </div>

        {especialistas.length === 0 ? (
          <div className="glass rounded-[16px] p-12 text-center text-muted-foreground">
            <Users2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes especialistas registrados.</p>
            <button
              onClick={() => setModalNuevo(true)}
              className="mt-4 px-4 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              Añadir primer especialista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {especialistas.map((esp) =>
              esp.modalidad === 'bono'
                ? <BonoCard key={esp.id} esp={esp} onDelete={handleDelete} onSesionAdded={handleSesionAdded} />
                : <PorSesionCard key={esp.id} esp={esp} onDelete={handleDelete} onSesionAdded={handleSesionAdded} />
            )}
          </div>
        )}
      </div>

      {modalNuevo && (
        <NuevoEspecialistaModal
          onSaved={(e) => setEspecialistas((prev) => [...prev, e])}
          onClose={() => setModalNuevo(false)}
        />
      )}
    </>
  )
}
