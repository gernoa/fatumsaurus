'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { X, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { type InversionProduct, type Aportacion, PRODUCT_TYPE_EMOJIS } from '@/lib/inversiones'
import { useUsers } from '@/lib/users'

const TODAY = new Date().toISOString().split('T')[0]

interface Props {
  products: InversionProduct[]
  onSave:   (items: Omit<Aportacion, 'id'>[]) => void
  onClose:  () => void
}

// A row in the modal: single product OR a paired entry (same name+platform, two owners)
type ProductRow =
  | { kind: 'single'; product: InversionProduct }
  | { kind: 'paired'; name: string; platform: string; products: [InversionProduct, InversionProduct] }

export function AportacionModal({ products, onSave, onClose }: Props) {
  const { currentUser, partnerUser } = useUsers()

  const availableUsers = [currentUser, ...(partnerUser ? [partnerUser] : [])]
  const [selectedUsers, setSelectedUsers] = useState<string[]>([currentUser.id])
  const [date,    setDate]    = useState(TODAY)
  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function toggleUser(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.length > 1 ? prev.filter((id) => id !== userId) : prev
        : [...prev, userId]
    )
  }

  const rows = useMemo(() => buildRows(products, selectedUsers), [products, selectedUsers])
  const flatKeys = useMemo(
    () => rows.map((r) => r.kind === 'paired' ? `pair:${r.name}:${r.platform}` : r.product.id),
    [rows]
  )

  const setAmount = useCallback((key: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [key]: value }))
  }, [])

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const next = inputRefs.current[idx + 1]
      if (next) next.focus(); else (e.target as HTMLInputElement).blur()
    }
  }

  const parseAmt = (s: string) => parseFloat(s.replace(',', '.')) || 0
  const total = flatKeys.reduce((s, k) => s + parseAmt(amounts[k] ?? ''), 0)
  const hasAny = total > 0

  function handleSave() {
    if (!hasAny) return
    const items: Omit<Aportacion, 'id'>[] = []

    rows.forEach((row) => {
      if (row.kind === 'single') {
        const key = row.product.id
        const amount = parseAmt(amounts[key] ?? '')
        if (amount > 0) {
          items.push({ productId: row.product.id, userId: row.product.ownerId, amount, date, estado: 'confirmada' })
        }
      } else {
        const key = `pair:${row.name}:${row.platform}`
        const amount = parseAmt(amounts[key] ?? '')
        if (amount > 0) {
          // Same amount → one aportación per product in the pair (one per user)
          row.products.forEach((p) => {
            items.push({ productId: p.id, userId: p.ownerId, amount, date, estado: 'confirmada' })
          })
        }
      }
    })

    onSave(items)
  }

  const rowsByPlatform = useMemo(() => {
    const platforms = Array.from(
      new Set(rows.map((r) => r.kind === 'paired' ? r.platform : r.product.platform))
    ).sort()
    return platforms.map((plat) => ({
      platform: plat,
      rows: rows.filter((r) =>
        r.kind === 'paired' ? r.platform === plat : r.product.platform === plat
      ),
    }))
  }, [rows])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md max-h-[90vh] flex flex-col bg-background rounded-t-[24px] sm:rounded-[20px] shadow-xl">

        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">Registrar aportación</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Date + user chips */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Fecha</label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Para</label>
              <div className="flex gap-2">
                {availableUsers.map((u) => {
                  const on = selectedUsers.includes(u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleUser(u.id)}
                      title={u.name}
                      className={cn(
                        'w-9 h-9 rounded-full text-sm font-bold border-2 transition-all',
                        on
                          ? 'bg-petroleo text-white border-petroleo shadow-sm'
                          : 'bg-secondary text-muted-foreground border-border hover:border-petroleo/40'
                      )}
                    >
                      {u.initial}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Explanation when both users selected */}
          {selectedUsers.length > 1 && (
            <div className="flex items-start gap-2 bg-petroleo/6 border border-petroleo/15 rounded-[10px] px-3.5 py-2.5">
              <Users className="w-3.5 h-3.5 text-petroleo flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-petroleo leading-relaxed">
                Los productos compartidos <span className="font-semibold">×2</span> registran el importe por separado para cada uno — introduce la cantidad una sola vez.
              </p>
            </div>
          )}

          {/* Product list */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Importes
              <span className="ml-1 font-normal normal-case text-muted-foreground/60">(deja vacío si no aportaste)</span>
            </p>

            {rows.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">Sin productos para los usuarios seleccionados.</p>
            )}

            {rowsByPlatform.map(({ platform, rows: pRows }) => (
              <div key={platform}>
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1.5 px-0.5">{platform}</p>
                <div className="space-y-1.5">
                  {pRows.map((row) => {
                    const key      = row.kind === 'paired' ? `pair:${row.name}:${row.platform}` : row.product.id
                    const flatIdx  = flatKeys.indexOf(key)
                    const isPaired = row.kind === 'paired'
                    const emoji    = isPaired ? PRODUCT_TYPE_EMOJIS[row.products[0].type] : PRODUCT_TYPE_EMOJIS[row.product.type]
                    const label    = isPaired ? row.name : row.product.name
                    const ownerInitial = !isPaired && selectedUsers.length > 1
                      ? availableUsers.find((u) => u.id === row.product.ownerId)?.initial ?? ''
                      : ''

                    return (
                      <div key={key} className={cn(
                        'flex items-center gap-2.5 rounded-[10px] border px-3 py-2',
                        isPaired ? 'bg-petroleo/5 border-petroleo/15' : 'bg-card border-border'
                      )}>
                        <span className="text-base flex-shrink-0">{emoji}</span>
                        <p className="flex-1 text-sm font-medium text-foreground truncate min-w-0">
                          {label}
                          {isPaired && (
                            <span className="ml-1.5 text-[10px] font-semibold text-petroleo bg-petroleo/12 px-1.5 py-0.5 rounded-full">×2</span>
                          )}
                          {ownerInitial && (
                            <span className="ml-1.5 text-[10px] font-semibold text-petroleo/70 bg-petroleo/8 px-1.5 py-0.5 rounded-full">{ownerInitial}</span>
                          )}
                        </p>
                        <div className="relative flex-shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">€</span>
                          <input
                            ref={(el) => { inputRefs.current[flatIdx] = el }}
                            type="number" inputMode="decimal" step="0.01" min="0" placeholder="0"
                            value={amounts[key] ?? ''}
                            onChange={(e) => setAmount(key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, flatIdx)}
                            className="w-24 pl-7 pr-2 py-1.5 text-sm font-semibold text-foreground bg-secondary/60 rounded-[8px] border border-border focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo text-right transition"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-petroleo/8 rounded-[12px] border border-petroleo/20">
              <span className="text-sm font-medium text-petroleo">Total aportado</span>
              <span className="text-sm font-bold text-petroleo">{formatCurrency(total)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-2 flex-shrink-0 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!hasAny} className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Guardar aportación
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helper: build row list with pairing logic ────────────────────────────────

function buildRows(products: InversionProduct[], selectedUsers: string[]): ProductRow[] {
  const active = products.filter((p) => p.isActive && selectedUsers.includes(p.ownerId))

  if (selectedUsers.length < 2) {
    return [...active]
      .sort((a, b) => a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name))
      .map((p) => ({ kind: 'single' as const, product: p }))
  }

  const [u1, u2] = selectedUsers
  const rows: ProductRow[] = []
  const paired = new Set<string>()

  const u1Products = active.filter((p) => p.ownerId === u1)
  const u2Products = active.filter((p) => p.ownerId === u2)

  // Products with same name + platform across both users → paired row
  u1Products.forEach((p1) => {
    const p2 = u2Products.find((p) => p.name === p1.name && p.platform === p1.platform)
    if (p2) {
      rows.push({ kind: 'paired', name: p1.name, platform: p1.platform, products: [p1, p2] })
      paired.add(p1.id)
      paired.add(p2.id)
    }
  })

  // Remaining products (not paired) → single rows
  active.forEach((p) => {
    if (!paired.has(p.id)) rows.push({ kind: 'single', product: p })
  })

  return rows.sort((a, b) => {
    const platA = a.kind === 'paired' ? a.platform : a.product.platform
    const platB = b.kind === 'paired' ? b.platform : b.product.platform
    const nameA = a.kind === 'paired' ? a.name : a.product.name
    const nameB = b.kind === 'paired' ? b.name : b.product.name
    return platA.localeCompare(platB) || nameA.localeCompare(nameB)
  })
}
