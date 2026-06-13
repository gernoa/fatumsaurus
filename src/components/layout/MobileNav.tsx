'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MODULES, MOCK_FAVORITES, MODULE_COLOR_NEUTRAL } from '@/lib/constants'
import type { ModuleDefinition } from '@/lib/constants'

export function MobileNav() {
  const pathname = usePathname()

  const favoriteModules = MOCK_FAVORITES
    .slice(0, 5)
    .map((slug) => MODULES.find((m) => m.slug === slug))
    .filter(Boolean) as ModuleDefinition[]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {favoriteModules.map((mod) => {
          const Icon = mod.icon
          const active = isActive(mod.href)
          return (
            <Link
              key={mod.slug}
              href={mod.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-[10px] min-w-0 flex-1',
                'transition-colors duration-150',
                active
                  ? 'text-sidebar-foreground'
                  : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70'
              )}
              aria-label={mod.name}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                style={{ color: active ? 'var(--arena)' : MODULE_COLOR_NEUTRAL }}
              />
              <span
                className={cn(
                  'text-[10px] truncate max-w-full leading-tight',
                  active ? 'font-semibold' : 'font-medium'
                )}
              >
                {mod.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
