'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wallet, Home, Repeat2, Heart, Plane, ChevronRight,
  Circle, CheckCircle2, CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useSession } from '@/contexts/sessionContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(hour: number) {
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Mini calendar ────────────────────────────────────────────────────────────

// Mock dots: días con eventos (coloreados por módulo)
const MOCK_EVENT_DAYS: Record<number, string> = {
  13: 'bg-petroleo',
  15: 'bg-teal-brand',
  18: 'bg-ambar',
  22: 'bg-rojo-tierra',
  28: 'bg-teal-brand',
}

function MiniCalendar({ now }: { now: Date }) {
  const year  = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const monthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  // lunes = 0 … domingo = 6
  const rawFirst = new Date(year, month, 1).getDay()
  const offset   = rawFirst === 0 ? 6 : rawFirst - 1
  const total    = new Date(year, month + 1, 0).getDate()

  const days = Array.from({ length: offset + total }, (_, i) =>
    i < offset ? null : i - offset + 1
  )

  return (
    <section>
      <SectionHeader title="Este mes" linkHref="/calendario" linkLabel="Ver calendario" />
      <div className="bg-card rounded-[16px] border border-border p-4 shadow-[0_1px_8px_rgba(0,18,25,0.05)]">
        <p className="text-sm font-semibold text-foreground capitalize mb-3">{capitalize(monthName)}</p>

        {/* Day headers */}
        <div className="grid mb-0.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {['L','M','X','J','V','S','D'].map((d) => (
            <div key={d} className="flex items-center justify-center text-[10px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />
            const isToday = day === today
            const isPast  = day < today
            const dot     = MOCK_EVENT_DAYS[day]
            return (
              <div key={day} className="flex flex-col items-center justify-center py-0.5 gap-0.5">
                <span className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-colors cursor-default',
                  isToday  && 'bg-petroleo text-white font-bold',
                  !isToday && isPast  && 'text-muted-foreground/40',
                  !isToday && !isPast && 'text-foreground',
                )}>
                  {day}
                </span>
                {dot && (
                  <div className={cn('w-1 h-1 rounded-full', dot)} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pendientes hoy ───────────────────────────────────────────────────────────

interface PendingItem {
  id:     string
  label:  string
  module: string
  urgent: boolean
  done:   boolean
}

const MOCK_PENDING: PendingItem[] = [
  { id: '1', label: 'Tomar omeprazol',                    module: 'Salud',    urgent: true,  done: false },
  { id: '2', label: 'Registrar gastos del fin de semana', module: 'Finanzas', urgent: false, done: false },
  { id: '3', label: 'Cambiar sábanas',                    module: 'Hogar',    urgent: false, done: false },
  { id: '4', label: 'Meditar 10 min',                     module: 'Hábitos',  urgent: false, done: true  },
]

function PendientesHoy() {
  const [items, setItems] = useState<PendingItem[]>(MOCK_PENDING)

  function toggle(id: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it))
  }

  const pending = items.filter((i) => !i.done)
  const done    = items.filter((i) => i.done)

  return (
    <section>
      <SectionHeader
        title={`Pendiente hoy${pending.length > 0 ? ` · ${pending.length}` : ''}`}
        linkHref="/calendario"
        linkLabel="Todo"
      />
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={cn(
              'w-full flex items-center gap-3 bg-card rounded-[12px] px-4 py-3',
              'border border-border shadow-[0_1px_6px_rgba(0,18,25,0.05)]',
              'hover:shadow-[0_2px_12px_rgba(0,18,25,0.08)] transition-all text-left',
              item.done && 'opacity-50'
            )}
          >
            {item.done
              ? <CheckCircle2 className="w-4 h-4 text-teal-brand flex-shrink-0" />
              : <Circle className={cn(
                  'w-4 h-4 flex-shrink-0',
                  item.urgent ? 'text-rojo-tierra' : 'text-muted-foreground/40'
                )} />
            }
            <p className={cn(
              'flex-1 text-sm font-medium text-foreground truncate',
              item.done && 'line-through text-muted-foreground'
            )}>
              {item.label}
            </p>
            <span className="text-[11px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5 flex-shrink-0">
              {item.module}
            </span>
          </button>
        ))}
        {done.length === items.length && (
          <p className="text-xs text-teal-brand font-medium text-center py-2">
            ¡Todo listo por hoy! 🎉
          </p>
        )}
      </div>
    </section>
  )
}

