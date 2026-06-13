'use client'

import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCOUNT_EMOJIS, type AccountType, type PatrimonioAccount } from '@/lib/patrimonio'
import { useUsers } from '@/lib/users'

interface Props {
  initialAccount?: PatrimonioAccount
  onSave: (account: Omit<PatrimonioAccount, 'id'>) => void
  onClose: () => void
}

export function NuevaCuentaModal({ initialAccount, onSave, onClose }: Props) {
  const { currentUser, otherUsers } = useUsers()
  const isEdit = !!initialAccount
  const TODAY = new Date().toISOString().split('T')[0]

  const [name, setName] = useState(initialAccount?.name ?? '')
  const [bank, setBank] = useState(initialAccount?.bank ?? '')
  const [type, setType] = useState<AccountType>(initialAccount?.type ?? 'personal')
  const [emoji, setEmoji] = useState(initialAccount?.emoji ?? '🏦')
  const [balance, setBalance] = useState(initialAccount?.balance.toString() ?? '0')
  // For conjunta: participantIds always includes current user; others are togglable
  const [extraParticipants, setExtraParticipants] = useState<string[]>(
    (initialAccount?.participantIds ?? []).filter((id) => id !== currentUser.id)
  )
  const [error, setError] = useState('')

  function toggleParticipant(userId: string) {
    setExtraParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSave = () => {
    if (!name.trim()) { setError('Ponle un nombre a la cuenta'); return }
    if (type === 'conjunta' && extraParticipants.length === 0) {
      setError('Añade al menos una persona más a la cuenta conjunta'); return
    }
    const balanceNum = parseFloat(balance.replace(',', '.')) || 0
    const participantIds =
      type === 'conjunta'
        ? [currentUser.id, ...extraParticipants]
        : [currentUser.id]

    onSave({
      ownerId: type === 'conjunta' ? 'shared' : currentUser.id,
      name: name.trim(),
      bank: bank.trim() || undefined,
      type,
      emoji,
      balance: Math.round(balanceNum * 100) / 100,
      lastUpdated: TODAY,
      isActive: true,
      participantIds,
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
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tipo</label>
            <div className="flex gap-1 p-1 bg-secondary rounded-[10px]">
              {(['personal', 'conjunta'] as AccountType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium rounded-[8px] transition-colors',
                    type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'personal' ? 'Personal' : 'Conjunta'}
                </button>
              ))}
            </div>
          </div>

          {/* Participants — only for conjunta */}
          {type === 'conjunta' && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Participantes
              </label>
              <div className="space-y-1.5">
                {/* Current user — always included, locked */}
                <div className="flex items-center gap-3 px-3 py-2.5 bg-petroleo/8 rounded-[10px] border border-petroleo/20">
                  <div className="w-7 h-7 rounded-full bg-petroleo text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                    {currentUser.initial}
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {currentUser.name}
                    <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(tú)</span>
                  </span>
                  <Check className="w-4 h-4 text-petroleo flex-shrink-0" />
                </div>

                {/* Other users — toggleable */}
                {otherUsers.map((u) => {
                  const selected = extraParticipants.includes(u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleParticipant(u.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border transition-colors text-left',
                        selected
                          ? 'bg-petroleo/8 border-petroleo/20'
                          : 'bg-secondary border-transparent hover:border-border'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center flex-shrink-0',
                        selected ? 'bg-petroleo text-white' : 'bg-border text-muted-foreground'
                      )}>
                        {u.initial}
                      </div>
                      <span className="flex-1 text-sm font-medium text-foreground">{u.name}</span>
                      {selected && <Check className="w-4 h-4 text-petroleo flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Emoji */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Icono</label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'w-10 h-10 rounded-[8px] text-xl transition-colors',
                    emoji === e ? 'bg-petroleo/15 ring-2 ring-petroleo' : 'bg-secondary hover:bg-border'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Nombre</label>
            <input
              type="text"
              placeholder={type === 'conjunta' ? 'Cuenta conjunta BBVA...' : 'BBVA corriente, Openbank...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus={!isEdit}
              className="w-full px-3.5 py-2.5 text-sm text-foreground bg-secondary rounded-[10px] border border-transparent focus:border-ring focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Bank */}
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Saldo actual</label>
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
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-secondary hover:bg-border rounded-[10px] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand rounded-[10px] transition-colors">
            {isEdit ? 'Guardar cambios' : 'Añadir cuenta'}
          </button>
        </div>
      </div>
    </>
  )
}
