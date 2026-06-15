import { type LucideIcon } from 'lucide-react'
import { UserControls } from './UserControls'

interface ModuleHeaderProps {
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
  description?: string
}

export function ModuleHeader({ title, icon: Icon, action, description }: ModuleHeaderProps) {
  return (
    <div
      className="sticky top-0 z-[--z-sticky] glass-subtle flex items-center justify-between px-6 border-b border-border/50"
      style={{ minHeight: 'var(--topbar-height)' }}
    >
      {/* Left: icon + title */}
      <div className="flex items-center gap-3 min-w-0 py-3">
        {Icon && (
          <div className="w-8 h-8 rounded-[8px] bg-secondary flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground leading-tight truncate">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>

      {/* Right: page action (optional) + user controls */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {action}
        <UserControls />
      </div>
    </div>
  )
}
