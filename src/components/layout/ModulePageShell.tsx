import { type LucideIcon } from 'lucide-react'
import { ModuleHeader } from './ModuleHeader'

interface ModulePageShellProps {
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
  description?: string
  children?: React.ReactNode
}

export function ModulePageShell({
  title,
  icon,
  action,
  description,
  children,
}: ModulePageShellProps) {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title={title} icon={icon} action={action} description={description} />
      <div className="flex-1 px-6 pt-4 pb-6">
        {children ?? (
          <div className="flex items-center justify-center h-48 rounded-[16px] border border-dashed border-border bg-secondary/40">
            <p className="text-sm text-muted-foreground font-medium">Próximamente</p>
          </div>
        )}
      </div>
    </div>
  )
}
