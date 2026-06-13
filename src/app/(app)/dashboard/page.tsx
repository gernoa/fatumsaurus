import { LayoutDashboard, Wallet, Home, Repeat2, Heart, Plane } from 'lucide-react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'

const MOCK_DATE = new Date(2026, 5, 13) // Junio 13, 2026

function formatDate(d: Date) {
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const MOCK_CARDS = [
  {
    slug: 'finanzas',
    label: 'Finanzas',
    icon: Wallet,
    value: '1.243,50 €',
    subtext: 'gastado este mes',
    trend: '-8% vs mayo',
    trendUp: false,
  },
  {
    slug: 'hogar',
    label: 'Hogar',
    icon: Home,
    value: '5 tareas',
    subtext: 'pendientes esta semana',
    trend: '2 para hoy',
    trendUp: null,
  },
  {
    slug: 'habitos',
    label: 'Hábitos',
    icon: Repeat2,
    value: '3 / 6',
    subtext: 'completados hoy',
    trend: '50% de racha activa',
    trendUp: null,
  },
  {
    slug: 'salud',
    label: 'Salud',
    icon: Heart,
    value: 'Fisio',
    subtext: 'próxima cita — lun 15 jun',
    trend: '3 sesiones restantes',
    trendUp: null,
  },
  {
    slug: 'viajes',
    label: 'Viajes',
    icon: Plane,
    value: 'Menorca',
    subtext: 'próximo viaje — 28 jul',
    trend: 'En 45 días',
    trendUp: null,
  },
]

const MOCK_PENDING = [
  { label: 'Cambiar sábanas', module: 'Hogar', urgent: false },
  { label: 'Tomar omeprazol', module: 'Salud', urgent: true },
  { label: 'Meditar 10 min', module: 'Hábitos', urgent: false },
  { label: 'Registrar gastos del fin de semana', module: 'Finanzas', urgent: false },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Dashboard" icon={LayoutDashboard} />

      <div className="px-6 pt-4 pb-6 space-y-8">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Buenos días, Ainhoa 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1 capitalize" suppressHydrationWarning>
            {formatDate(MOCK_DATE)}
          </p>
        </div>

        {/* Pending today */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pendiente hoy
          </h3>
          <div className="space-y-2">
            {MOCK_PENDING.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 bg-card rounded-[12px] px-4 py-3 border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)]"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${item.urgent ? 'bg-rojo-tierra' : 'bg-muted-foreground/30'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                </div>
                <span className="text-[11px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5 flex-shrink-0">
                  {item.module}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Module summary cards */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Resumen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {MOCK_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.slug}
                  className="bg-card rounded-[16px] px-5 py-4 border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] hover:shadow-[0_4px_20px_rgba(0,18,25,0.12)] transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-[8px] bg-secondary flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground leading-none">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                  {card.trend && (
                    <p
                      className={`text-[11px] mt-2 font-medium ${
                        card.trendUp === false
                          ? 'text-teal-brand'
                          : card.trendUp === true
                          ? 'text-rojo-tierra'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {card.trend}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