// ─── Module summary cards ─────────────────────────────────────────────────────

interface SummaryCard {
  slug:      string
  label:     string
  icon:      React.ElementType
  href:      string
  value:     string
  subtext:   string
  trend?:    string
  trendDown?: boolean
}

const SUMMARY_CARDS: SummaryCard[] = [
  {
    slug: 'finanzas', label: 'Finanzas', icon: Wallet, href: '/finanzas/gastos',
    value: formatCurrency(1243.50), subtext: 'gastado en junio',
    trend: '-8% vs mayo', trendDown: true,
  },
  {
    slug: 'hogar', label: 'Hogar', icon: Home, href: '/hogar',
    value: '5 tareas', subtext: 'pendientes esta semana',
    trend: '2 para hoy',
  },
  {
    slug: 'habitos', label: 'Hábitos', icon: Repeat2, href: '/habitos',
    value: '3 / 6', subtext: 'completados hoy',
    trend: '50% · racha activa',
  },
  {
    slug: 'salud', label: 'Salud', icon: Heart, href: '/salud',
    value: 'Fisio lun 15',subtext: 'próxima cita',
    trend: '3 sesiones de bono',
  },
  {
    slug: 'viajes', label: 'Viajes', icon: Plane, href: '/viajes',
    value: 'Menorca',subtext: '28 jul · en 45 días',
  },
]

function ModuleCards() {
  return (
    <section>
      <SectionHeader title="Resumen" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.slug}
              href={card.href}
              className={cn(
                'group bg-card rounded-[16px] px-5 py-4 border border-border',
                'shadow-[0_1px_8px_rgba(0,18,25,0.05)]',
                'hover:shadow-[0_4px_20px_rgba(0,18,25,0.10)] hover:border-petroleo/25',
                'transition-all flex flex-col gap-3'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[8px] bg-secondary flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-petroleo transition-colors" />
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
              </div>

              {card.trend && (
                <p className={cn(
                  'text-[11px] font-medium',
                  card.trendDown === true  ? 'text-teal-brand'  :
                  card.trendDown === false ? 'text-rojo-tierra' :
                  'text-muted-foreground'
                )}>
                  {card.trend}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ─── Shared section header ────────────────────────────────────────────────────

function SectionHeader({
  title, linkHref, linkLabel,
}: { title: string; linkHref?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {linkHref && (
        <Link
          href={linkHref}
          className="text-xs text-petroleo hover:text-teal-brand transition-colors font-medium"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { user } = useSession()
  const now      = new Date()
  const hour     = now.getHours()

  const dateLabel = capitalize(now.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  }))

  return (
    <div className="px-6 pt-4 pb-8 space-y-6">

      {/* Greeting */}
      <div className="bg-petroleo rounded-[18px] px-6 py-5 text-white">
        <p className="text-xl font-bold leading-tight">
          {getGreeting(hour)}, {user.display_name} 👋
        </p>
        <p className="text-sm text-white/60 mt-1 capitalize">{dateLabel}</p>

        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-white/15">
          <CalendarDays className="w-3.5 h-3.5 text-white/50" />
          <p className="text-xs text-white/60">
            {MOCK_PENDING.filter((i) => !i.done).length} pendientes hoy
          </p>
        </div>
      </div>

      {/* Calendar */}
      <MiniCalendar now={now} />

      {/* Pending */}
      <PendientesHoy />

      {/* Cards */}
      <ModuleCards />
    </div>
  )
}
