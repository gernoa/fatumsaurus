'use client'

import { useState, useEffect } from 'react'
import { X, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CYCLE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  DEFAULT_COLORS,
  advanceNextDate,
  type BillingCycle,
  type SuscripcionCategory,
  type Suscripcion,
} from '@/lib/suscripciones'
import { useSuscripciones } from '@/contexts/suscripcionesContext'
import { toast } from 'sonner'

const TODAY = new Date().toISOString().split('T')[0]

const CYCLES: BillingCycle[]           = ['monthly', 'yearly', 'quarterly', 'weekly']
const CATEGORIES: SuscripcionCategory[] = [
  'streaming', 'musica', 'software', 'nube', 'juegos', 'fitness', 'noticias', 'educacion', 'trabajo', 'otro',
]

const QUICK_ICONS = ['🎬', '🎵', '💻', '☁️', '🎮', '🏋️', '📰', '📚', '💼', '📦', '🏠', '🎯', '🔒', '📊', '🗓️']

interface Props {
  initial?: Suscripcion
  onClose:  () => void
}

export function SuscripcionModal({ initial, onClose }: Props) {
  const { add, update } = useSuscripciones()
  const isEditing = !!initial

  const [name,     setName]     = useState(initial?.name     ?? '')
  const [category, setCategory] = useState<SuscripcionCategory>(initial?.category ?? 'streaming')
  const [amount,   setAmount]   = useState(initial?.amount.toString() ?? '')
  const [cycle,    setCycle]    = useState<BillingCycle>(initial?.cycle ?? 'monthly')
  const [nextDate, setNextDate] = useState(initial?.nextDate ?? TODAY)
  const [icon,     setIcon]     = useState(initial?.icon   ?? '📦')
  const [color,    setColor]    = useState(initial?.color  ?? DEFAULT_COLORS['otro'])
  const [shared,   setShared]   = useState(initial?.shared ?? false)
  const [url,      setUrl]      = useState(initial?.url    ?? '')
  const [notes,    setNotes]    = useState(initial?.notes  ?? '')

  // Sync icon/color when category changes (only for new)
  useEffect(() => {
    if (!isEditing) {
      setIcon(CATEGORY_EMOJIS[category])
      setColor(DEFAULT_COLORS[category])
    }
  }, [category, isEditing])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const amountNum = parseFloat(amount.replace(',', '.')) || 0
  const isValid   = name.trim().length > 0 && amountNum > 0

  function handleSave() {
    if (!isValid) return
    const data: Omit<Suscripcion, 'id'> = {
      name:      name.trim(),
      category,
      amount:    amountNum,
      cycle,
      nextDate,
      startDate: initial?.startDate ?? TODAY,
      color,
      icon,
      shared,
      url:    url.trim() || undefined,
      notes:  notes.trim() || undefined,
      active: initial?.active ?? true,
    }
    if (isEditing) {
      update(initial!.id, data)
      toast.success('Suscripción actualizada')
    } else {
      add(data)
      toast.success('Suscripción añadida')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md max-h-[92vh] flex flex-col glass rounded-t-[24px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.25)]">

        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? 'Editar suscripción' : 'Nueva suscripción'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Icon picker + name */}
          <div className="flex gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Icono</label>
              <div className="grid grid-cols-5 gap-1 bg-secondary/40 rounded-[10px] p-1.5 w-[110px]">
                {QUICK_ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={cn(
                      'w-8 h-8 rounded-[7px] text-base flex items-center justify-center transition-colors',
                      icon === ic ? 'bg-petroleo/15 ring-1 ring-petroleo/40' : 'hover:bg-secondary'
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Nombre</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="ej: Netflix, iCloud…" autoFocus
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
              />

              {/* Color swatches */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.values(DEFAULT_COLORS).map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-transform',
                      color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors border',
                    category === cat
                      ? 'bg-petroleo text-white border-petroleo'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:border-petroleo/40'
                  )}
                >
                  {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Amount + cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Importe</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">€</span>
                <input
                  type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-7 pr-3 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Ciclo</label>
              <div className="grid grid-cols-2 gap-1">
                {CYCLES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCycle(c)}
                    className={cn(
                      'py-2 text-xs font-medium rounded-[8px] transition-colors border',
                      cycle === c ? 'bg-petroleo text-white border-petroleo' : 'bg-secondary/40 text-muted-foreground border-border hover:border-petroleo/40'
                    )}
                  >
                    {CYCLE_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Next date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Próxima renovación</label>
            <input
              type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30 transition"
            />
          </div>

          {/* Shared toggle */}
          <button
            onClick={() => setShared((v) => !v)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border transition-colors text-left',
              shared ? 'bg-petroleo/8 border-petroleo/20' : 'bg-secondary/40 border-transparent hover:border-border'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors',
              shared ? 'bg-petroleo text-white' : 'bg-border text-muted-foreground'
            )}>
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{shared ? 'Suscripción compartida' : 'Solo mía'}</p>
              <p className="text-[11px] text-muted-foreground">
                {shared ? 'Se divide el coste entre los dos' : 'Solo aparece en tu resumen'}
              </p>
            </div>
            <div className={cn(
              'w-10 h-5 rounded-full transition-colors flex-shrink-0 relative',
              shared ? 'bg-petroleo' : 'bg-border'
            )}>
              <div className={cn(
                'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                shared ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </div>
          </button>

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Enlace (opcional)</label>
            <input
              type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Notas (opcional)</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={2} placeholder="Plan familiar, cuenta compartida…"
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 resize-none transition"
            />
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-2 flex-shrink-0 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? 'Guardar cambios' : 'Añadir suscripción'}
          </button>
        </div>
      </div>
    </div>
  )
}
