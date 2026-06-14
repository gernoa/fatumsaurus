'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createEntradaHistorial, updateEntradaHistorial, type EntradaHistorial, type TipoHistorial } from '@/lib/salud'

interface Props {
  entrada?:  EntradaHistorial
  onSaved:   (e: EntradaHistorial) => void
  onClose:   () => void
}

const TIPOS: TipoHistorial[] = ['Consulta', 'Diagnóstico', 'Intervención', 'Analítica', 'Vacuna', 'Otro']

export function NuevaEntradaHistorialModal({ entrada, onSaved, onClose }: Props) {
  const isEdit = !!entrada
  const TODAY  = new Date().toISOString().split('T')[0]

  const [fecha,       setFecha]       = useState(entrada?.fecha       ?? TODAY)
  const [tipo,        setTipo]        = useState<TipoHistorial>(entrada?.tipo ?? 'Consulta')
  const [titulo,      setTitulo]      = useState(entrada?.titulo      ?? '')
  const [descripcion, setDescripcion] = useState(entrada?.descripcion ?? '')
  const [medico,      setMedico]      = useState(entrada?.medico      ?? '')
  const [centro,      setCentro]      = useState(entrada?.centro      ?? '')
  const [etiquetas,   setEtiquetas]   = useState<string[]>(entrada?.etiquetas ?? [])
  const [tagInput,    setTagInput]    = useState('')

  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !etiquetas.includes(t)) {
      setEtiquetas((prev) => [...prev, t])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setEtiquetas((prev) => prev.filter((t) => t !== tag))
  }

  async function handleSave() {
    setErr('')
    if (!titulo.trim()) { setErr('El título es obligatorio'); return }
    if (!fecha)         { setErr('La fecha es obligatoria'); return }

    setSaving(true)
    try {
      const payload = {
        fecha,
        tipo,
        titulo:      titulo.trim(),
        descripcion: descripcion.trim() || null,
        medico:      medico.trim() || null,
        centro:      centro.trim() || null,
        etiquetas,
      }
      if (isEdit) {
        await updateEntradaHistorial(entrada!.id, payload)
        onSaved({ ...entrada!, ...payload })
        toast.success('Entrada actualizada')
      } else {
        const nueva = await createEntradaHistorial(payload)
        onSaved(nueva)
        toast.success('Entrada guardada')
      }
      onClose()
    } catch {
      toast.error('No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm z-[--z-modal-backdrop]" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-[--z-modal] bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)] flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-foreground">{isEdit ? 'Editar entrada' : 'Nueva entrada en el historial'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
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

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Revisión anual con médico de cabecera"
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Médico + centro */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Médico</label>
              <input
                type="text"
                value={medico}
                onChange={(e) => setMedico(e.target.value)}
                placeholder="Dr. García"
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Centro</label>
              <input
                type="text"
                value={centro}
                onChange={(e) => setCentro(e.target.value)}
                placeholder="Hospital La Paz"
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Descripción / resultado</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Diagnóstico, resultado, observaciones..."
              rows={4}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Etiquetas</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="analítica, rodilla..."
                className="flex-1 px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
              <button onClick={addTag} className="px-3 py-2 rounded-[10px] bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {etiquetas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {etiquetas.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-rojo-tierra transition-colors">
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  )
}
