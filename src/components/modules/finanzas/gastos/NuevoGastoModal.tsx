'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GASTO_CATEGORIES, type GastoPersonal, type GastoCategory } from '@/lib/mock-gastos'

interface Props {
  onSave: (gasto: GastoPersonal) => void
  onClose: () => void
}

const TODAY = '2026-06-13' // mock today

export function NuevoGastoModal({ onSave, onClose }: Props) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GastoCategory | null>(null)
  const [date, setDate] = useState(TODAY)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount))) { setError('Introduce un importe válido'); return }
    if (!description.trim()) { setError('Añade una descripción'); return }
    if (!category) { setError('Selecciona una categoría'); return }

    onSave({
      id: `g-${Date.now()}`,
      description: description.trim(),
      amount: Math.round(parseFloat(amount) * 100) / 100,
      category,
      date,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-modal-backdrop)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)]"
        style={{ zIndex: 'var(--z-modal)' }}
      >
        {/* Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Nuevo gasto</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Importe
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">€</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-foreground bg-secondary rounded-[12px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/40"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Descripción
            </label>
            <input
              type="text"
              placeholder="Supermercado, gasolina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {GASTO_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    'px-3 py-2 rounded-[8px] text-sm font-medium text-left transition-colors',
                    category === cat.slug
                      ? 'ring-2 ring-petroleo ' + cat.colorClass
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none"
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Notas <span className="font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/50 resize-none"
            />
          </div>

          {error && <p className="text-xs text-rojo-tierra font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-secondary hover:bg-border rounded-[10px] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand rounded-[10px] transition-colors"
          >
            Guardar gasto
          </button>
        </div>
      </div>
    </>
  )
}
