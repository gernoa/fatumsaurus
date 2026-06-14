'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Resumen',     href: '/finanzas',             exact: true  },
  { label: 'Gastos',      href: '/finanzas/gastos',      exact: false },
  { label: 'Análisis',    href: '/finanzas/analisis',    exact: false },
  { label: 'Inversiones', href: '/finanzas/inversiones', exact: false },
  { label: 'Patrimonio',  href: '/finanzas/patrimonio',  exact: false },
  { label: 'Deudas',      href: '/finanzas/deudas',      exact: false },
]

export function FinanzasTabs() {
  const pathname = usePathname()

  return (
    <div
      className="sticky glass-subtle border-b border-border/50 overflow-x-auto scrollbar-none flex-shrink-0"
      style={{ top: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
    >
      <nav className="flex gap-0 px-6 min-w-max">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:transition-colors',
                active
                  ? 'text-petroleo after:bg-petroleo'
                  : 'text-muted-foreground hover:text-foreground after:bg-transparent'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
