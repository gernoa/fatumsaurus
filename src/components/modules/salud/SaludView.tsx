'use client'

import { useState } from 'react'
import { Stethoscope, Users2, Pill, BookOpen, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModuleColors } from '@/contexts/moduleColorsContext'
import { CitasView } from './CitasView'
import { EspecialistasView } from './EspecialistasView'
import { MedicamentosView } from './MedicamentosView'
import { HistorialView } from './HistorialView'
import { DocumentosView } from './DocumentosView'

type Tab = 'citas' | 'especialistas' | 'medicamentos' | 'historial' | 'documentos'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'citas',          label: 'Citas',          icon: Stethoscope },
  { id: 'especialistas',  label: 'Especialistas',  icon: Users2 },
  { id: 'medicamentos',   label: 'Medicamentos',   icon: Pill },
  { id: 'historial',      label: 'Historial',      icon: BookOpen },
  { id: 'documentos',     label: 'Documentos',     icon: FolderOpen },
]

export function SaludView() {
  const [active, setActive] = useState<Tab>('citas')
  const { getColor } = useModuleColors()
  const modColor = getColor('salud') ?? '#0A9396'

  return (
    <div className="flex flex-col min-h-full">
      {/* Tab bar */}
      <div
        className="glass-subtle border-b border-border/50 overflow-x-auto scrollbar-none flex-shrink-0 sticky z-[--z-sticky]"
        style={{ top: 'var(--topbar-height)' }}
      >
        <div className="flex px-6 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'text-petroleo'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: modColor }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-10">
        {active === 'citas'         && <CitasView />}
        {active === 'especialistas' && <EspecialistasView />}
        {active === 'medicamentos'  && <MedicamentosView />}
        {active === 'historial'     && <HistorialView />}
        {active === 'documentos'    && <DocumentosView />}
      </div>
    </div>
  )
}
