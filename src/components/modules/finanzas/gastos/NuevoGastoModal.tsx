'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { GASTO_CATEGORIES, type Gasto, type GastoCategory } from '@/lib/gasto'
import { APP_USERS, CONJUNTA_MEMBER_IDS, CURRENT_USER_ID } from '@/lib/users'

interface Props {
  onSave: (gasto: Gasto) => void
  onClose: () => void
}

const TODAY = '2026-06-13'

const EXTERNAL_USERS = APP_USERS.filter((u) => !CONJUNTA_MEMBER_IDS.includes(u.id))

export function NuevoGastoModal({ onSave, onClose }: Props) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GastoCategory | null>(null)
  const [date, setDate] = useState(TODAY)
  const [notes, setNotes] = useState('')
  const [paidVia, setPaidVia] = useState<'personal' | 'conjunta'>('personal')
  const [thirdParty, setThirdParty] = useState<{ userId: string; amount: string }[]>([])
  const [error, setError] = useState('')

  const amountNum = parseFloat(amount) || 0
  const tpTotal = thirdParty.reduce((s, tp) => s + (parseFloat(tp.amount) || 0), 0)
  const netConjunta = amountNum - tpTotal
  const unusedExternal = EXTERNAL_USERS.filter(
    (u) => !thirdParty.some((tp) => tp.userId === u.id)
  )

  function addThirdParty() {
    if (unusedExternal.length === 0) return
    setThirdParty((prev) => [...prev, { userId: unusedExternal[0].id, amount: '' }])
  }

  function removeThirdParty(i: number) {
    setThirdParty((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateThirdParty(i: number, field: 'userId' | 'amount', value: string) {
    setThirdParty((prev) => prev.map((tp, idx) => idx === i ? { ...tp, [field]: value } : tp))
  }

  const handleSave = () => {
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Introduce un importe válido'); return
    }
    if (!description.trim()) { setError('Añade una descripción'); return }
    if (!category) { setError('Selecciona una categoría'); return }
    if (paidVia === 'conjunta' && tpTotal > 0 && netConjunta < 0) {
      setError('La parte de terceros no puede superar el total'); return
    }

    onSave({
      id: `g-${Date.now()}`,
      description: description.trim(),
      amount: Math.round(amountNum * 100) / 100,
      category,
      date,
      paidById: CURRENT_USER_ID,
      paidVia,
      notes: notes.trim() || undefined,
      thirdParty: thirdParty
        .filter((tp) => parseFloat(tp.amount) > 0)
        .map((tp) => ({
          userId: tp.userId,
          amount: Math.round(parseFloat(tp.amount) * 100) / 100,
        })),
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

        <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
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

          {/* Paid via toggle */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Pagado con
            </label>
            <div className="flex gap-1 p-1 bg-secondary rounded-[10px]">
              {(['personal', 'conjunta'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setPaidVia(v)
                    if (v === 'personal') setThirdParty([])
                  }}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium rounded-[8px] transition-colors',
                    paidVia === v
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {v === 'personal' ? 'Mi cuenta' : 'Cuenta conjunta'}
                </button>
              ))}
            </div>
          </div>

          {/* Third-party section — conjunta only */}
          {paidVia === 'conjunta' && (
            <div className="bg-secondary/70 rounded-[12px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Parte de terceros
                </p>
                {unusedExternal.length > 0 && (
                  <button
                    onClick={addThirdParty}
                    className="flex items-center gap-1 text-xs font-medium text-petroleo hover:text-teal-brand transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir persona
                  </button>
                )}
              </div>

              {thirdParty.length === 0 ? (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ¿Parte del gasto es para alguien de fuera de la cuenta?
                  Añade su porción — el neto lo asume la cuenta conjunta.
                </p>
              ) : (
                <div className="space-y-2">
                  {thirdParty.map((tp, i) => {
                    const user = APP_USERS.find((u) => u.id === tp.userId)
                    const availableForSlot = EXTERNAL_USERS.filter(
                      (u) => u.id === tp.userId || !thirdParty.some((t, j) => j !== i && t.userId === u.id)
                    )
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-petroleo text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                          {user?.initial ?? '?'}
                        </div>
                        {availableForSlot.length > 1 ? (
                          <select
                            value={tp.userId}
                            onChange={(e) => updateThirdParty(i, 'userId', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-sm text-foreground bg-card rounded-[8px] border border-border focus:outline-none focus:border-ring"
                          >
                            {availableForSlot.map((u) => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="flex-1 text-sm font-medium text-foreground">{user?.name}</span>
                        )}
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            value={tp.amount}
                            onChange={(e) => updateThirdParty(i, 'amount', e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 text-sm font-semibold text-foreground bg-card rounded-[8px] border border-border focus:outline-none focus:border-ring"
                          />
                        </div>
                        <button
                          onClick={() => removeThirdParty(i)}
                          className="p-1 text-muted-foreground hover:text-rojo-tierra transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {amountNum > 0 && tpTotal > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Neto cuenta conjunta</span>
                  <span className={cn(
                    'text-sm font-bold',
                    netConjunta < 0 ? 'text-rojo-tierra' : 'text-petroleo'
                  )}>
                    {formatCurrency(Math.max(0, netConjunta))}
                  </span>
                </div>
              )}
            </div>
          )}

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
