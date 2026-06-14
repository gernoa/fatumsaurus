'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wallet, Home, Repeat2, Heart, Plane,
  ChevronRight, Circle, CheckCircle2, TrendingDown,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { useSession } from '@/contexts/sessionContext'
import { useModuleColors } from '@/contexts/moduleColorsContext'
import { MODULE_COLOR_NEUTRAL } from '@/lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(hour: number): string {
  if (hour < 12) return 'Buenos días'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function hexToAlpha(hex: string | null, alpha = 0.12): string {
  if (!hex || !hex.startsWith('#')) return `oklch(0.65 0 0 / ${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ title, linkHref, linkLabel }: {
  title: string; linkHref?: string; linkLabel?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {linkHref && (
        <Link href={linkHref}
          className="text-xs text-petroleo hover:text-teal-brand font-medium transition-colors">
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}

// ─── Greeting hero ────────────────────────────────────────────────────────────

const MOCK_PENDING_COUNT: number = 4
const MOCK_HABITOS_DONE:  number = 3
const MOCK_HABITOS_TOTAL: number = 6

function GreetingHero() {
  const { user } = useSession()
  const now  = new Date()
  const hour = now.getHours()

  const avatarDisplay = user.avatar_type === 'emoji' && user.avatar_value
    ? user.avatar_value
    : user.display_name.charAt(0).toUpperCase()
  const isEmoji = user.avatar_type === 'emoji' && !!user.avatar_value

  const rawDay    = now.getDay()
  const dayOfWeek = rawDay === 0 ? 7 : rawDay
  const weekPct   = Math.round((dayOfWeek / 7) * 100)

  return (
    <div
      className="rounded-[20px] px-6 py-6 border relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, oklch(0.37 0.080 209 / 90%) 0%, oklch(0.10 0.030 209 / 94%) 70%)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderColor: 'oklch(1 0 0 / 14%)',
        boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 18%), 0 8px 32px oklch(0 0 0 / 0.14)',
      }}
    >
      {/* Glow top-right */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'oklch(0.58 0.105 192 / 20%)', filter: 'blur(40px)' }} />
      {/* Amber accent */}
      <div className="absolute -bottom-14 left-1/3 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'oklch(0.72 0.170 67 / 10%)', filter: 'blur(30px)' }} />

      {/* Avatar + greeting */}
      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            'font-bold text-white border border-white/25',
            isEmoji ? 'text-2xl' : 'text-lg'
          )}
          style={{ background: 'oklch(0.58 0.105 192 / 25%)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {avatarDisplay}
        </div>
        <div>
          <p className="text-xl font-bold text-white leading-snug" suppressHydrationWarning>
            {getGreeting(hour)}, {user.display_name}
          </p>
          <p className="text-[13px] text-white/55 mt-0.5 capitalize" suppressHydrationWarning>
            {capitalize(now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 mt-5 pt-4 border-t border-white/12">
        <span className="text-xs text-white/65 font-medium">
          {MOCK_PENDING_COUNT} pendiente{MOCK_PENDING_COUNT !== 1 ? 's' : ''} hoy
        </span>
        <span className="w-px h-4 bg-white/20 flex-shrink-0" />
        <span className="text-xs text-white/65 font-medium">
          {MOCK_HABITOS_DONE} de {MOCK_HABITOS_TOTAL} hábitos
        </span>
        <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0 ml-1">
          <span className="w-px h-4 bg-white/20 flex-shrink-0" />
          <div className="flex-1 h-[3px] rounded-full overflow-hidden"
            style={{ background: 'oklch(1 0 0 / 12%)' }}>
            <div
              className="h-full rounded-full"
              suppressHydrationWarning
              style={{
                width: `${weekPct}%`,
                background: 'oklch(0.58 0.105 192)',
                boxShadow: '0 0 6px oklch(0.58 0.105 192 / 70%)',
              }}
            />
          </div>
          <span className="text-[11px] text-white/40 flex-shrink-0" suppressHydrationWarning>
            semana {weekPct}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Mini calendar ───────────────────────────────────────────────────────────

const MOCK_EVENT_DAYS: Record<number, string> = {
  13: '#0A9396',
  15: '#EE9B00',
  18: '#005F73',
  22: '#AE2012',
  28: '#0A9396',
}

function MiniCalendar() {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const rawFirst = new Date(year, month, 1).getDay()
  const offset   = rawFirst === 0 ? 6 : rawFirst - 1
  const total    = new Date(year, month + 1, 0).getDate()
  const days     = Array.from({ length: offset + total }, (_, i) =>
    i < offset ? null : i - offset + 1
  )

  return (
    <div>
      <SectionLabel title="Este mes" linkHref="/calendario" linkLabel="Abrir" />

      {/* .glass class from globals.css: backdrop-filter + -webkit-backdrop-filter + border */}
      <div className="glass rounded-[16px] p-4 w-full">
        <p className="text-sm font-semibold text-foreground capitalize mb-3" suppressHydrationWarning>
          {capitalize(now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))}
        </p>

        {/* Day headers — minmax: mínimo 2rem por celda, se expanden para llenar el ancho */}
        <div className="grid mb-1" style={{ gridTemplateColumns: 'repeat(7, minmax(2rem, 1fr))' }}>
          {['L','M','X','J','V','S','D'].map((d) => (
            <div key={d} className="flex items-center justify-center text-[10px] font-semibold text-muted-foreground/65 py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, minmax(2rem, 1fr))' }} suppressHydrationWarning>
          {days.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />
            const isToday = day === today
            const isPast  = day < today
            const dot     = MOCK_EVENT_DAYS[day]
            return (
              <div key={day} className="flex flex-col items-center py-1 gap-[4px]">
                <span
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium',
                    isToday && 'font-bold text-white',
                    !isToday && isPast  && 'text-muted-foreground/35',
                    !isToday && !isPast && 'text-foreground',
                  )}
                  style={isToday ? {
                    background: 'oklch(0.37 0.080 209)',
                    boxShadow: '0 0 0 2px oklch(0.58 0.105 192 / 40%)',
                  } : undefined}
                >
                  {day}
                </span>
                {dot && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dot }} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
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
  { id: '5', label: 'Revisar inversiones',                module: 'Finanzas', urgent: false, done: false },
]

function PendientesHoy() {
  const [items, setItems] = useState<PendingItem[]>(MOCK_PENDING)

  function toggle(id: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, done: !it.done } : it))
  }

  const pending = items.filter((i) => !i.done)

  return (
    <div>
      <SectionLabel
        title={pending.length > 0 ? `Pendiente hoy · ${pending.length}` : 'Pendiente hoy'}
        linkHref="/calendario"
        linkLabel="Ver todo"
      />
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={cn(
              'w-full card-tech flex items-center gap-3 px-4 py-3 text-left group transition-all duration-150',
              item.done && 'opacity-55'
            )}
            style={item.urgent && !item.done ? { borderColor: 'oklch(0.44 0.185 27 / 45%)' } : undefined}
          >
            {item.done
              ? <CheckCircle2 className="w-4 h-4 text-teal-brand flex-shrink-0" />
              : <Circle className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  item.urgent
                    ? 'text-rojo-tierra'
                    : 'text-muted-foreground/35 group-hover:text-muted-foreground/60'
                )} />
            }
            <p className={cn(
              'flex-1 text-sm font-medium text-foreground truncate text-left',
              item.done && 'line-through text-muted-foreground'
            )}>
              {item.label}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground rounded-full px-2 py-0.5 flex-shrink-0 bg-black/5">
              {item.module}
            </span>
          </button>
        ))}

        {pending.length === 0 && (
          <div className="text-center py-4 rounded-[12px]"
            style={{
              background: 'oklch(0.58 0.105 192 / 8%)',
              border: '1px solid oklch(0.58 0.105 192 / 20%)',
            }}
          >
            <p className="text-sm text-teal-brand font-semibold">¡Todo listo por hoy!</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sin pendientes</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Module summary cards ─────────────────────────────────────────────────────

interface SummaryCardData {
  slug:           string
  label:          string
  icon:           LucideIcon
  href:           string
  value:          string
  subtext:        string
  trend?:         string
  trendPositive?: boolean   // true=teal, false=rojo, undefined=neutro
}

const SUMMARY_CARDS: SummaryCardData[] = [
  {
    slug: 'finanzas', label: 'Finanzas', icon: Wallet, href: '/finanzas/gastos',
    value: formatCurrency(1243.50), subtext: 'gastado en junio',
    trend: '−8% vs mayo', trendPositive: true,
  },
  {
    slug: 'hogar', label: 'Hogar', icon: Home, href: '/hogar',
    value: '5 tareas', subtext: 'pendientes esta semana',
    trend: '2 para hoy',
  },
  {
    slug: 'habitos', label: 'Hábitos', icon: Repeat2, href: '/habitos',
    value: '3 / 6', subtext: 'hábitos completados hoy',
    trend: 'Racha activa · 12 días',
  },
  {
    slug: 'salud', label: 'Salud', icon: Heart, href: '/salud',
    value: 'Lun 15', subtext: 'próxima cita · Fisio',
    trend: '3 sesiones de bono',
  },
  {
    slug: 'viajes', label: 'Viajes', icon: Plane, href: '/viajes',
    value: 'Menorca', subtext: '28 jul · confirmado',
    trend: 'En 45 días',
  },
]

function ModuleCards() {
  const { getColor } = useModuleColors()

  return (
    <div>
      <SectionLabel title="Resumen de módulos" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {SUMMARY_CARDS.map((card) => {
          const Icon      = card.icon
          const colorHex  = getColor(card.slug)
          const iconBg    = hexToAlpha(colorHex, 0.12)
          const iconColor = colorHex ?? MODULE_COLOR_NEUTRAL

          return (
            // .card-tech class handles backdrop-filter, border, box-shadow, AND hover via CSS
            <Link
              key={card.slug}
              href={card.href}
              className="card-tech group flex flex-col gap-3.5 px-5 py-4 transition-all duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ background: iconBg }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
                </div>
                <ChevronRight
                  className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  style={{ color: colorHex ? `${colorHex}99` : 'oklch(0.65 0 0)' }}
                />
              </div>

              {/* Value */}
              <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground leading-none truncate">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{card.subtext}</p>
              </div>

              {/* Trend */}
              {card.trend && (
                <p className={cn(
                  'text-[11px] font-medium flex items-center gap-1',
                  card.trendPositive === true  && 'text-teal-brand',
                  card.trendPositive === false && 'text-rojo-tierra',
                  card.trendPositive === undefined && 'text-muted-foreground',
                )}>
                  {card.trendPositive === false && <TrendingDown className="w-3 h-3" />}
                  {card.trend}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function DashboardView() {
  return (
    <div className="px-6 pt-5 pb-10 space-y-6 w-full">
      <GreetingHero />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <MiniCalendar />
        <PendientesHoy />
      </div>
      <ModuleCards />
    </div>
  )
}
