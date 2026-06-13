'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import { usePatrimonio } from '@/contexts/patrimonioContext'
import { type PatrimonioAccount } from '@/lib/patrimonio'
import { NuevaCuentaModal } from './NuevaCuentaModal'
import { CURRENT_USER_ID } from '@/lib/users'
import { toast } from 'sonner'

type EditingBalance = { id: string; value: string } | null

export function PatrimonioView() {
  const { accounts, addAccount, updateAccount, deleteAccount } = usePatrimonio()
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<PatrimonioAccount | undefined>(undefined)
  const [editingBalance, setEditingBalance] = useState<EditingBalance>(null)

  const personal = accounts.filter(
    (a) => a.type === 'personal' && a.ownerId === CURRENT_USER_ID && a.isActive
  )
  const conjunta = accounts.filter((a) => a.type === 'conjunta' && a.isActive)

  const totalPersonal = personal.reduce((s, a) => s + a.balance, 0)
  const totalConjunta = conjunta.reduce((s, a) => s + a.balance, 0)
  const totalLiquidity = totalPersonal + totalConjunta

  function handleSaveAccount(data: Omit<PatrimonioAccount, 'id'>) {
    if (editingAccount) {
      updateAccount(editingAccount.id, data)
      toast.success('Cuenta actualizada')
    } else {
      addAccount(data)
      toast.success('Cuenta añadida')
    }
    setShowModal(false)
    setEditingAccount(undefined)
  }

  function handleEdit(a: PatrimonioAccount) {
    setEditingAccount(a)
    setShowModal(true)
  }

  function handleDelete(a: PatrimonioAccount) {
    deleteAccount(a.id)
    toast.success(`"${a.name}" eliminada`)
  }

  function startBalanceEdit(a: PatrimonioAccount) {
    setEditingBalance({ id: a.id, value: a.balance.toString() })
  }

  function commitBalanceEdit(a: PatrimonioAccount) {
    if (!editingBalance) return
    const val = parseFloat(editingBalance.value.replace(',', '.'))
    if (!isNaN(val)) {
      updateAccount(a.id, { balance: Math.round(val * 100) / 100, lastUpdated: '2026-06-13' })
      toast.success('Saldo actualizado')
    }
    setEditingBalance(null)
  }

  return (
    <>
      <div className="px-6 pt-4 pb-6 space-y-6">

        {/* Net worth summary */}
        <div className="bg-petroleo rounded-[16px] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Liquidez total</p>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalLiquidity)}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-4 border-t border-white/15">
            <div>
              <p className="text-[11px] text-white/60 mb-0.5">Personal</p>
              <p className="text-sm font-semibold">{formatCurrency(totalPersonal)}</p>
            </div>
            <div>
              <p className="text-[11px] text-white/60 mb-0.5">Conjunta</p>
              <p className="text-sm font-semibold">{formatCurrency(totalConjunta)}</p>
            </div>
          </div>
        </div>

        {/* Personal accounts */}
        <AccountSection
          title="Cuentas personales"
          accounts={personal}
          editingBalance={editingBalance}
          onAdd={() => { setEditingAccount(undefined); setShowModal(true) }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBalanceClick={startBalanceEdit}
          onBalanceChange={(v) => setEditingBalance((prev) => prev ? { ...prev, value: v } : null)}
          onBalanceCommit={commitBalanceEdit}
          addLabel="Añadir cuenta personal"
          emptyText="Añade tus cuentas bancarias personales para poder seleccionarlas al registrar gastos."
        />

        {/* Conjunta accounts */}
        <AccountSection
          title="Cuentas conjuntas"
          accounts={conjunta}
          editingBalance={editingBalance}
          onAdd={() => {
            setEditingAccount({
              id: '',
              ownerId: 'shared',
              name: '',
              type: 'conjunta',
              emoji: '🏠',
              balance: 0,
              lastUpdated: '2026-06-13',
              isActive: true,
              participantIds: [],
            })
            setShowModal(true)
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBalanceClick={startBalanceEdit}
          onBalanceChange={(v) => setEditingBalance((prev) => prev ? { ...prev, value: v } : null)}
          onBalanceCommit={commitBalanceEdit}
          addLabel="Añadir cuenta conjunta"
          emptyText="Añade la cuenta bancaria que compartís para registrar los gastos conjuntos."
        />

        {/* Investments placeholder */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Inversiones
          </p>
          <div className="flex items-center justify-center h-20 rounded-[16px] border border-dashed border-border bg-secondary/40">
            <p className="text-xs text-muted-foreground">Próximamente — módulo de inversiones</p>
          </div>
        </div>

      </div>

      {showModal && (
        <NuevaCuentaModal
          initialAccount={editingAccount?.id ? editingAccount : undefined}
          onSave={handleSaveAccount}
          onClose={() => { setShowModal(false); setEditingAccount(undefined) }}
        />
      )}
    </>
  )
}

// ─── Account section ─────────────────────────────────────────────────────────

interface AccountSectionProps {
  title: string
  accounts: PatrimonioAccount[]
  editingBalance: EditingBalance
  onAdd: () => void
  onEdit: (a: PatrimonioAccount) => void
  onDelete: (a: PatrimonioAccount) => void
  onBalanceClick: (a: PatrimonioAccount) => void
  onBalanceChange: (v: string) => void
  onBalanceCommit: (a: PatrimonioAccount) => void
  addLabel: string
  emptyText: string
}

function AccountSection({
  title,
  accounts,
  editingBalance,
  onAdd,
  onEdit,
  onDelete,
  onBalanceClick,
  onBalanceChange,
  onBalanceCommit,
  addLabel,
  emptyText,
}: AccountSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs font-medium text-petroleo hover:text-teal-brand transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 h-24 rounded-[16px] border border-dashed border-border bg-secondary/40 px-4">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((a) => {
            const isEditingThisBalance = editingBalance?.id === a.id
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 bg-card rounded-[12px] border border-border px-4 py-3 shadow-[0_1px_8px_rgba(0,18,25,0.05)]"
              >
                <span className="text-2xl flex-shrink-0">{a.emoji}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.name}</p>
                  {a.bank && (
                    <p className="text-[11px] text-muted-foreground">{a.bank}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5" />
                    {formatDateShort(a.lastUpdated)}
                  </p>
                </div>

                {/* Balance — click to edit inline */}
                <div className="flex-shrink-0 text-right mr-1">
                  {isEditingThisBalance ? (
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={editingBalance!.value}
                        onChange={(e) => onBalanceChange(e.target.value)}
                        onBlur={() => onBalanceCommit(a)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onBalanceCommit(a)
                          if (e.key === 'Escape') onBalanceChange('')
                        }}
                        autoFocus
                        className="w-28 pl-6 pr-2 py-1 text-sm font-bold text-foreground bg-secondary rounded-[8px] border border-ring focus:outline-none text-right"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => onBalanceClick(a)}
                      title="Haz clic para actualizar el saldo"
                      className="group text-right"
                    >
                      <p className={cn(
                        'text-base font-bold transition-colors',
                        a.balance >= 0 ? 'text-foreground group-hover:text-petroleo' : 'text-rojo-tierra'
                      )}>
                        {formatCurrency(a.balance)}
                      </p>
                      <p className="text-[10px] text-muted-foreground group-hover:text-petroleo transition-colors">
                        actualizar
                      </p>
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onEdit(a)}
                    className="p-1.5 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(a)}
                    className="p-1.5 rounded-[6px] text-muted-foreground hover:text-rojo-tierra hover:bg-rojo-tierra/8 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
