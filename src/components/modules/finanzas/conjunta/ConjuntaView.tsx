'use client'

import { useState, useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus, TrendingDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  CONJUNTA_MEMBERS,
  MOCK_DEPOSITS,
  CURRENT_USER_ID,
  type ConjuntaDeposit,
} from '@/lib/mock-conjunta'
import {
  ALL_GASTOS,
  conjuntaGastos,
  netAmount,
  thirdPartyDebts,
  getCategoryMeta,
  type Gasto,
} from '@/lib/gasto'
import { getUser } from '@/lib/users'

type Filter = 'todos' | 'ingresos' | 'gastos'

type ConjuntaTx =
  | { kind: 'deposit'; date: string; data: ConjuntaDeposit }
  | { kind: 'gasto';   date: string; data: Gasto }

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

function getMemberName(userId: string) {
  return CONJUNTA_MEMBERS.find((m) => m.id === userId)?.name ?? getUser(userId).name
}

function MemberAvatar({ userId }: { userId: string }) {
  const m = CONJUNTA_MEMBERS.find((m) => m.id === userId)
  return (
    <div className="w-7 h-7 rounded-full bg-petroleo text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
      {m?.initial ?? '?'}
    </div>
  )
}

function r2(n: number) { return Math.round(n * 100) / 100 }

export function ConjuntaView() {
  const [filter, setFilter] = useState<Filter>('todos')

  // — Data from unified model —
  const cGastos = useMemo(() => conjuntaGastos(ALL_GASTOS), [])
  const debts    = useMemo(() => thirdPartyDebts(ALL_GASTOS), [])

  // — Totals —
  const totalDep   = MOCK_DEPOSITS.reduce((s, d) => s + d.amount, 0)
  const grossSpent = cGastos.reduce((s, g) => s + g.amount, 0)
  const netSpent   = cGastos.reduce((s, g) => s + netAmount(g), 0)
  const accBalance = r2(totalDep - grossSpent)
  const fairShare  = r2(netSpent / CONJUNTA_MEMBERS.length)

  // — Per-member balances —
  const balances = CONJUNTA_MEMBERS.map((m) => {
    const deposited = MOCK_DEPOSITS
      .filter((d) => d.userId === m.id)
      .reduce((s, d) => s + d.amount, 0)
    return { userId: m.id, deposited, fairShare, net: r2(deposited - fairShare) }
  })

  const myBalance   = balances.find((b) => b.userId === CURRENT_USER_ID)!
  const theirBalance = balances.find((b) => b.userId !== CURRENT_USER_ID)!
  const theirName   = getMemberName(theirBalance.userId)

  // — Transaction list —
  const allTxs = useMemo((): ConjuntaTx[] => {
    const deps: ConjuntaTx[] = MOCK_DEPOSITS.map((d) => ({ kind: 'deposit', date: d.date, data: d }))
    const gas: ConjuntaTx[]  = cGastos.map((g) => ({ kind: 'gasto', date: g.date, data: g }))
    let combined = [...deps, ...gas].sort((a, b) => b.date.localeCompare(a.date))
    if (filter === 'ingresos') combined = combined.filter((t) => t.kind === 'deposit')
    if (filter === 'gastos')   combined = combined.filter((t) => t.kind === 'gasto')
    return combined
  }, [cGastos, filter])

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, ConjuntaTx[]>()
    for (const t of allTxs) {
      const key = t.date.slice(0, 7)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [allTxs])

  return (
    <div className="px-6 pt-4 pb-6 space-y-4">

      {/* Account balance card */}
      <div className="bg-petroleo rounded-[16px] p-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Saldo en cuenta</p>
        <p className="text-3xl font-bold tracking-tight">{formatCurrency(accBalance)}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 pt-4 border-t border-white/15">
          <div>
            <p className="text-[11px] text-white/60 mb-0.5">Ingresado</p>
            <p className="text-sm font-semibold">{formatCurrency(totalDep)}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60 mb-0.5">Gastado</p>
            <p className="text-sm font-semibold">{formatCurrency(grossSpent)}</p>
          </div>
          {CONJUNTA_MEMBERS.map((m) => {
            const dep = MOCK_DEPOSITS.filter((d) => d.userId === m.id).reduce((s, d) => s + d.amount, 0)
            return (
              <div key={m.id}>
                <p className="text-[11px] text-white/60 mb-0.5">Ingresó {m.name}</p>
                <p className="text-sm font-semibold">{formatCurrency(dep)}</p>
              </div>
            )
          })}
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

      {/* Deudas de terceros */}
      {debts.length > 0 && (
        <div className="bg-ambar/8 border border-ambar/25 rounded-[16px] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-ambar/20">
            <AlertCircle className="w-4 h-4 text-ambar flex-shrink-0" />
            <p className="text-xs font-semibold text-ambar uppercase tracking-wide">
              Deudas pendientes de terceros
            </p>
          </div>
          <div className="divide-y divide-ambar/15">
            {Object.entries(
              debts.reduce<Record<string, number>>((acc, d) => {
                acc[d.userId] = r2((acc[d.userId] ?? 0) + d.totalOwed)
                return acc
              }, {})
            ).map(([userId, total]) => (
              <div key={userId} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-ambar/20 text-ambar text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
                  {getUser(userId).initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{getUser(userId).name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatCurrency(r2(total / CONJUNTA_MEMBERS.length))} a cada miembro
                  </p>
                </div>
                <p className="text-sm font-bold text-ambar flex-shrink-0">
                  {formatCurrency(total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                const g = t.data
                const cat = getCategoryMeta(g.category)
                const net = netAmount(g)
                const perPerson = r2(net / CONJUNTA_MEMBERS.length)
                const hasThirdParty = g.thirdParty.length > 0
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 bg-card rounded-[12px] border border-border px-4 py-3 shadow-[0_1px_8px_rgba(0,18,25,0.05)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-rojo-tierra/10 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4 text-rojo-tierra" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', cat.colorClass)}>
                          {cat.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {getMemberName(g.paidById)} · {formatDateShort(g.date)}
                        </span>
                        {hasThirdParty && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-ambar/15 text-ambar">
                            incl. deuda {g.thirdParty.map((tp) => getUser(tp.userId).name).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(net)}</p>
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
