'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, ChevronUp, Clock, TrendingUp, Zap, Users2, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useSession } from '@/contexts/sessionContext'
import {
  getEspecialistas, deleteEspecialista, toggleRealizada, deleteSesion,
  type Especialista, type Sesion, type Bono,
} from '@/lib/salud'
import { NuevoEspecialistaModal } from './NuevoEspecialistaModal'
import { NuevoBonoModal }         from './NuevoBonoModal'
import { RegistrarSesionModal }   from './RegistrarSesionModal'

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

function formatHora(hora: string | null | undefined): string {
  if (!hora) return ''
  return hora.slice(0, 5)  // "HH:MM"
}

function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

// ─── Session row ───────────────────────────────────────────────────────────────

function SesionRow({
  s,
  onEdit,
  onDelete,
  onToggleRealizada,
}: {
  s:                 Sesion
  onEdit:            (s: Sesion) => void
  onDelete:          (s: Sesion) => void
  onToggleRealizada: (id: string, val: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 group">
      {/* Checkbox realizada */}
      <button
        onClick={() => onToggleRealizada(s.id, !s.realizada)}
        className={cn(
          'w-4 h-4 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          s.realizada ? 'bg-teal-brand border-teal-brand' : 'border-border bg-background hover:border-teal-brand/50'
        )}
        title={s.realizada ? 'Marcar como prevista' : 'Marcar como realizada'}
      >
        {s.realizada && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Fecha + hora */}
      <div className="flex items-center gap-1.5 text-sm min-w-0 flex-1">
        <Clock className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/60" />
        <span className={cn('text-sm', s.realizada ? 'text-foreground' : 'text-muted-foreground/70')}>
          {formatFechaCorta(s.fecha)}
        </span>
        {s.hora && (
          <span className="text-xs text-muted-foreground/60">{formatHora(s.hora)}</span>
        )}
        {!s.realizada && (
          <span className="text-[10px] font-medium text-ambar bg-ambar/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
            Prevista
          </span>
        )}
        {s.notas && (
          <span className="text-xs text-muted-foreground/60 truncate min-w-0">· {s.notas}</span>
        )}
      </div>

      <span className="text-sm text-muted-foreground flex-shrink-0">{formatMinutos(s.duracion)}</span>

      {/* Acciones (aparecen en hover) */}
      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(s)}
          className="p-1 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Editar sesión"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(s)}
          className="p-1 rounded-[6px] text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors"
          title="Eliminar sesión"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Bono card ─────────────────────────────────────────────────────────────────

function BonoCard({
  esp,
  partnerName,
  onDelete,
  onSesionAdded,
  onSesionUpdated,
  onSesionDeleted,
  onBonoAdded,
}: {
  esp:             Especialista
  partnerName:     string
  onDelete:        (id: string) => void
  onSesionAdded:   (id: string, s: Sesion) => void
  onSesionUpdated: (id: string, s: Sesion) => void
  onSesionDeleted: (id: string, sesionId: string) => void
  onBonoAdded:     (id: string, b: Bono) => void
}) {
  const [bonosOpen,   setBonosOpen]   = useState(false)
  const [histOpen,    setHistOpen]    = useState(false)
  const [sesionModal, setSesionModal] = useState(false)
  const [editSesion,  setEditSesion]  = useState<Sesion | null>(null)
  const [bonoModal,   setBonoModal]   = useState(false)
  const [confirm,     setConfirm]     = useState(false)

  const bonos    = esp.bonos    ?? []
  const sesiones = esp.sesiones ?? []

  // Solo sesiones realizadas consumen tiempo del bono
  const realizadas = sesiones.filter((s) => s.realizada)
  const previstas  = sesiones.filter((s) => !s.realizada)

  const totalMinBonos  = bonos.reduce((acc, b) => acc + b.sesiones_contratadas * esp.duracion_sesion, 0)
  const totalInvertido = bonos.reduce((acc, b) => acc + b.precio_total, 0)
  const consumido      = realizadas.reduce((acc, s) => acc + s.duracion, 0)
  const restante       = Math.max(totalMinBonos - consumido, 0)
  const pct            = totalMinBonos > 0 ? Math.min((consumido / totalMinBonos) * 100, 100) : 0
  const costePorMin    = totalMinBonos > 0 ? totalInvertido / totalMinBonos : 0
  const costeSesion    = costePorMin * esp.duracion_sesion
  const sesEquiv       = esp.duracion_sesion > 0 ? restante / esp.duracion_sesion : 0

  const warning  = pct >= 75
  const danger   = pct >= 90
  const barColor = danger ? '#AE2012' : warning ? '#EE9B00' : '#0A9396'

  async function handleToggle(sesionId: string, val: boolean) {
    try {
      const updated = await toggleRealizada(sesionId, val)
      onSesionUpdated(esp.id, updated)
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  async function handleDeleteSesion(s: Sesion) {
    try {
      await deleteSesion(s.id, s.gasto_id ?? undefined)
      onSesionDeleted(esp.id, s.id)
      toast.success('Sesión eliminada')
    } catch {
      toast.error('No se pudo eliminar la sesión')
    }
  }

  return (
    <>
      <div className="card-tech overflow-hidden">
        <div className="p-5 space-y-4">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                 style={{ backgroundColor: '#005F73' }}>
              {iniciales(esp.nombre)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{esp.nombre}</p>
              <p className="text-xs text-muted-foreground">{esp.tipo} · Bono de sesiones</p>
              {totalInvertido > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total invertido: <span className="font-semibold text-foreground">{formatCurrency(totalInvertido)}</span>
                  <span className="ml-1 text-muted-foreground/70">· {partnerName} te debe {formatCurrency(totalInvertido / 2)}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setBonoModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Bono
              </button>
              <button
                onClick={() => setConfirm(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Lista de bonos */}
          {bonos.length > 0 ? (
            <div className="glass-subtle rounded-[12px] overflow-hidden">
              <button
                onClick={() => setBonosOpen((v) => !v)}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-white/20 transition-colors"
              >
                <span className="font-medium text-foreground">
                  {bonos.length} bono{bonos.length !== 1 ? 's' : ''} · {formatCurrency(totalInvertido)}
                </span>
                {bonosOpen
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {bonosOpen && (
                <div className="px-3 pb-3 space-y-2 border-t border-border/40 pt-2">
                  {bonos.map((b, i) => (
                    <div key={b.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: '#005F73' }}>
                          {i + 1}
                        </span>
                        <span>{formatFechaCorta(b.fecha_pago)}</span>
                        <span>· {b.sesiones_contratadas} ses · {formatMinutos(b.sesiones_contratadas * esp.duracion_sesion)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground/60 text-[10px]">
                          {b.pagado_via === 'conjunta' ? 'Conjunta' : 'Personal'}
                        </span>
                        <span className="font-semibold text-foreground">{formatCurrency(b.precio_total)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>50-50 con {partnerName} → te deben</span>
                    <span className="font-semibold text-teal-brand">{formatCurrency(totalInvertido / 2)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-subtle rounded-[12px] p-3 text-center">
              <p className="text-xs text-muted-foreground">Sin bonos registrados.</p>
              <button
                onClick={() => setBonoModal(true)}
                className="text-xs text-petroleo hover:underline mt-1 block mx-auto"
              >
                Añadir primer bono
              </button>
            </div>
          )}

          {/* Barra de progreso agregada */}
          {totalMinBonos > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                <span>
                  {formatMinutos(consumido)} realizados
                  {previstas.length > 0 && (
                    <span className="ml-1.5 text-ambar">+ {previstas.length} previstas</span>
                  )}
                </span>
                <span>{formatMinutos(totalMinBonos)} totales</span>
              </div>
              <div className="h-2.5 bg-border/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${pct}%`, backgroundColor: barColor }} />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-muted-foreground">{Math.round(pct)}% consumido</span>
                {danger  && <span className="font-semibold" style={{ color: '#AE2012' }}>¡Pool casi agotado!</span>}
                {warning && !danger && <span className="font-medium" style={{ color: '#EE9B00' }}>Pocas sesiones</span>}
              </div>
            </div>
          )}

          {/* Stats */}
          {totalMinBonos > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="glass-subtle rounded-[10px] p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Restante</p>
                <p className="text-base font-bold" style={{ color: barColor }}>{sesEquiv.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">sesiones</p>
              </div>
              <div className="glass-subtle rounded-[10px] p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Tiempo</p>
                <p className="text-base font-bold text-foreground">{formatMinutos(restante)}</p>
                <p className="text-[10px] text-muted-foreground">restante</p>
              </div>
              <div className="glass-subtle rounded-[10px] p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Coste real</p>
                <p className="text-base font-bold text-foreground">{costePorMin > 0 ? formatCurrency(costeSesion) : '—'}</p>
                <p className="text-[10px] text-muted-foreground">/ {esp.duracion_sesion}min</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSesionModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar sesión
            </button>
            {sesiones.length > 0 && (
              <button
                onClick={() => setHistOpen((v) => !v)}
                className="px-3 py-2 rounded-[10px] glass-subtle text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {histOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Confirmar borrado especialista */}
          {confirm && (
            <div className="pt-3 border-t border-border/50 flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1">¿Eliminar especialista y sus bonos?</p>
              <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground">Cancelar</button>
              <button onClick={() => onDelete(esp.id)} className="text-xs font-semibold text-rojo-tierra">Eliminar</button>
            </div>
          )}

          {/* Historial de sesiones */}
          {histOpen && sesiones.length > 0 && (
            <div className="pt-3 border-t border-border/50 space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Sesiones ({realizadas.length} realizadas{previstas.length > 0 ? ` · ${previstas.length} previstas` : ''})
              </p>
              {sesiones.map((s) => (
                <SesionRow
                  key={s.id}
                  s={s}
                  onEdit={setEditSesion}
                  onDelete={handleDeleteSesion}
                  onToggleRealizada={handleToggle}
                />
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
      {editSesion && (
        <RegistrarSesionModal
          especialista={esp}
          sesion={editSesion}
          onSaved={(s) => { onSesionUpdated(esp.id, s); setEditSesion(null) }}
          onClose={() => setEditSesion(null)}
        />
      )}
      {bonoModal && (
        <NuevoBonoModal
          especialista={esp}
          onSaved={(b) => onBonoAdded(esp.id, b)}
          onClose={() => setBonoModal(false)}
        />
      )}
    </>
  )
}

// ─── Por sesión card ────────────────────────────────────────────────────────────

function PorSesionCard({
  esp,
  partnerName,
  onDelete,
  onSesionAdded,
  onSesionUpdated,
  onSesionDeleted,
}: {
  esp:             Especialista
  partnerName:     string
  onDelete:        (id: string) => void
  onSesionAdded:   (id: string, s: Sesion) => void
  onSesionUpdated: (id: string, s: Sesion) => void
  onSesionDeleted: (id: string, sesionId: string) => void
}) {
  const [histOpen,    setHistOpen]    = useState(false)
  const [sesionModal, setSesionModal] = useState(false)
  const [editSesion,  setEditSesion]  = useState<Sesion | null>(null)
  const [confirm,     setConfirm]     = useState(false)

  const sesiones      = esp.sesiones ?? []
  const realizadas    = sesiones.filter((s) => s.realizada)
  const previstas     = sesiones.filter((s) => !s.realizada)
  const totalSesiones = realizadas.length
  const totalGastado  = totalSesiones * (esp.precio_sesion ?? 0)

  async function handleToggle(sesionId: string, val: boolean) {
    try {
      const updated = await toggleRealizada(sesionId, val)
      onSesionUpdated(esp.id, updated)
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  async function handleDeleteSesion(s: Sesion) {
    try {
      await deleteSesion(s.id, s.gasto_id ?? undefined)
      onSesionDeleted(esp.id, s.id)
      toast.success('Sesión eliminada')
    } catch {
      toast.error('No se pudo eliminar la sesión')
    }
  }

  return (
    <>
      <div className="card-tech overflow-hidden">
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                 style={{ backgroundColor: '#CA6702' }}>
              {iniciales(esp.nombre)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{esp.nombre}</p>
              <p className="text-xs text-muted-foreground">{esp.tipo} · Pago por sesión</p>
              {totalGastado > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total invertido: <span className="font-semibold text-foreground">{formatCurrency(totalGastado)}</span>
                  <span className="ml-1 text-muted-foreground/70">· {partnerName} te debe {formatCurrency(totalGastado / 2)}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {esp.precio_sesion && (
                <p className="text-xs text-muted-foreground mr-1">{formatCurrency(esp.precio_sesion)}/ses</p>
              )}
              <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-subtle rounded-[10px] p-3 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-brand flex-shrink-0" />
              <div>
                <p className="text-lg font-bold text-foreground">{totalSesiones}</p>
                <p className="text-[11px] text-muted-foreground">
                  sesiones{previstas.length > 0 && <span className="text-ambar"> +{previstas.length} prev.</span>}
                </p>
              </div>
            </div>
            <div className="glass-subtle rounded-[10px] p-3 flex items-center gap-3">
              <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#EE9B00' }} />
              <div>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalGastado)}</p>
                <p className="text-[11px] text-muted-foreground">total</p>
              </div>
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
            {sesiones.length > 0 && (
              <button onClick={() => setHistOpen((v) => !v)} className="px-3 py-2 rounded-[10px] glass-subtle text-sm text-muted-foreground hover:text-foreground transition-colors">
                {histOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>

          {confirm && (
            <div className="pt-3 border-t border-border/50 flex items-center gap-3">
              <p className="text-xs text-muted-foreground flex-1">¿Eliminar este especialista?</p>
              <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground">Cancelar</button>
              <button onClick={() => onDelete(esp.id)} className="text-xs font-semibold text-rojo-tierra">Eliminar</button>
            </div>
          )}

          {histOpen && sesiones.length > 0 && (
            <div className="pt-3 border-t border-border/50 space-y-0.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Sesiones ({realizadas.length} realizadas{previstas.length > 0 ? ` · ${previstas.length} previstas` : ''})
              </p>
              {sesiones.map((s) => (
                <SesionRow
                  key={s.id}
                  s={s}
                  onEdit={setEditSesion}
                  onDelete={handleDeleteSesion}
                  onToggleRealizada={handleToggle}
                />
              ))}
              {esp.precio_sesion && totalSesiones > 0 && (
                <div className="pt-2 mt-1 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">50-50 con {partnerName} → te deben</span>
                  <span className="font-semibold text-teal-brand">{formatCurrency(totalGastado / 2)}</span>
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
      {editSesion && (
        <RegistrarSesionModal
          especialista={esp}
          sesion={editSesion}
          onSaved={(s) => { onSesionUpdated(esp.id, s); setEditSesion(null) }}
          onClose={() => setEditSesion(null)}
        />
      )}
    </>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────────

export function EspecialistasView() {
  const { partner } = useSession()
  const partnerName = partner?.display_name ?? 'tu pareja'

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

  function handleSesionUpdated(espId: string, updated: Sesion) {
    setEspecialistas((prev) =>
      prev.map((e) =>
        e.id !== espId ? e : {
          ...e,
          sesiones: (e.sesiones ?? []).map((s) => s.id === updated.id ? updated : s),
        }
      )
    )
  }

  function handleSesionDeleted(espId: string, sesionId: string) {
    setEspecialistas((prev) =>
      prev.map((e) =>
        e.id !== espId ? e : {
          ...e,
          sesiones: (e.sesiones ?? []).filter((s) => s.id !== sesionId),
        }
      )
    )
  }

  function handleBonoAdded(espId: string, bono: Bono) {
    setEspecialistas((prev) =>
      prev.map((e) => e.id === espId ? { ...e, bonos: [...(e.bonos ?? []), bono] } : e)
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
          <p className="text-sm text-muted-foreground">
            {especialistas.length} especialista{especialistas.length !== 1 ? 's' : ''}
          </p>
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
                ? <BonoCard
                    key={esp.id}
                    esp={esp}
                    partnerName={partnerName}
                    onDelete={handleDelete}
                    onSesionAdded={handleSesionAdded}
                    onSesionUpdated={handleSesionUpdated}
                    onSesionDeleted={handleSesionDeleted}
                    onBonoAdded={handleBonoAdded}
                  />
                : <PorSesionCard
                    key={esp.id}
                    esp={esp}
                    partnerName={partnerName}
                    onDelete={handleDelete}
                    onSesionAdded={handleSesionAdded}
                    onSesionUpdated={handleSesionUpdated}
                    onSesionDeleted={handleSesionDeleted}
                  />
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
