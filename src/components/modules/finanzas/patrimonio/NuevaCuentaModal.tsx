'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { ACCOUNT_EMOJIS, type AccountType, type PatrimonioAccount } from '@/lib/patrimonio'
import { CURRENT_USER_ID } from '@/lib/users'

interface Props {
  initialAccount?: PatrimonioAccount
  onSave: (account: Omit<PatrimonioAccount, 'id'>) => void
  onClose: () => void
}

const TODAY = '2026-06-13'

export function NuevaCuentaModal({ initialAccount, onSave, onClose }: Props) {
  const isEdit = !!initialAccount

  const [name, setName] = useState(initialAccount?.name ?? '')
  const [bank, setBank] = useState(initialAccount?.bank ?? '')
  const [type, setType] = useState<AccountType>(initialAccount?.type ?? 'personal')
  const [emoji, setEmoji] = useState(initialAccount?.emoji ?? '🏦')
  const [balance, setBalance] = useState(initialAccount?.balance.toString() ?? '0')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) { setError('Ponle un nombre a la cuenta'); return }
    const balanceNum = parseFloat(balance.replace(',', '.')) || 0

    onSave({
      ownerId: type === 'conjunta' ? 'shared' : CURRENT_USER_ID,
      name: name.trim(),
      bank: bank.trim() || undefined,
      type,
      emoji,
      balance: Math.round(balanceNum * 100) / 100,
      lastUpdated: TODAY,
      isActive: true,
    })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-noche-marina/40 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-modal-backdrop)' }}
        onClick={onClose}
      />

      <div
        className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm bg-card rounded-t-[20px] sm:rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.2)]"
        style={{ zIndex: 'var(--z-modal)' }}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Editar cuenta' : 'Nueva cuenta'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Tipo de cuenta
            </label>
            <div className="flex gap-1 p-1 bg-secondary rounded-[10px]">
              {(['personal', 'conjunta'] as AccountType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium rounded-[8px] transition-colors capitalize',
                    type === t
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'personal' ? 'Personal' : 'Conjunta'}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Icono
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'w-10 h-10 rounded-[8px] text-xl transition-colors',
                    emoji === e
                      ? 'bg-petroleo/15 ring-2 ring-petroleo'
                      : 'bg-secondary hover:bg-border'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Nombre
            </label>
            <input
              type="text"
              placeholder="BBVA corriente, Openbank ahorro..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!isEdit}
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Bank (optional) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Banco <span className="font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="BBVA, Openbank, Revolut..."
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Balance */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Saldo actual
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">€</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                placeholder="0,00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-lg font-bold text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rojo-tierra font-medium">{error}</p>}
        </div>

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
            {isEdit ? 'Guardar cambios' : 'Añadir cuenta'}
          </button>
        </div>
      </div>
    </>
  )
}
