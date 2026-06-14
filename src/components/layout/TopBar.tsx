'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Settings, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/contexts/sessionContext'

const MOCK_NOTIFICATIONS = { urgent: 0, pending: 0 }

export function TopBar() {
  const { user }  = useSession()
  const router    = useRouter()
  const avatarRef = useRef<HTMLButtonElement>(null)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [dropPos,    setDropPos]    = useState({ top: 0, right: 0 })
  const [loggingOut, setLoggingOut] = useState(false)

  const { urgent, pending } = MOCK_NOTIFICATIONS
  const hasBadge   = urgent > 0 || pending > 0
  const badgeCount = urgent > 0 ? urgent : pending
  const badgeColor = urgent > 0 ? 'bg-rojo-tierra' : 'bg-ambar'

  const initial = user.display_name.charAt(0).toUpperCase()

  const openMenu = useCallback(() => {
    const rect = avatarRef.current?.getBoundingClientRect()
    if (rect) {
      setDropPos({
        top:   rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
    setMenuOpen(true)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    setMenuOpen(false)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error al cerrar sesión')
      setLoggingOut(false)
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="flex-shrink-0 flex items-center justify-end px-6 border-b border-border/60 glass-subtle"
      style={{ height: 'var(--topbar-height)', zIndex: 'var(--z-sticky)' }}
    >
      <div className="flex items-center gap-3">

        {/* Campana de notificaciones */}
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={`Notificaciones${hasBadge ? ` — ${badgeCount} sin leer` : ''}`}
        >
          <Bell className="w-5 h-5" />
          {hasBadge && (
            <span className={cn(
              'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full',
              'text-white text-[10px] font-bold leading-none',
              'flex items-center justify-center px-[3px]',
              badgeColor
            )}>
              {badgeCount}
            </span>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            ref={avatarRef}
            onClick={menuOpen ? () => setMenuOpen(false) : openMenu}
            disabled={loggingOut}
            className={cn(
              'w-8 h-8 rounded-full bg-petroleo text-white',
              'text-sm font-semibold flex items-center justify-center',
              'hover:bg-teal-brand transition-colors focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50'
            )}
            aria-label="Menú de usuario"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {loggingOut
              ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              : initial
            }
          </button>

          {menuOpen && (
            <>
              {/* Backdrop — fixed, cubre toda la pantalla */}
              <div
                className="fixed inset-0"
                style={{ zIndex: 'var(--z-dropdown-backdrop)' }}
                onClick={() => setMenuOpen(false)}
              />

              {/* Dropdown — position: fixed para no quedar detrás de sticky headers */}
              <div
                className={cn(
                  'fixed w-48',
                  'glass rounded-[12px]',
                  'shadow-[0_8px_32px_oklch(0_0_0/0.18)]',
                  'py-1.5 overflow-hidden'
                )}
                style={{
                  top:   dropPos.top,
                  right: dropPos.right,
                  zIndex: 'var(--z-modal)',   /* z-modal (400) asegura que siempre esté al frente */
                }}
                role="menu"
              >
                {/* Nombre + email */}
                <div className="px-3 py-2.5 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground">{user.display_name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>

                <Link
                  href="/ajustes"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Ajustes
                </Link>

                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rojo-tierra hover:bg-secondary/60 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
