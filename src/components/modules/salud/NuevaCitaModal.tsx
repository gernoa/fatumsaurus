'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createCita, updateCita, type Cita } from '@/lib/salud'

type EstadoCita = 'pendiente' | 'realizada' | 'cancelada'

interface Props {
  cita?:    Cita
  onSaved:  (cita: Cita) => void
  onClose:  () => void
}

const ESPECIALIDADES = [
  'Medicina general', 'Fisioterapia', 'Psicología', 'Nutrición',
  'Dermatología', 'Oftalmología', 'Odontología', 'Ginecología',
  'Traumatología', 'Cardiología', 'Endocrinología', 'Neurología',
  'Reumatología', 'Otorrinolaringología', 'Urología', 'Otra',
]

export function NuevaCitaModal({ cita, onSaved, onClose }: Props) {
  const isEdit = !!cita
  const TODAY  = new Date().toISOString().split('T')[0]

  const [fecha,        setFecha]        = useState(cita?.fecha ?? TODAY)
  const [hora,         setHora]         = useState(cita?.hora?.slice(0, 5) ?? '10:00')
  const [especialidad, setEspecialidad] = useState(cita?.especialidad ?? '')
  const [otraEsp,      setOtraEsp]      = useState('')
  const [medico,       setMedico]       = useState(cita?.medico ?? '')
  const [centro,       setCentro]       = useState(cita?.centro ?? '')
  const [estado,       setEstado]       = useState<EstadoCita>(cita?.estado ?? 'pendiente')
  const [notas,        setNotas]        = useState(cita?.notas ?? '')
  const [resultado,    setResultado]    = useState(cita?.resultado ?? '')
  const [saving,       setSaving]       = useState(false)
  const [err,          setErr]          = useState('')

  const esp = especialidad === 'Otra' ? otraEsp.trim() : especialidad

  async function handleSave() {
    setErr('')
    if (!esp)   { setErr('Elige o escribe una especialidad'); return }
    if (!fecha) { setErr('La fecha es obligatoria'); return }
    if (!hora)  { setErr('La hora es obligatoria'); return }

    setSaving(true)
    try {
      const payload = {
        fecha,
        hora:        hora + ':00',
        especialidad: esp,
        medico:       medico.trim() || null,
        centro:       centro.trim() || null,
        estado,
        notas:        notas.trim() || null,
        resultado:    resultado.trim() || null,
      }
      if (isEdit) {
        await updateCita(cita!.id, payload)
        onSaved({ ...cita!, ...payload })
        toast.success('Cita actualizada')
      } else {
        const nueva = await createCita(payload)
        onSaved(nueva)
        toast.success('Cita guardada')
      }
      onClose()
    } catch {
      toast.error('No se pudo guardar la cita')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm z-[--z-modal-backdrop]" onClick={onClose} />
      <div className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[--z-modal] bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)] flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-foreground">{isEdit ? 'Editar cita' : 'Nueva cita'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Especialidad */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Especialidad *</label>
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            >
              <option value="">Selecciona...</option>
              {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {especialidad === 'Otra' && (
              <input
                type="text"
                value={otraEsp}
                onChange={(e) => setOtraEsp(e.target.value)}
                placeholder="Escribe la especialidad"
                className="mt-2 w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            )}
          </div>

          {/* Fecha + hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fecha *</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Hora *</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          </div>

          {/* Médico */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Médico / especialista</label>
            <input
              type="text"
              value={medico}
              onChange={(e) => setMedico(e.target.value)}
              placeholder="Ej: Dr. García"
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Centro */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Centro / clínica</label>
            <input
              type="text"
              value={centro}
              onChange={(e) => setCentro(e.target.value)}
              placeholder="Ej: Hospital La Paz"
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
            <div className="flex gap-2">
              {(['pendiente', 'realizada', 'cancelada'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEstado(e)}
                  className={cn(
                    'flex-1 py-1.5 rounded-[8px] text-sm font-medium capitalize transition-colors',
                    estado === e
                      ? 'bg-petroleo text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas previas a la cita..."
              rows={2}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Resultado (solo si realizada) */}
          {estado === 'realizada' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Resultado</label>
              <textarea
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                placeholder="Diagnóstico, indicaciones, próximos pasos..."
                rows={3}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            </div>
          )}

          {err && <p className="text-sm text-rojo-tierra">{err}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-[10px] bg-petroleo text-white text-sm font-medium hover:bg-teal-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar cita'}
          </button>
        </div>
      </div>
    </>
  )
}
