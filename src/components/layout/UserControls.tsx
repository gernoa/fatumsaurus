'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_USER = {
  name: 'Ainhoa',
  initial: 'A',
  notifications: { urgent: 2, pending: 3 },
}

export function UserControls() {
  const [menuOpen, setMenuOpen] = useState(false)

  const { urgent, pending } = MOCK_USER.notifications
  const hasBadge = urgent > 0 || pending > 0
  const badgeCount = urgent > 0 ? urgent : pending
  const badgeColor = urgent > 0 ? 'bg-rojo-tierra' : 'bg-ambar'

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Notification bell */}
      <button
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label={`Notificaciones${hasBadge ? ` — ${badgeCount} sin leer` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {hasBadge && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full',
              'text-white text-[10px] font-bold leading-none',
              'flex items-center justify-center px-[3px]',
              badgeColor
            )}
          >
            {badgeCount}
          </span>
        )}
      </button>

      {/* Avatar + dropdown */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            'w-8 h-8 rounded-full bg-petroleo text-white',
            'text-sm font-semibold flex items-center justify-center',
            'hover:bg-teal-brand transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Menú de usuario"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          {MOCK_USER.initial}
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 'var(--z-modal-backdrop)' }}
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-[12px] shadow-[0_4px_20px_rgba(0,18,25,0.12)] py-1.5 overflow-hidden"
              style={{ zIndex: 'var(--z-dropdown)' }}
              role="menu"
            >
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold text-foreground">{MOCK_USER.name}</p>
              </div>
              <Link
                href="/ajustes"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Ajustes
              </Link>
              <button
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rojo-tierra hover:bg-secondary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
