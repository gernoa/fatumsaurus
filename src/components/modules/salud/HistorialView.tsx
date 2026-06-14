'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, ChevronDown, ChevronUp, BookOpen, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getHistorial, deleteEntradaHistorial, type EntradaHistorial, type TipoHistorial } from '@/lib/salud'
import { NuevaEntradaHistorialModal } from './NuevaEntradaHistorialModal'

const TIPO_CONFIG: Record<TipoHistorial, string> = {
  Consulta:     'bg-teal-100/80 text-teal-800',
  Diagnóstico:  'bg-amber-100/80 text-amber-800',
  Intervención: 'bg-red-100/80 text-red-800',
  Analítica:    'bg-blue-100/80 text-blue-800',
  Vacuna:       'bg-purple-100/80 text-purple-800',
  Otro:         'bg-gray-100/80 text-gray-700',
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function EntradaCard({ entrada, onEdit, onDelete }: {
  entrada:  EntradaHistorial
  onEdit:   (e: EntradaHistorial) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  return (
    <div className="flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-petroleo mt-1.5 flex-shrink-0" />
        <div className="w-px flex-1 bg-border/50 mt-1" />
      </div>

      <div className="card-tech p-4 flex-1 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1.5">{formatFecha(entrada.fecha)}</p>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', TIPO_CONFIG[entrada.tipo])}>
                {entrada.tipo}
              </span>
            </div>
            <p className="font-medium text-foreground">{entrada.titulo}</p>
            {(entrada.medico || entrada.centro) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {[entrada.medico, entrada.centro].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onEdit(entrada)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-rojo-tierra hover:bg-secondary transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {confirm && (
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3">
            <p className="text-xs text-muted-foreground flex-1">¿Eliminar esta entrada?</p>
            <button onClick={() => setConfirm(false)} className="text-xs text-muted-foreground">Cancelar</button>
            <button onClick={() => onDelete(entrada.id)} className="text-xs font-semibold text-rojo-tierra">Eliminar</button>
          </div>
        )}

        {(entrada.descripcion || entrada.etiquetas.length > 0) && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 mt-2 text-xs text-petroleo hover:text-teal-brand transition-colors font-medium"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Leer menos' : 'Leer más'}
          </button>
        )}

        {expanded && (
          <div className="mt-2 pt-2 border-t border-border/50">
            {entrada.descripcion && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{entrada.descripcion}</p>
            )}
            {entrada.etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entrada.etiquetas.map((tag) => (
                  <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function HistorialView() {
  const [entradas, setEntradas] = useState<EntradaHistorial[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'nueva' | EntradaHistorial | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getHistorial()
      setEntradas(data)
    } catch {
      toast.error('No se pudo cargar el historial')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleSaved(entrada: EntradaHistorial) {
    setEntradas((prev) => {
      const idx = prev.findIndex((e) => e.id === entrada.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = entrada; return next }
      return [entrada, ...prev]
    })
  }

  async function handleDelete(id: string) {
    const t = toast.loading('Eliminando...')
    try {
      await deleteEntradaHistorial(id)
      setEntradas((prev) => prev.filter((e) => e.id !== id))
      toast.success('Entrada eliminada', { id: t })
    } catch {
      toast.error('No se pudo eliminar', { id: t })
    }
  }

  const byYear = entradas.reduce<Record<string, EntradaHistorial[]>>((acc, e) => {
    const year = e.fecha.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(e)
    return acc
  }, {})

  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="card-tech h-24 animate-pulse bg-secondary/50" />)}
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{entradas.length} entrada{entradas.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setModal('nueva')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva entrada
          </button>
        </div>

        {entradas.length === 0 ? (
          <div className="glass rounded-[16px] p-12 text-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">El historial médico está vacío.</p>
            <button
              onClick={() => setModal('nueva')}
              className="mt-4 px-4 py-2 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors"
            >
              Añadir primera entrada
            </button>
          </div>
        ) : (
          years.map((year) => (
            <section key={year}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">{year}</h3>
              {byYear[year]
                .sort((a, b) => b.fecha.localeCompare(a.fecha))
                .map((e) => <EntradaCard key={e.id} entrada={e} onEdit={setModal} onDelete={handleDelete} />)
              }
            </section>
          ))
        )}
      </div>

      {modal !== null && (
        <NuevaEntradaHistorialModal
          entrada={modal === 'nueva' ? undefined : modal}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
