'use client'

import { useState, useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  CONJUNTA_MEMBERS,
  CURRENT_USER_ID,
  CATEGORY_COLORS,
  accountBalance,
  totalDeposited,
  totalExpenses,
  depositedBy,
  calculateConjuntaBalances,
  allTransactions,
  type ConjuntaTransaction,
} from '@/lib/mock-conjunta'

type Filter = 'todos' | 'ingresos' | 'gastos'

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

function getMemberName(userId: string) {
  return CONJUNTA_MEMBERS.find((m) => m.id === userId)?.name ?? userId
}

function MemberAvatar({ userId }: { userId: string }) {
  const m = CONJUNTA_MEMBERS.find((m) => m.id === userId)
  return (
    <div className="w-7 h-7 rounded-full bg-petroleo text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
      {m?.initial ?? '?'}
    </div>
  )
}

export function ConjuntaView() {
  const [filter, setFilter] = useState<Filter>('todos')

  const balances = calculateConjuntaBalances()
  const myBalance = balances.find((b) => b.userId === CURRENT_USER_ID)!
  const theirBalance = balances.find((b) => b.userId !== CURRENT_USER_ID)!
  const theirName = getMemberName(theirBalance.userId)
  const balance = accountBalance()

  const transactions = useMemo(() => {
    const all = allTransactions()
    if (filter === 'ingresos') return all.filter((t) => t.kind === 'deposit')
    if (filter === 'gastos') return all.filter((t) => t.kind === 'expense')
    return all
  }, [filter])

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, ConjuntaTransaction[]>()
    for (const t of transactions) {
      const date = t.kind === 'deposit' ? t.data.date : t.data.date
      const key = date.slice(0, 7) // YYYY-MM
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [transactions])

  return (
    <div className="px-6 pt-4 pb-6 space-y-4">

      {/* Account balance card */}
      <div className="bg-petroleo rounded-[16px] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Saldo en cuenta</p>
        <p className="text-3xl font-bold tracking-tight">{formatCurrency(balance)}</p>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/15">
          <div>
            <p className="text-[11px] text-white/60 mb-0.5">Ingresado</p>
            <p className="text-sm font-semibold">{formatCurrency(totalDeposited())}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60 mb-0.5">Gastado</p>
            <p className="text-sm font-semibold">{formatCurrency(totalExpenses())}</p>
          </div>
          {CONJUNTA_MEMBERS.map((m) => (
            <div key={m.id}>
              <p className="text-[11px] text-white/60 mb-0.5">Ingresó {m.name}</p>
              <p className="text-sm font-semibold">{formatCurrency(depositedBy(m.id))}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Balance neto */}
      <div className="bg-card rounded-[16px] border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Balance neto</p>
        </div>

        {/* The verdict */}
        <div
          className={cn(
            'px-5 py-4 flex items-center gap-3 border-b border-border',
            myBalance.net < 0 ? 'bg-rojo-tierra/5' : 'bg-teal-brand/5'
          )}
        >
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
              myBalance.net < 0 ? 'bg-rojo-tierra/15' : 'bg-teal-brand/15'
            )}
          >
            <TrendingDown
              className={cn('w-4 h-4', myBalance.net < 0 ? 'text-rojo-tierra' : 'text-teal-brand rotate-180')}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Resultado</p>
            <p className={cn('text-base font-bold', myBalance.net < 0 ? 'text-rojo-tierra' : 'text-teal-brand')}>
              {myBalance.net < -0.01
                ? `Debes ${formatCurrency(Math.abs(myBalance.net))} a ${theirName}`
                : myBalance.net > 0.01
                ? `${theirName} te debe ${formatCurrency(myBalance.net)}`
                : 'Al día — todo igualado'}
            </p>
          </div>
        </div>

        {/* Per-person breakdown */}
        <div className="divide-y divide-border">
          {balances.map((b) => {
            const isMe = b.userId === CURRENT_USER_ID
            return (
              <div key={b.userId} className={cn('flex items-center gap-3 px-5 py-3', isMe && 'bg-secondary/30')}>
                <MemberAvatar userId={b.userId} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {getMemberName(b.userId)}
                    {isMe && <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(tú)</span>}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Ingresó {formatCurrency(b.deposited)} · parte justa {formatCurrency(b.fairShare)}
                  </p>
                </div>
                <p
                  className={cn(
                    'text-sm font-bold flex-shrink-0',
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

      {/* Transaction list */}
      <div className="space-y-3">
        {/* Filter + action row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 p-1 bg-secondary rounded-[10px]">
            {(['todos', 'ingresos', 'gastos'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-[8px] capitalize transition-colors',
                  filter === f
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'ingresos' ? 'Ingresos' : 'Gastos'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-petroleo bg-petroleo/10 hover:bg-petroleo/20 rounded-[8px] transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Nuevo gasto
          </button>
        </div>

        {/* Grouped by month */}
        {grouped.map(([monthKey, txs]) => (
          <div key={monthKey} className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground capitalize pt-1">
              {monthLabel(monthKey + '-01')}
            </p>
            {txs.map((t) => {
              if (t.kind === 'deposit') {
                const d = t.data
                const isMe = d.userId === CURRENT_USER_ID
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-3 bg-card rounded-[12px] border border-border px-4 py-3 shadow-[0_1px_8px_rgba(0,18,25,0.05)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-brand/15 flex items-center justify-center flex-shrink-0">
                      <ArrowDownLeft className="w-4 h-4 text-teal-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{d.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {getMemberName(d.userId)} · {formatDateShort(d.date)}
                      </p>
                    </div>
                    <p className={cn('text-sm font-semibold flex-shrink-0', isMe ? 'text-teal-brand' : 'text-foreground')}>
                      +{formatCurrency(d.amount)}
                    </p>
                  </div>
                )
              } else {
                const e = t.data
                const perPerson = e.amount / CONJUNTA_MEMBERS.length
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 bg-card rounded-[12px] border border-border px-4 py-3 shadow-[0_1px_8px_rgba(0,18,25,0.05)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-rojo-tierra/10 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-rojo-tierra" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                            CATEGORY_COLORS[e.category]
                          )}
                        >
                          {e.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{formatDateShort(e.date)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(e.amount)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatCurrency(perPerson)} / c/u</p>
                    </div>
                  </div>
                )
              }
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
