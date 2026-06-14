'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULE_GROUPS, MODULES, MOCK_FAVORITES, MODULE_COLOR_NEUTRAL } from '@/lib/constants'
import type { ModuleDefinition } from '@/lib/constants'
import { useModuleColors } from '@/contexts/moduleColorsContext'

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const favoriteModules = MOCK_FAVORITES
    .map((slug) => MODULES.find((m) => m.slug === slug))
    .filter(Boolean) as ModuleDefinition[]

  const calendarioMod = MODULES.find((m) => m.slug === 'calendario')!

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col bg-sidebar flex-shrink-0',
        'backdrop-blur-xl backdrop-saturate-150',
        'border-r border-sidebar-border',
        'transition-[width] duration-150 ease-out',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          'flex items-center px-3 flex-shrink-0 border-b border-sidebar-border',
          isCollapsed ? 'justify-center py-4' : 'justify-between py-4'
        )}
        style={{ minHeight: 'var(--topbar-height)' }}
      >
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="font-bold text-xs tracking-[0.08em] text-sidebar-foreground hover:text-white transition-colors"
          >
            FATUMSAURUS
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-border transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Scrollable nav area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">

        {/* Favoritos */}
        {!isCollapsed && favoriteModules.length > 0 && (
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 select-none">
            Favoritos
          </p>
        )}
        {favoriteModules.map((mod) => (
          <NavItem key={mod.slug} mod={mod} active={isActive(mod.href)} collapsed={isCollapsed} />
        ))}

        {/* Divider */}
        <div className="mx-3 my-2 border-t border-sidebar-border" />

        {/* Calendario — standalone, always visible */}
        <NavItem mod={calendarioMod} active={isActive(calendarioMod.href)} collapsed={isCollapsed} />

        {/* Divider */}
        <div className="mx-3 my-2 border-t border-sidebar-border" />

        {/* Module groups */}
        {MODULE_GROUPS.map((group) => {
          const isGroupCollapsed = collapsedGroups.has(group.id)
          return (
            <div key={group.id}>
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 hover:text-sidebar-foreground/55 transition-colors select-none"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 transition-transform duration-150',
                      isGroupCollapsed && '-rotate-90'
                    )}
                  />
                </button>
              )}
              {!isGroupCollapsed &&
                group.modulesSlugs.map((slug) => {
                  const mod = MODULES.find((m) => m.slug === slug)
                  if (!mod) return null
                  return (
                    <NavItem
                      key={slug}
                      mod={mod}
                      active={isActive(mod.href)}
                      collapsed={isCollapsed}
                    />
                  )
                })}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

interface NavItemProps {
  mod: ModuleDefinition
  active: boolean
  collapsed: boolean
}

function NavItem({ mod, active, collapsed }: NavItemProps) {
  const { getColor } = useModuleColors()
  const Icon = mod.icon
  const modColor = getColor(mod.slug)

  return (
    <Link
      href={mod.href}
      title={collapsed ? mod.name : undefined}
      aria-label={collapsed ? mod.name : undefined}
      className={cn(
        'flex items-center rounded-[10px] transition-colors duration-150 text-sm font-medium',
        collapsed
          ? 'justify-center w-10 h-10 mx-auto'
          : 'gap-3 px-3.5 py-2.5 w-full',
        active
          ? 'bg-[var(--sidebar-item-active-bg)] text-sidebar-foreground font-semibold'
          : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-[var(--sidebar-item-hover-bg)]'
      )}
    >
      <Icon
        className="w-4 h-4 flex-shrink-0"
        style={{ color: active ? 'var(--arena)' : (modColor ?? MODULE_COLOR_NEUTRAL) }}
      />
      {!collapsed && <span className="truncate">{mod.name}</span>}
    </Link>
  )
}
