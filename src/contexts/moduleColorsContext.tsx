'use client'

import {
  createContext, useContext, useState, useCallback, useEffect,
} from 'react'
import { MODULE_GROUPS } from '@/lib/constants'

// ─── Palette ──────────────────────────────────────────────────────────────────

export const MODULE_PALETTE = [
  { name: 'Noche',    hex: '#001219' },
  { name: 'Abismo',   hex: '#004E60' },
  { name: 'Petróleo', hex: '#005F73' },
  { name: 'Teal',     hex: '#0A9396' },
  { name: 'Menta',    hex: '#94D2BD' },
  { name: 'Trigo',    hex: '#C8B882' },
  { name: 'Arena',    hex: '#E9D8A6' },
  { name: 'Ámbar',    hex: '#EE9B00' },
  { name: 'Miel',     hex: '#D97E02' },
  { name: 'Naranja',  hex: '#CA6702' },
  { name: 'Cobre',    hex: '#BB3E03' },
  { name: 'Rojo',     hex: '#AE2012' },
  { name: 'Rubí',     hex: '#A01B1F' },
  { name: 'Carmesí',  hex: '#9B2226' },
  { name: 'Caoba',    hex: '#7E3A1E' },
  { name: 'Forest',   hex: '#2D5A3D' },
  { name: 'Oliva',    hex: '#7A8C2A' },
] as const

export type PaletteColor = typeof MODULE_PALETTE[number]

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredPrefs {
  colors:       Record<string, string | null>  // slug → hex | null
  enabled:      Record<string, boolean>        // slug → true/false
  groups:       Record<string, string | null>  // slug → groupId override | null = default
  favorites:    string[]                       // ordered list of fav slugs (max 5)
  groupOrder:   string[]                       // ordered list of group IDs
  groupVisible: Record<string, boolean>        // groupId → visible (default true)
}

interface ModuleColorsCtx {
  // Colors
  getColor:     (slug: string) => string | null
  setColor:     (slug: string, hex: string | null) => void
  isColorTaken: (hex: string, excludeSlug?: string) => boolean

  // Enabled
  isEnabled:  (slug: string, canDisable: boolean) => boolean
  setEnabled: (slug: string, val: boolean) => void

  // Groups (per-module override)
  getGroup: (slug: string) => string | null
  setGroup: (slug: string, groupId: string | null) => void

  // All group ids available (default + custom user-created)
  allGroupIds: { id: string; label: string }[]
  addGroup:    (id: string, label: string) => void

  // Favorites
  favorites:      string[]
  isFavorite:     (slug: string) => boolean
  toggleFavorite: (slug: string) => void

  // Group order & visibility
  groupOrder:      string[]
  setGroupOrder:   (ids: string[]) => void
  isGroupVisible:  (id: string) => boolean
  setGroupVisible: (id: string, visible: boolean) => void
}

const Ctx = createContext<ModuleColorsCtx | null>(null)

const STORAGE_KEY        = 'fatumsaurus-module-prefs'
const CUSTOM_GROUPS_KEY  = 'fatumsaurus-custom-groups'
const MAX_FAVORITES      = 5

function defaultPrefs(): StoredPrefs {
  return {
    colors:       {},
    enabled:      {},
    groups:       {},
    favorites:    [],
    groupOrder:   [],
    groupVisible: {},
  }
}

function loadPrefs(): StoredPrefs {
  if (typeof window === 'undefined') return defaultPrefs()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPrefs()
    return { ...defaultPrefs(), ...(JSON.parse(raw) as Partial<StoredPrefs>) }
  } catch {
    return defaultPrefs()
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ModuleColorsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<StoredPrefs>(defaultPrefs)
  const [customGroups, setCustomGroups] = useState<{ id: string; label: string }[]>([])

  useEffect(() => {
    setPrefs(loadPrefs())
    try {
      const raw = localStorage.getItem(CUSTOM_GROUPS_KEY)
      if (raw) setCustomGroups(JSON.parse(raw) as { id: string; label: string }[])
    } catch { /* ignore */ }
  }, [])

  function persist(next: StoredPrefs) {
    setPrefs(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  // ── Colors ────────────────────────────────────────────────────────────────

  const getColor = useCallback((slug: string) => prefs.colors[slug] ?? null, [prefs])

  const setColor = useCallback((slug: string, hex: string | null) => {
    persist({ ...prefs, colors: { ...prefs.colors, [slug]: hex } })
  }, [prefs])

  const isColorTaken = useCallback((hex: string, excludeSlug?: string) =>
    Object.entries(prefs.colors).some(([slug, c]) => c === hex && slug !== excludeSlug),
  [prefs])

  // ── Enabled ───────────────────────────────────────────────────────────────

  const isEnabled = useCallback((slug: string, canDisable: boolean) => {
    if (!canDisable) return true
    return prefs.enabled[slug] !== false
  }, [prefs])

  const setEnabled = useCallback((slug: string, val: boolean) => {
    persist({ ...prefs, enabled: { ...prefs.enabled, [slug]: val } })
  }, [prefs])

  // ── Groups (per-module) ───────────────────────────────────────────────────

  const getGroup = useCallback((slug: string) => prefs.groups[slug] ?? null, [prefs])

  const setGroup = useCallback((slug: string, groupId: string | null) => {
    persist({ ...prefs, groups: { ...prefs.groups, [slug]: groupId } })
  }, [prefs])

  const allGroupIds = [
    ...MODULE_GROUPS.map((g) => ({ id: g.id, label: g.label })),
    ...customGroups,
  ]

  const addGroup = useCallback((id: string, label: string) => {
    const next = [...customGroups, { id, label }]
    setCustomGroups(next)
    try { localStorage.setItem(CUSTOM_GROUPS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [customGroups])

  // ── Favorites ─────────────────────────────────────────────────────────────

  const favorites = prefs.favorites

  const isFavorite = useCallback((slug: string) => prefs.favorites.includes(slug), [prefs])

  const toggleFavorite = useCallback((slug: string) => {
    const current = prefs.favorites
    let next: string[]
    if (current.includes(slug)) {
      next = current.filter((s) => s !== slug)
    } else {
      if (current.length >= MAX_FAVORITES) return  // max reached
      next = [...current, slug]
    }
    persist({ ...prefs, favorites: next })
  }, [prefs])

  // ── Group order & visibility ──────────────────────────────────────────────

  // Effective order: stored order, then any groups not yet in order appended
  const baseGroupIds = allGroupIds.map((g) => g.id)
  const storedOrder  = prefs.groupOrder.filter((id) => baseGroupIds.includes(id))
  const notInOrder   = baseGroupIds.filter((id) => !storedOrder.includes(id))
  const groupOrder   = [...storedOrder, ...notInOrder]

  const setGroupOrder = useCallback((ids: string[]) => {
    persist({ ...prefs, groupOrder: ids })
  }, [prefs])

  const isGroupVisible = useCallback((id: string) =>
    prefs.groupVisible[id] !== false,  // default: visible
  [prefs])

  const setGroupVisible = useCallback((id: string, visible: boolean) => {
    persist({ ...prefs, groupVisible: { ...prefs.groupVisible, [id]: visible } })
  }, [prefs])

  return (
    <Ctx.Provider value={{
      getColor, setColor, isColorTaken,
      isEnabled, setEnabled,
      getGroup, setGroup, allGroupIds, addGroup,
      favorites, isFavorite, toggleFavorite,
      groupOrder, setGroupOrder,
      isGroupVisible, setGroupVisible,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useModuleColors() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useModuleColors must be used inside ModuleColorsProvider')
  return ctx
}
