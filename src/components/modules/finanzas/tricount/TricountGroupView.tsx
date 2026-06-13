'use client'

import { useState } from 'react'
import { ChevronDown, Plus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  calculateBalances,
  calculateSettlements,
  MOCK_USERS,
  CURRENT_USER_ID,
  type TricountGroup,
} from '@/lib/mock-tricount'

interface Props {
  group: TricountGroup
}

type Tab = 'gastos' | 'balances'

function UserAvatar({ userId, size = 'md' }: { userId: string; size?: 'sm' | 'md' | 'lg' }) {
  const user = MOCK_USERS[userId]
  const sizeClasses = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' }
  return (
    <div
      className={cn(
        'rounded-full bg-petroleo text-white font-semibold flex items-center justify-center flex-shrink-0',
        sizeClasses[size]
      )}
    >
      {user?.initial ?? '?'}
    </div>
  )
}

export function TricountGroupView({ group }: Props) {
  const [tab, setTab] = useState<Tab>('gastos')
  const balances = calculateBalances(group)
  const settlements = calculateSettlements(balances)
  const myBalance = balances.find((b) => b.userId === CURRENT_USER_ID)

  return (
    <div className="px-6 pt-4 pb-6 space-y-6">
      {/* Group summary */}
      <div className="bg-card rounded-[16px] border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Participantes</p>
            <div className="flex items-center gap-1.5">
              {group.participantIds.map((id) => (
                <div key={id} className="flex items-center gap-1">
                  <UserAvatar userId={id} size="sm" />
                  <span className="text-xs text-muted-foreground">{MOCK_USERS[id]?.name}</span>
                </div>
              ))}
            </div>
          </div>
          {myBalance && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-0.5">Tu balance</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  myBalance.net > 0.01 ? 'text-teal-brand' : myBalance.net < -0.01 ? 'text-rojo-tierra' : 'text-muted-foreground'
                )}
              >
                {myBalance.net > 0.01
                  ? `+${formatCurrency(myBalance.net)}`
                  : myBalance.net < -0.01
                  ? `-${formatCurrency(Math.abs(myBalance.net))}`
                  : 'Al día'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {myBalance.net > 0.01 ? 'te deben' : myBalance.net < -0.01 ? 'debes' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-[10px] w-fit">
        {(['gastos', 'balances'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-[8px] capitalize transition-colors',
              tab === t
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'gastos' ? 'Gastos' : 'Balances'}
          </button>
        ))}
      </div>

      {tab === 'gastos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {group.expenses.length} gastos
            </p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-petroleo bg-petroleo/10 hover:bg-petroleo/20 rounded-[8px] transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Añadir gasto
            </button>
          </div>

          {[...group.expenses].reverse().map((expense) => {
            const payer = MOCK_USERS[expense.paidById]
            const share = expense.amount / group.participantIds.length
            return (
              <div
                key={expense.id}
                className="flex items-center gap-4 bg-card rounded-[12px] border border-border px-4 py-3 shadow-[0_1px_8px_rgba(0,18,25,0.06)]"
              >
                <UserAvatar userId={expense.paidById} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {payer?.name} pagó · {formatDateShort(expense.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">{formatCurrency(share)} / persona</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'balances' && (
        <div className="space-y-4">
          {/* Per-person net */}
          <div className="bg-card rounded-[16px] border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resumen por persona</p>
            </div>
            <div className="divide-y divide-border">
              {balances.map((b) => {
                const user = MOCK_USERS[b.userId]
                const isMe = b.userId === CURRENT_USER_ID
                return (
                  <div
                    key={b.userId}
                    className={cn('flex items-center gap-3 px-5 py-3', isMe && 'bg-secondary/40')}
                  >
                    <UserAvatar userId={b.userId} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {user?.name}
                        {isMe && <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(tú)</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Pagó {formatCurrency(b.paid)} · Debe {formatCurrency(b.owes)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        b.net > 0.01 ? 'text-teal-brand' : b.net < -0.01 ? 'text-rojo-tierra' : 'text-muted-foreground'
                      )}
                    >
                      {b.net > 0.01
                        ? `+${formatCurrency(b.net)}`
                        : b.net < -0.01
                        ? `-${formatCurrency(Math.abs(b.net))}`
                        : 'Al día'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settlements */}
          {settlements.length > 0 && (
            <div className="bg-card rounded-[16px] border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.settled ? 'Liquidaciones completadas' : 'Liquidaciones pendientes'}
                </p>
              </div>
              <div className="divide-y divide-border">
                {settlements.map((s, i) => {
                  const from = MOCK_USERS[s.fromId]
                  const to = MOCK_USERS[s.toId]
                  const isMe = s.fromId === CURRENT_USER_ID
                  return (
                    <div key={i} className={cn('flex items-center gap-3 px-5 py-3', isMe && 'bg-rojo-tierra/5')}>
                      <UserAvatar userId={s.fromId} size="sm" />
                      <p className="text-sm text-foreground flex-1">
                        <span className="font-medium">{from?.name}</span>
                        <ArrowRight className="w-3 h-3 inline mx-1.5 text-muted-foreground" />
                        <span className="font-medium">{to?.name}</span>
                      </p>
                      <div className="text-right">
                        <p className={cn('text-sm font-bold', isMe ? 'text-rojo-tierra' : 'text-foreground')}>
                          {formatCurrency(s.amount)}
                        </p>
                        {!group.settled && (
                          <button className="text-[11px] text-petroleo font-medium hover:underline">
                            Marcar saldado
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {settlements.length === 0 && (
            <div className="flex items-center justify-center h-24 rounded-[12px] border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Todo al día ✓</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
