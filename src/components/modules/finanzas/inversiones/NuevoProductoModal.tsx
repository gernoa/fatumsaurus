'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_EMOJIS,
  type InversionProduct,
  type ProductType,
} from '@/lib/inversiones'
import { CURRENT_USER_ID } from '@/lib/users'

const TIPOS: ProductType[] = ['fondo', 'etf', 'accion', 'cripto', 'plan_pensiones', 'otro']
const DIVISAS = ['EUR', 'USD', 'GBP', 'CHF', 'BTC', 'ETH']

interface Props {
  initial?: InversionProduct
  onSave:  (p: Omit<InversionProduct, 'id'>) => void
  onClose: () => void
}

export function NuevoProductoModal({ initial, onSave, onClose }: Props) {
  const [name,     setName]     = useState(initial?.name ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? '')
  const [type,     setType]     = useState<ProductType>(initial?.type ?? 'fondo')
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isValid = name.trim().length > 0 && platform.trim().length > 0

  function handleSave() {
    if (!isValid) return
    onSave({
      name:     name.trim(),
      platform: platform.trim(),
      type,
      currency,
      ownerId:  initial?.ownerId ?? CURRENT_USER_ID,
      isActive: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-[24px] sm:rounded-[20px] shadow-xl">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">
            {initial ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Nombre
            </label>
            <input
              type="text"
              placeholder="ej: Cartera indexada"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
            />
          </div>

          {/* Plataforma */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Plataforma
            </label>
            <input
              type="text"
              placeholder="ej: Indexa Capital, Degiro, Coinbase…"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Tipo
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                    type === t
                      ? 'bg-petroleo text-white border-petroleo'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:border-petroleo/40'
                  )}
                >
                  <span>{PRODUCT_TYPE_EMOJIS[t]}</span>
                  {PRODUCT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Divisa */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Divisa
            </label>
            <div className="flex flex-wrap gap-2">
              {DIVISAS.map((d) => (
                <button
                  key={d}
                  onClick={() => setCurrency(d)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                    currency === d
                      ? 'bg-petroleo text-white border-petroleo'
                      : 'bg-secondary/40 text-muted-foreground border-border hover:border-petroleo/40'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {initial ? 'Guardar cambios' : 'Añadir producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
