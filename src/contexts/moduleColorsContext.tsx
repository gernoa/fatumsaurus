'use client'

import { createContext, useContext, useState, useCallback } from 'react'

// Los 17 tonos de la paleta curada de Fatumsaurus (CLAUDE.md §3)
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

// null = sin color → muestra gris neutro
type ModuleColors = Record<string, string | null>

interface ModuleColorsCtx {
  colors:       ModuleColors
  getColor:     (slug: string) => string | null
  setColor:     (slug: string, hex: string | null) => void
  isColorTaken: (hex: string, excludeSlug?: string) => boolean
}

const Ctx = createContext<ModuleColorsCtx | null>(null)

export function ModuleColorsProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ModuleColors>({})

  const getColor = useCallback((slug: string) => colors[slug] ?? null, [colors])

  const setColor = useCallback((slug: string, hex: string | null) => {
    setColors((prev) => ({ ...prev, [slug]: hex }))
  }, [])

  const isColorTaken = useCallback((hex: string, excludeSlug?: string) => {
    return Object.entries(colors).some(([slug, c]) => c === hex && slug !== excludeSlug)
  }, [colors])

  return (
    <Ctx.Provider value={{ colors, getColor, setColor, isColorTaken }}>
      {children}
    </Ctx.Provider>
  )
}

export function useModuleColors() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useModuleColors must be used inside ModuleColorsProvider')
  return ctx
}
