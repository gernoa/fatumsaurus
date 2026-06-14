'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useState } from 'react'
import {
  Wallet, Users, TrendingUp, PiggyBank, AlertCircle, ChevronRight, RefreshCw, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  personalGastos,
  conjuntaGastos,
  filterByMonth,
  totalAmount,
  type RecurringFrequency,
} from '@/lib/gasto'
import { useUsers } from '@/lib/users'
import { usePatrimonio } from '@/contexts/patrimonioContext'
import { useInversiones } from '@/contexts/inversionesContext'
import { useGastos } from '@/contexts/gastosContext'
import { useSession } from '@/contexts/sessionContext'
import { getPortfolioTotals, getProductStats } from '@/lib/inversiones'
import { MOCK_DEPOSITS } from '@/lib/mock-conjunta'

const TODAY_YEAR  = 2026
const TODAY_MONTH = 6

const FREQ_LABEL: Record<RecurringFrequency, string> = {
  weekly: 'semanal', monthly: 'mensual', bimonthly: 'bimensual', yearly: 'anual',
}

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  title:    string
  href:     string
  icon:     React.ElementType
  primary:  string
  sub:      string
  badge?:   string
  badgeOk?: boolean
  empty?:   boolean
  emptyMsg?:string
}

function SummaryCard({ title, href, icon: Icon, primary, sub, badge, badgeOk, empty, emptyMsg }: SummaryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group card-tech px-5 py-4',
        'flex items-start justify-between gap-3'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-[8px] bg-secondary flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{title}</span>
        </div>

        {empty ? (
          <p className="text-sm text-muted-foreground/60 italic">{emptyMsg ?? 'Sin datos aún'}</p>
        ) : (
          <>
            <p className="text-2xl font-bold text-foreground leading-tight">{primary}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            {badge && (
              <span className={cn(
                'inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                badgeOk ? 'bg-teal-brand/10 text-teal-brand' : 'bg-rojo-tierra/10 text-rojo-tierra'
              )}>
                {badge}
              </span>
            )}
          </>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-petroleo transition-colors flex-shrink-0 mt-0.5" />
    </Link>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function FinanzasResumenView() {
  const { accounts }                             = usePatrimonio()
  const { currentUser }                          = useUsers()
  const { products, aportaciones, valoraciones } = useInversiones()
  const { gastos: allGastos }                    = useGastos()
  const { user }                                 = useSession()

  // Gastos personales este mes
  const thisMonth   = useMemo(() => filterByMonth(personalGastos(allGastos, currentUser.id), TODAY_YEAR, TODAY_MONTH), [allGastos, currentUser.id])
  const lastMonth   = useMemo(() => filterByMonth(personalGastos(allGastos, currentUser.id), TODAY_YEAR, TODAY_MONTH - 1), [allGastos, currentUser.id])
  const thisTotal   = totalAmount(thisMonth)
  const lastTotal   = totalAmount(lastMonth)
  const gastosEmpty = allGastos.length === 0

  // Cuenta conjunta
  const conjuntaAcc = accounts.find((a) => a.type === 'conjunta' && a.isActive)
  const depositsTotal = MOCK_DEPOSITS.reduce((s, d) => s + d.amount, 0)
  const conjuntaGastosTotal = totalAmount(conjuntaGastos(allGastos))
  const conjuntaBalance = depositsTotal - conjuntaGastosTotal
  const conjuntaEmpty = !conjuntaAcc || (depositsTotal === 0 && conjuntaGastosTotal === 0)

  // Inversiones
  const myProducts    = products.filter((p) => p.ownerId === currentUser.id && p.isActive)
  const myStats       = myProducts.map((p) => getProductStats(p, currentUser.id, aportaciones, valoraciones))
  const invTotals     = getPortfolioTotals(myStats)
  const inversionesEmpty = myProducts.length === 0

  // Patrimonio
  const personalAccounts = accounts.filter((a) => a.type === 'personal' && a.isActive && a.ownerId === currentUser.id)
  const totalCuentas = personalAccounts.reduce((s, a) => s + a.balance, 0)
  const patrimonioEmpty = personalAccounts.every((a) => a.balance === 0) && inversionesEmpty

  // Deudas: calculadas desde gastos compartidos reales
  const gastosCompartidosMios = allGastos.filter((g) => g.compartido && g.paidVia === 'personal' && g.paidById === user.id)
  const deudasEmpty = gastosCompartidosMios.length === 0
  const totalDeudas = gastosCompartidosMios.reduce((s, g) => s + g.amount / 2, 0)

  // Recurrentes próximos (todos los gastos con recurring.nextDate en los próximos 30 días)
  const today = new Date()
  const proximosRecurrentes = allGastos
    .filter((g) => g.recurring)
    .filter((g) => {
      const d = new Date(g.recurring!.nextDate)
      const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diff <= 30
    })
    .sort((a, b) => a.recurring!.nextDate.localeCompare(b.recurring!.nextDate))
    .slice(0, 4)

  return (
    <div className="px-6 pt-4 pb-8 space-y-5">

      {/* Header tip when everything is empty */}
      {gastosEmpty && conjuntaEmpty && inversionesEmpty && (
        <div className="bg-petroleo/6 border border-petroleo/15 rounded-[16px] px-5 py-4">
          <p className="text-sm font-semibold text-petroleo">Empieza a registrar tus finanzas</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Ve a cada sección para añadir tus gastos, configurar la cuenta conjunta o registrar tus inversiones.
            Todo empieza aquí desde cero.
          </p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryCard
          title="Gastos personales"
          href="/finanzas/gastos"
          icon={Wallet}
          primary={gastosEmpty ? '—' : formatCurrency(thisTotal)}
          sub="este mes"
          badge={!gastosEmpty && lastTotal > 0
            ? `${((thisTotal - lastTotal) / lastTotal * 100) > 0 ? '+' : ''}${((thisTotal - lastTotal) / lastTotal * 100).toFixed(1)}% vs mes anterior`
            : undefined}
          badgeOk={!gastosEmpty && thisTotal <= lastTotal}
          empty={gastosEmpty}
          emptyMsg="Añade tu primer gasto"
        />

        <SummaryCard
          title="Cuenta conjunta"
          href="/finanzas/conjunta"
          icon={Users}
          primary={conjuntaEmpty ? '—' : formatCurrency(conjuntaBalance)}
          sub={conjuntaEmpty ? '' : 'saldo disponible'}
          empty={conjuntaEmpty}
          emptyMsg={conjuntaAcc ? 'Sin movimientos aún' : 'Cuenta por configurar'}
        />

        <SummaryCard
          title="Inversiones"
          href="/finanzas/inversiones"
          icon={TrendingUp}
          primary={inversionesEmpty ? '—' : formatCurrency(invTotals.valorActual ?? invTotals.totalAportado)}
          sub={inversionesEmpty ? '' : `${invTotals.valorActual !== null ? formatCurrency(invTotals.totalAportado) + ' invertido' : 'sin valoración aún'}`}
          badge={!inversionesEmpty && invTotals.rentabilidad !== null
            ? `${invTotals.rentabilidad >= 0 ? '+' : ''}${invTotals.rentabilidad.toFixed(1)}% rentabilidad`
            : undefined}
          badgeOk={!inversionesEmpty && (invTotals.rentabilidad ?? 0) >= 0}
          empty={inversionesEmpty}
          emptyMsg="Registra tus productos"
        />

        <SummaryCard
          title="Patrimonio neto"
          href="/finanzas/patrimonio"
          icon={PiggyBank}
          primary={patrimonioEmpty ? '—' : formatCurrency(totalCuentas + (invTotals.valorActual ?? invTotals.totalAportado))}
          sub={patrimonioEmpty ? '' : 'cuentas + inversiones'}
          empty={patrimonioEmpty}
          emptyMsg="Actualiza tus saldos"
        />
      </div>

      {/* Análisis link */}
      <Link
        href="/finanzas/analisis"
        className="flex items-center gap-3 card-tech px-5 py-3.5"
      >
        <div className="w-7 h-7 rounded-[8px] bg-petroleo/10 flex items-center justify-center flex-shrink-0">
          <BarChart2 className="w-3.5 h-3.5 text-petroleo" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Análisis de gastos</p>
          <p className="text-xs text-muted-foreground">Categorías, promedios y planificador de presupuesto</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-petroleo transition-colors flex-shrink-0" />
      </Link>

      {/* Deudas link */}
      <Link
        href="/finanzas/deudas"
        className="flex items-center gap-3 card-tech px-5 py-3.5"
      >
        <div className="w-7 h-7 rounded-[8px] bg-secondary flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Deudas personales</p>
          <p className="text-xs text-muted-foreground">
            {deudasEmpty ? 'Sin deudas activas' : `Te deben ${formatCurrency(totalDeudas)}`}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-petroleo transition-colors flex-shrink-0" />
      </Link>

      {/* Upcoming recurring */}
      {proximosRecurrentes.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Recurrentes próximos
          </p>
          {proximosRecurrentes.map((g) => {
            const nextDate = new Date(g.recurring!.nextDate)
            const diff = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isOverdue = diff < 0
            return (
              <div
                key={g.id}
                className={cn(
                  'flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] border',
                  isOverdue ? 'bg-rojo-tierra/5 border-rojo-tierra/20' : 'bg-secondary/40 border-border'
                )}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{g.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {FREQ_LABEL[g.recurring!.frequency]} · aprox. {formatCurrency(g.amount)}
                  </p>
                </div>
                <p className={cn(
                  'text-xs font-semibold flex-shrink-0',
                  isOverdue ? 'text-rojo-tierra' : diff === 0 ? 'text-ambar' : 'text-muted-foreground'
                )}>
                  {isOverdue ? `hace ${Math.abs(diff)}d` : diff === 0 ? 'hoy' : `en ${diff}d`}
                </p>
              </div>
            )
          })}
          <Link
            href="/finanzas/gastos"
            className="text-xs text-petroleo hover:text-teal-brand transition-colors font-medium block text-right"
          >
            Ver todos los gastos →
          </Link>
        </div>
      )}
    </div>
  )
}
