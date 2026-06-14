'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { createEspecialista, type Especialista, type PagadoVia } from '@/lib/salud'

interface Props {
  onSaved:  (e: Especialista) => void
  onClose:  () => void
}

const TIPOS = ['Fisioterapeuta', 'Psicólogo/a', 'Nutricionista', 'Logopeda', 'Ostéopata', 'Acupunturista', 'Otro']

export function NuevoEspecialistaModal({ onSaved, onClose }: Props) {
  const TODAY = new Date().toISOString().split('T')[0]

  // Campos base
  const [nombre,    setNombre]    = useState('')
  const [tipo,      setTipo]      = useState('')
  const [otraTipo,  setOtraTipo]  = useState('')
  const [modalidad, setModalidad] = useState<'bono' | 'por_sesion'>('bono')
  const [duracion,  setDuracion]  = useState('60')
  // Por sesión
  const [precioSes, setPrecioSes] = useState('')
  const [pagadoViaPs, setPagadoViaPs] = useState<PagadoVia>('personal')
  // Primer bono (opcional, solo si modalidad === 'bono')
  const [showBono,  setShowBono]  = useState(false)
  const [sesiones,  setSesiones]  = useState('10')
  const [precio,    setPrecio]    = useState('')
  const [fechaPago, setFechaPago] = useState(TODAY)
  const [pagadoVia, setPagadoVia] = useState<PagadoVia>('personal')

  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const tipoFinal  = tipo === 'Otro' ? otraTipo.trim() : tipo
  const precioNum  = parseFloat(precio.replace(',', '.')) || 0
  const deudaPareja = precioNum / 2

  async function handleSave() {
    setErr('')
    if (!nombre.trim())  { setErr('El nombre es obligatorio'); return }
    if (!tipoFinal)       { setErr('Elige o escribe el tipo'); return }

    setSaving(true)
    try {
      const primerBono = (modalidad === 'bono' && showBono && parseInt(sesiones) > 0 && precioNum > 0)
        ? {
            sesiones_contratadas: parseInt(sesiones),
            precio_total:         precioNum,
            fecha_pago:           fechaPago,
            pagado_via:           pagadoVia,
          }
        : undefined

      const nuevo = await createEspecialista(
        {
          nombre:          nombre.trim(),
          tipo:            tipoFinal,
          modalidad,
          duracion_sesion: parseInt(duracion) || 60,
          precio_sesion:   modalidad === 'por_sesion' && precioSes
            ? parseFloat(precioSes.replace(',', '.'))
            : null,
        },
        primerBono
      )
      onSaved(nuevo)
      toast.success('Especialista añadido' + (primerBono ? ' y bono registrado en Finanzas' : ''))
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
      <div className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-[--z-modal] bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)] flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-foreground">Nuevo especialista</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Elena Martín"
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipo *</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            >
              <option value="">Selecciona...</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {tipo === 'Otro' && (
              <input
                type="text"
                value={otraTipo}
                onChange={(e) => setOtraTipo(e.target.value)}
                placeholder="Tipo de especialista"
                className="mt-2 w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
              />
            )}
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Modalidad de pago</label>
            <div className="flex gap-2">
              {(['bono', 'por_sesion'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModalidad(m)}
                  className={cn(
                    'flex-1 py-2 rounded-[10px] text-sm font-medium transition-colors',
                    modalidad === m
                      ? 'bg-petroleo text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m === 'bono' ? 'Bono de sesiones' : 'Pago por sesión'}
                </button>
              ))}
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Duración estándar por sesión (min)</label>
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              min={15}
              step={15}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
            />
          </div>

          {/* Por sesión: precio */}
          {modalidad === 'por_sesion' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Precio por sesión (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={precioSes}
                  onChange={(e) => setPrecioSes(e.target.value)}
                  placeholder="65,00"
                  className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
                />
              </div>
              {parseFloat(precioSes.replace(',', '.')) > 0 && (
                <div className="glass-subtle rounded-[12px] p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Pagar cada sesión con</p>
                  <div className="flex gap-2">
                    {([
                      { id: 'personal', label: 'Mi cuenta' },
                      { id: 'conjunta', label: 'Cuenta conjunta' },
                    ] as const).map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setPagadoViaPs(id)}
                        className={cn(
                          'flex-1 py-2 rounded-[10px] text-sm font-medium transition-colors',
                          pagadoViaPs === id
                            ? 'bg-petroleo text-white'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Cada sesión se comparte 50-50 → tu pareja te deberá {formatCurrency(parseFloat(precioSes.replace(',', '.')) / 2)} por sesión
                  </p>
                </div>
              )}
            </>
          )}

          {/* Bono: primer bono opcional */}
          {modalidad === 'bono' && (
            <div className="border border-border/50 rounded-[12px] overflow-hidden">
              <button
                onClick={() => setShowBono((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-secondary/30 transition-colors"
              >
                <span className="font-medium text-foreground">Añadir primer bono</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {showBono ? 'Ocultar' : 'Opcional'}
                  {showBono ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {showBono && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Nº sesiones</label>
                      <input
                        type="number"
                        value={sesiones}
                        onChange={(e) => setSesiones(e.target.value)}
                        min={1}
                        className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Precio total (€)</label>
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
                    <label className="block text-xs font-medium text-foreground mb-1">Fecha de pago</label>
                    <input
                      type="date"
                      value={fechaPago}
                      onChange={(e) => setFechaPago(e.target.value)}
                      className="w-full px-3 py-2 rounded-[10px] border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-petroleo/40"
                    />
                  </div>
                  <div className="flex gap-2">
                    {([
                      { id: 'personal', label: 'Mi cuenta' },
                      { id: 'conjunta', label: 'Conjunta' },
                    ] as const).map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setPagadoVia(id)}
                        className={cn(
                          'flex-1 py-1.5 rounded-[8px] text-xs font-medium transition-colors',
                          pagadoVia === id
                            ? 'bg-petroleo text-white'
                            : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {precioNum > 0 && (
                    <div className="glass-subtle rounded-[10px] p-2.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tu pareja te deberá</span>
                      <span className="font-semibold text-teal-brand">{formatCurrency(deudaPareja)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  )
}
