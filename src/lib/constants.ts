import {
  Calendar,
  Home,
  Utensils,
  Car,
  Wallet,
  Gift,
  Heart,
  Sparkles,
  Repeat2,
  Target,
  Plane,
  MapPin,
  Film,
  Briefcase,
  GraduationCap,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface ModuleDefinition {
  slug: string
  name: string
  href: string
  icon: LucideIcon
  /** Dashboard and Calendario cannot be disabled */
  canDisable: boolean
}

export interface ModuleGroup {
  id: string
  label: string
  modulesSlugs: string[]
}

export const MODULES: ModuleDefinition[] = [
  { slug: 'calendario',    name: 'Calendario',  href: '/calendario',    icon: Calendar,       canDisable: false },
  { slug: 'hogar',         name: 'Hogar',        href: '/hogar',         icon: Home,           canDisable: true  },
  { slug: 'comida',        name: 'Comida',       href: '/comida',        icon: Utensils,       canDisable: true  },
  { slug: 'vehiculos',     name: 'Vehículos',    href: '/vehiculos',     icon: Car,            canDisable: true  },
  { slug: 'finanzas',      name: 'Finanzas',     href: '/finanzas',      icon: Wallet,         canDisable: true  },
  { slug: 'gifts',         name: 'Gifts',        href: '/gifts',         icon: Gift,           canDisable: true  },
  { slug: 'salud',         name: 'Salud',        href: '/salud',         icon: Heart,          canDisable: true  },
  { slug: 'bienestar',     name: 'Bienestar',    href: '/bienestar',     icon: Sparkles,       canDisable: true  },
  { slug: 'habitos',       name: 'Hábitos',      href: '/habitos',       icon: Repeat2,        canDisable: true  },
  { slug: 'objetivos',     name: 'Objetivos',    href: '/objetivos',     icon: Target,         canDisable: true  },
  { slug: 'viajes',        name: 'Viajes',       href: '/viajes',        icon: Plane,          canDisable: true  },
  { slug: 'lugares',       name: 'Lugares',      href: '/lugares',       icon: MapPin,         canDisable: true  },
  { slug: 'septimo-arte',  name: '7º Arte',      href: '/septimo-arte',  icon: Film,           canDisable: true  },
  { slug: 'trabajo',       name: 'Trabajo',      href: '/trabajo',       icon: Briefcase,      canDisable: true  },
  { slug: 'estudios',      name: 'Estudios',     href: '/estudios',      icon: GraduationCap,  canDisable: true  },
  { slug: 'ajustes',       name: 'Ajustes',      href: '/ajustes',       icon: Settings,       canDisable: false },
]

export const MODULE_GROUPS: ModuleGroup[] = [
  { id: 'hogar-vida',        label: 'Hogar y Vida',       modulesSlugs: ['hogar', 'comida', 'vehiculos'] },
  { id: 'finanzas',          label: 'Finanzas',            modulesSlugs: ['finanzas', 'gifts'] },
  { id: 'personal',          label: 'Personal',            modulesSlugs: ['salud', 'bienestar', 'habitos', 'objetivos'] },
  { id: 'explorar',          label: 'Explorar',            modulesSlugs: ['viajes', 'lugares', 'septimo-arte'] },
  { id: 'trabajo-estudios',  label: 'Trabajo y Estudios',  modulesSlugs: ['trabajo', 'estudios'] },
]

/** Mock favorites — will come from user_module_preferences in Supabase */
export const MOCK_FAVORITES = ['finanzas', 'hogar', 'habitos', 'salud', 'viajes']

/** Applied to module icons when no color is configured by the user */
export const MODULE_COLOR_NEUTRAL = 'oklch(0.65 0 0)'
