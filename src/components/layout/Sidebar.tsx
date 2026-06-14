'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULE_GROUPS, MODULES, MODULE_COLOR_NEUTRAL } from '@/lib/constants'
import type { ModuleDefinition } from '@/lib/constants'
import { useModuleColors } from '@/contexts/moduleColorsContext'

// ─── Logo brand mark ──────────────────────────────────────────────────────────

function BrandLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'flex items-center gap-2.5 flex-shrink-0 hover:opacity-85 transition-opacity',
        collapsed && 'justify-center'
      )}
      title="Dashboard"
    >
      {/* Logo image */}
      <div className="flex-shrink-0 w-8 h-8 relative">
        <Image
          src="/logo.png"
          alt="Fatumsaurus logo"
          fill
          sizes="32px"
          className="object-contain"
          priority
        />
      </div>

      {/* Word mark — hidden when collapsed */}
      {!collapsed && (
        <div className="leading-none select-none">
          <p className="text-[11px] font-bold tracking-[0.14em] text-sidebar-foreground/90 uppercase">
            FATUM
          </p>
          <p className="text-[11px] font-bold tracking-[0.14em] text-teal-brand uppercase">
            SAURUS
          </p>
        </div>
      )}
    </Link>
  )
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

interface NavItemProps {
  mod: ModuleDefinition
  active: boolean
  collapsed: boolean
}

function NavItem({ mod, active, collapsed }: NavItemProps) {
  const { getColor } = useModuleColors()
  const Icon    = mod.icon
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

// ─── Collapsible group ────────────────────────────────────────────────────────

interface GroupSectionProps {
  label: string
  groupId: string
  modules: ModuleDefinition[]
  collapsed: boolean
  activeCheck: (href: string) => boolean
}

function GroupSection({ label, modules, collapsed, activeCheck }: GroupSectionProps) {
  const [open, setOpen] = useState(true)

  if (modules.length === 0) return null

  return (
    <div>
      {!collapsed && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 hover:text-sidebar-foreground/55 transition-colors select-none"
        >
          <span>{label}</span>
          <ChevronDown
            className={cn('w-3 h-3 transition-transform duration-150', !open && '-rotate-90')}
          />
        </button>
      )}
      {open && modules.map((mod) => (
        <NavItem
          key={mod.slug}
          mod={mod}
          active={activeCheck(mod.href)}
          collapsed={collapsed}
        />
      ))}
    </div>
  )
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const {
    isEnabled, isFavorite, favorites, getGroup,
    groupOrder, isGroupVisible, allGroupIds,
  } = useModuleColors()

  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  // All displayable modules (excluding ajustes, excluding disabled)
  const visibleMods = useMemo(() =>
    MODULES.filter((m) => m.slug !== 'ajustes' && isEnabled(m.slug, m.canDisable)),
  [isEnabled])

  const calendarioMod = MODULES.find((m) => m.slug === 'calendario')!

  // Modules in favorites section (in favorites order, enabled)
  const favMods = useMemo(() =>
    favorites
      .map((slug) => visibleMods.find((m) => m.slug === slug))
      .filter(Boolean) as ModuleDefinition[],
  [favorites, visibleMods])

  // Modules NOT in favorites and NOT calendario
  const ungroupedMods = useMemo(() =>
    visibleMods.filter((m) => m.slug !== 'calendario' && !isFavorite(m.slug)),
  [visibleMods, isFavorite])

  // Build effective group label map
  const groupLabelMap = useMemo(() => {
    const map: Record<string, string> = {}
    allGroupIds.forEach((g) => { map[g.id] = g.label })
    return map
  }, [allGroupIds])

  // For each group (in user's order), build the module list
  const orderedGroups = useMemo(() => {
    return groupOrder
      .filter((id) => isGroupVisible(id))
      .map((id) => {
        const label = groupLabelMap[id] ?? id
        // Modules assigned to this group: via user override OR default constant
        const mods = ungroupedMods.filter((m) => {
          const override = getGroup(m.slug)
          if (override !== null) return override === id
          const defaultGroup = MODULE_GROUPS.find((g) => g.modulesSlugs.includes(m.slug))
          return defaultGroup?.id === id
        })
        return { id, label, mods }
      })
      .filter((g) => g.mods.length > 0)
  }, [groupOrder, isGroupVisible, ungroupedMods, getGroup, groupLabelMap])

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
          isCollapsed ? 'justify-center py-4' : 'justify-between py-4 pl-4'
        )}
        style={{ minHeight: 'var(--topbar-height)' }}
      >
        {/* Logo only when expanded; just icon when collapsed */}
        {isCollapsed ? (
          <Link href="/dashboard" className="w-8 h-8 relative" title="Dashboard">
            <Image src="/logo.png" alt="" fill sizes="32px" className="object-contain" priority />
          </Link>
        ) : (
          <BrandLogo collapsed={false} />
        )}

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-border transition-colors flex-shrink-0"
            title="Colapsar sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-border transition-colors"
            title="Expandir sidebar"
          >
            <PanelLeftOpen className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 relative">

        {/* Favoritos */}
        {favMods.length > 0 && (
          <>
            {!isCollapsed && (
              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 select-none">
                Favoritos
              </p>
            )}
            {favMods.map((mod) => (
              <NavItem key={mod.slug} mod={mod} active={isActive(mod.href)} collapsed={isCollapsed} />
            ))}
            <div className="mx-3 my-2 border-t border-sidebar-border" />
          </>
        )}

        {/* Calendario — siempre visible, standalone */}
        <NavItem mod={calendarioMod} active={isActive(calendarioMod.href)} collapsed={isCollapsed} />

        {/* Divider before groups */}
        {orderedGroups.length > 0 && (
          <div className="mx-3 my-2 border-t border-sidebar-border" />
        )}

        {/* Module groups */}
        {orderedGroups.map((g) => (
          <GroupSection
            key={g.id}
            label={g.label}
            groupId={g.id}
            modules={g.mods}
            collapsed={isCollapsed}
            activeCheck={isActive}
          />
        ))}
      </nav>
    </aside>
  )
}
