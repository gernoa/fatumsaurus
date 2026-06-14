'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, MapPin, User, ChevronDown, ChevronUp, Clock, Stethoscope, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getCitas, deleteCita, updateCita, type Cita, type EstadoCita } from '@/lib/salud'
import { NuevaCitaModal } from './NuevaCitaModal'

const ESTADO_CONFIG: Record<EstadoCita, { label: string; classes: string }> = {
  pendiente:  { label: 'Pendiente',  classes: 'bg-amber-100/80 text-amber-800' },
  realizada:  { label: 'Realizada',  classes: 'bg-teal-100/80 text-teal-800' },
  cancelada:  { label: 'Cancelada',  classes: 'bg-red-100/80 text-red-800' },
}

function diasRestantes(fecha: string): number {
  const hoy  = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(fecha + 'T00:00:00').getTime() - hoy.getTime()) / 86400000)
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function CitaCard({
  cita,
  onEdit,
  onDelete,
  onEstado,
}: {
  cita:     Cita
  onEdit:   (c: Cita) => void
  onDelete: (id: string) => void
  onEstado: (id: string, estado: EstadoCita) => void
}) {
  const [expanded,       setExpanded]       = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [showEstadoMenu, setShowEstadoMenu] = useState(false)

  const estadoConf = ESTADO_CONFIG[cita.estado]
  const dias       = diasRestantes(cita.fecha)
  const esFutura   = cita.estado === 'pendiente'
  const tieneDetalle = !!(cita.notas || cita.resultado)

  return (
    <div className={cn('card-tech overflow-hidden', !esFutura && 'opacity-80')}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Especialidad + estado */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-sm font-semibold text-foreground">{cita.especialidad}</span>
              <button
                onClick={() => setShowEstadoMenu((v) => !v)}
                className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-75', estadoConf.classes)}
              >
                {estadoConf.label}
              </button>
              {esFutura && dias >= 0 && dias <= 7 && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}
                </span>
              )}
            </div>

            {/* Cambio de estado rápido */}
            {showEstadoMenu && (
              <div className="flex gap-1.5 mb-2">
                {(['pendiente', 'realizada', 'cancelada'] as EstadoCita[]).map((e) => (
                  <button
                    key={e}
                    onClick={() => { onEstado(cita.id, e); setShowEstadoMenu(false) }}
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[11px] font-medium capitalize transition-colors',
                      cita.estado === e ? 'bg-petroleo text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Fecha + hora */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1 flex-wrap">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="capitalize">{formatFecha(cita.fecha)}</span>
              <span className="text-muted-foreground/50">·</span>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{cita.hora.slice(0, 5)}</span>
            </div>

            {cita.medico && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{cita.medico}</span>
              </div>
            )}
            {cita.centro && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{cita.centro}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(cita)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Confirmar borrado */}
        {confirmDelete && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3">
            <p className="text-xs text-muted-foreground flex-1">¿Eliminar esta cita?</p>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
            <button onClick={() => onDelete(cita.id)} className="text-xs font-semibold text-rojo-tierra hover:underline">Eliminar</button>
          </div>
        )}

        {/* Expandir */}
        {tieneDetalle && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 mt-3 text-xs text-petroleo hover:text-teal-brand transition-colors font-medium"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Ocultar' : (cita.resultado ? 'Ver resultado' : 'Ver notas')}
          </button>
        )}

        {expanded && tieneDetalle && (
          <div className="mt-2 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground leading-relaxed">{cita.resultado ?? cita.notas}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function CitasView() {
  const [citas,   setCitas]   = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState<'nueva' | Cita | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getCitas()
      setCitas(data)
    } catch {
      toast.error('No se pudieron cargar las citas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleSaved(cita: Cita) {
    setCitas((prev) => {
      const idx = prev.findIndex((c) => c.id === cita.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = cita; return next }
      return [cita, ...prev]
    })
  }

  async function handleDelete(id: string) {
    const t = toast.loading('Eliminando...')
    try {
      await deleteCita(id)
      setCitas((prev) => prev.filter((c) => c.id !== id))
      toast.success('Cita eliminada', { id: t })
    } catch {
      toast.error('No se pudo eliminar', { id: t })
    }
  }

  async function handleEstado(id: string, estado: EstadoCita) {
    try {
      await updateCita(id, { estado })
      setCitas((prev) => prev.map((c) => c.id === id ? { ...c, estado } : c))
      toast.success(`Cita marcada como ${estado}`)
    } catch {
      toast.error('No se pudo actualizar')
    }
  }

  const proximas = citas.filter((c) => c.estado === 'pendiente').sort((a, b) => a.fecha.localeCompare(b.fecha))
  const pasadas  = citas.filter((c) => c.estado !== 'pendiente').sort((a, b) => b.fecha.localeCompare(a.fecha))

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card-tech p-4 h-24 animate-pulse bg-secondary/50" />
      ))}
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{proximas.length} cita{proximas.length !== 1 ? 's' : ''} próxima{proximas.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setModal('nueva')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva cita
          </button>
        </div>

        {proximas.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Próximas</h3>
            {proximas.map((c) => (
              <CitaCard key={c.id} cita={c} onEdit={setModal} onDelete={handleDelete} onEstado={handleEstado} />
            ))}
          </section>
        )}

        {pasadas.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Anteriores</h3>
            {pasadas.map((c) => (
              <CitaCard key={c.id} cita={c} onEdit={setModal} onDelete={handleDelete} onEstado={handleEstado} />
            ))}
          </section>
        )}

        {citas.length === 0 && !loading && (
          <div className="glass rounded-[16px] p-12 text-center text-muted-foreground">
            <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tienes citas registradas todavía.</p>
            <button
              onClick={() => setModal('nueva')}
              className="mt-4 px-4 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              Añadir primera cita
            </button>
          </div>
        )}
      </div>

      {modal !== null && (
        <NuevaCitaModal
          cita={modal === 'nueva' ? undefined : modal}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
