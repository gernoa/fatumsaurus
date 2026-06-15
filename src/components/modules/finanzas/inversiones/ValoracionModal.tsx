'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { X, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { type InversionProduct, type Valoracion, type ProductoStats, PRODUCT_TYPE_EMOJIS } from '@/lib/inversiones'
import { useUsers } from '@/lib/users'

const TODAY = new Date().toISOString().split('T')[0]

interface Props {
  products:           InversionProduct[]
  statsByProductUser: Map<string, ProductoStats>
  onSave:             (items: Omit<Valoracion, 'id'>[]) => void
  onClose:            () => void
}

type ProductRow =
  | { kind: 'single'; product: InversionProduct }
  | { kind: 'paired'; name: string; platform: string; products: [InversionProduct, InversionProduct] }

export function ValoracionModal({ products, statsByProductUser, onSave, onClose }: Props) {
  const { currentUser, partnerUser } = useUsers()

  const availableUsers = [currentUser, ...(partnerUser ? [partnerUser] : [])]
  const [selectedUsers, setSelectedUsers] = useState<string[]>([currentUser.id])
  const [date,   setDate]   = useState(TODAY)
  const [values, setValues] = useState<Record<string, string>>({})
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

  const setValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const next = inputRefs.current[idx + 1]
      if (next) next.focus(); else (e.target as HTMLInputElement).blur()
    }
  }

  const parseVal = (s: string) => parseFloat(s.replace(',', '.')) || 0
  const hasAny   = flatKeys.some((k) => parseVal(values[k] ?? '') > 0)

  function handleSave() {
    if (!hasAny) return
    const items: Omit<Valoracion, 'id'>[] = []

    rows.forEach((row) => {
      if (row.kind === 'single') {
        const key   = row.product.id
        const value = parseVal(values[key] ?? '')
        if (value > 0) {
          items.push({ productId: row.product.id, userId: row.product.ownerId, value, date })
        }
      } else {
        const key   = `pair:${row.name}:${row.platform}`
        const value = parseVal(values[key] ?? '')
        if (value > 0) {
          // Same market value → one valoración per product in the pair
          row.products.forEach((p) => {
            items.push({ productId: p.id, userId: p.ownerId, value, date })
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
      <div className="relative z-10 w-full sm:max-w-md max-h-[90vh] flex flex-col glass rounded-t-[24px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.25)]">

        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">Actualizar valoración</h2>
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

          {/* Explanation when both selected */}
          {selectedUsers.length > 1 && (
            <div className="flex items-start gap-2 bg-petroleo/6 border border-petroleo/15 rounded-[10px] px-3.5 py-2.5">
              <Users className="w-3.5 h-3.5 text-petroleo flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-petroleo leading-relaxed">
                Los productos compartidos <span className="font-semibold">×2</span> se actualizan con el mismo valor de mercado para los dos usuarios.
              </p>
            </div>
          )}

          {/* Product list */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Valor actual
              <span className="ml-1 font-normal normal-case text-muted-foreground/60">(deja en blanco si no ha cambiado)</span>
            </p>

            {rows.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">Sin productos para los usuarios seleccionados.</p>
            )}

            {rowsByPlatform.map(({ platform, rows: pRows }) => (
              <div key={platform}>
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-1.5 px-0.5">{platform}</p>
                <div className="space-y-1.5">
                  {pRows.map((row) => {
                    const key     = row.kind === 'paired' ? `pair:${row.name}:${row.platform}` : row.product.id
                    const flatIdx = flatKeys.indexOf(key)
                    const isPaired = row.kind === 'paired'
                    const emoji   = isPaired ? PRODUCT_TYPE_EMOJIS[row.products[0].type] : PRODUCT_TYPE_EMOJIS[row.product.type]
                    const label   = isPaired ? row.name : row.product.name

                    // Stats: for paired, use the first product's stats (same asset, same value)
                    const statsKey = isPaired
                      ? `${row.products[0].id}:${row.products[0].ownerId}`
                      : `${row.product.id}:${row.product.ownerId}`
                    const stats   = statsByProductUser.get(statsKey)
                    const prev    = stats?.valorActual ?? null
                    const newVal  = parseVal(values[key] ?? '')
                    const diff    = prev !== null && newVal > 0 ? newVal - prev : null

                    const ownerInitial = !isPaired && selectedUsers.length > 1
                      ? availableUsers.find((u) => u.id === row.product.ownerId)?.initial ?? ''
                      : ''

                    return (
                      <div key={key} className={cn(
                        'flex items-center gap-2.5 rounded-[10px] border px-3 py-2',
                        isPaired ? 'bg-petroleo/5 border-petroleo/15' : 'bg-card border-border'
                      )}>
                        <span className="text-base flex-shrink-0">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {label}
                            {isPaired && (
                              <span className="ml-1.5 text-[10px] font-semibold text-petroleo bg-petroleo/12 px-1.5 py-0.5 rounded-full">×2</span>
                            )}
                            {ownerInitial && (
                              <span className="ml-1.5 text-[10px] font-semibold text-petroleo/70 bg-petroleo/8 px-1.5 py-0.5 rounded-full">{ownerInitial}</span>
                            )}
                          </p>
                          {prev !== null && (
                            <p className="text-[10px] text-muted-foreground">Anterior: {formatCurrency(prev)}</p>
                          )}
                        </div>

                        {/* Diff indicator */}
                        {diff !== null && (
                          <span className={cn(
                            'flex items-center gap-0.5 text-[10px] font-semibold flex-shrink-0',
                            diff > 0 ? 'text-teal-brand' : diff < 0 ? 'text-rojo-tierra' : 'text-muted-foreground'
                          )}>
                            {diff > 0 ? <TrendingUp className="w-3 h-3" />
                              : diff < 0 ? <TrendingDown className="w-3 h-3" />
                              : <Minus className="w-3 h-3" />}
                            {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                          </span>
                        )}

                        <div className="relative flex-shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">€</span>
                          <input
                            ref={(el) => { inputRefs.current[flatIdx] = el }}
                            type="number" inputMode="decimal" step="0.01" min="0"
                            placeholder={prev !== null ? prev.toFixed(2) : '0'}
                            value={values[key] ?? ''}
                            onChange={(e) => setValue(key, e.target.value)}
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
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-2 flex-shrink-0 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!hasAny} className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Guardar valoración
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helper: same pairing logic as AportacionModal ────────────────────────────

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

  u1Products.forEach((p1) => {
    const p2 = u2Products.find((p) => p.name === p1.name && p.platform === p1.platform)
    if (p2) {
      rows.push({ kind: 'paired', name: p1.name, platform: p1.platform, products: [p1, p2] })
      paired.add(p1.id)
      paired.add(p2.id)
    }
  })

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
