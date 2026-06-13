'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { type InversionProduct, type Aportacion, PRODUCT_TYPE_EMOJIS } from '@/lib/inversiones'
import { getUser, APP_USERS, CURRENT_USER_ID } from '@/lib/users'

type Scope = 'solo-yo' | 'solo-pareja' | 'los-dos'

const TODAY = '2026-06-13'
const PARTNER_ID = APP_USERS.find((u) => u.id !== CURRENT_USER_ID && u.id !== 'madre')?.id ?? 'javier'

interface Props {
  products:   InversionProduct[]
  onSave:     (items: Omit<Aportacion, 'id'>[]) => void
  onClose:    () => void
}

export function AportacionModal({ products, onSave, onClose }: Props) {
  const [date,   setDate]   = useState(TODAY)
  const [scope,  setScope]  = useState<Scope>('solo-yo')
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Products shown depend on scope
  const visibleProducts = products.filter((p) => {
    if (scope === 'solo-yo')     return p.ownerId === CURRENT_USER_ID
    if (scope === 'solo-pareja') return p.ownerId === PARTNER_ID
    return true  // los-dos: all
  })

  const setAmount = useCallback((productId: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [productId]: value }))
  }, [])

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const next = inputRefs.current[idx + 1]
      if (next) next.focus()
    }
  }

  const parseAmt  = (s: string) => parseFloat(s.replace(',', '.')) || 0
  const total     = visibleProducts.reduce((s, p) => s + parseAmt(amounts[p.id] ?? ''), 0)
  const hasAny    = total > 0

  function handleSave() {
    if (!hasAny) return
    const items: Omit<Aportacion, 'id'>[] = []

    visibleProducts.forEach((p) => {
      const amount = parseAmt(amounts[p.id] ?? '')
      if (amount <= 0) return

      const userIds: string[] = scope === 'solo-yo'
        ? [CURRENT_USER_ID]
        : scope === 'solo-pareja'
        ? [PARTNER_ID]
        : [p.ownerId]  // each product goes to its own owner

      userIds.forEach((userId) => {
        items.push({ productId: p.id, userId, amount, date })
      })
    })

    onSave(items)
  }

  const scopeOptions: { value: Scope; label: string }[] = [
    { value: 'solo-yo',     label: `Solo ${getUser(CURRENT_USER_ID).name}` },
    { value: 'solo-pareja', label: `Solo ${getUser(PARTNER_ID).name}` },
    { value: 'los-dos',     label: 'Los dos' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md max-h-[90vh] flex flex-col bg-background rounded-t-[24px] sm:rounded-[20px] shadow-xl">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">Registrar aportación</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Date + Scope */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Para</label>
              <div className="flex flex-col gap-1">
                {scopeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setScope(opt.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors text-left',
                      scope === opt.value
                        ? 'bg-petroleo text-white'
                        : 'bg-secondary/40 text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products list */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Importes aportados
              <span className="ml-1 font-normal normal-case">(deja en blanco o pon 0 si no has aportado)</span>
            </label>
            <div className="space-y-2">
              {visibleProducts.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No hay productos para este filtro.
                </p>
              )}
              {visibleProducts.map((p, idx) => {
                const owner = getUser(p.ownerId)
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 bg-card rounded-[10px] border border-border px-3 py-2.5"
                  >
                    <span className="text-lg flex-shrink-0">{PRODUCT_TYPE_EMOJIS[p.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.platform}
                        {scope === 'los-dos' && (
                          <span className="ml-1 opacity-60">· {owner.name}</span>
                        )}
                      </p>
                    </div>
                    <div className="relative flex-shrink-0 flex items-center">
                      <span className="absolute left-2.5 text-xs text-muted-foreground pointer-events-none">€</span>
                      <input
                        ref={(el) => { inputRefs.current[idx] = el }}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={amounts[p.id] ?? ''}
                        onChange={(e) => setAmount(p.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-24 pl-7 pr-2 py-1.5 text-sm font-semibold text-foreground bg-secondary/60 rounded-[8px] border border-border focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition text-right"
                      />
                    </div>
                    {idx < visibleProducts.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-petroleo/8 rounded-[12px] border border-petroleo/20">
              <span className="text-sm font-medium text-petroleo">Total aportado</span>
              <span className="text-sm font-bold text-petroleo">{formatCurrency(total)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5 pt-2 flex-shrink-0 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasAny}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Guardar aportación
          </button>
        </div>
      </div>
    </div>
  )
}
