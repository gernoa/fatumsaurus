'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Settings, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/contexts/sessionContext'

export function UserControls() {
  const { user }  = useSession()
  const router    = useRouter()
  const btnRef    = useRef<HTMLButtonElement>(null)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [menuPos,    setMenuPos]    = useState<{ top: number; right: number }>({ top: 0, right: 0 })
  const [loggingOut, setLoggingOut] = useState(false)

  const initial = user.display_name.charAt(0).toUpperCase()

  function handleOpenMenu() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setMenuOpen(true)
  }

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
    <div className="flex items-center gap-2 flex-shrink-0">
      {/* Campana */}
      <button
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <button
        ref={btnRef}
        onClick={handleOpenMenu}
        disabled={loggingOut}
        className={cn(
          'w-8 h-8 rounded-full bg-petroleo text-white',
          'text-sm font-semibold flex items-center justify-center',
          'hover:bg-teal-brand transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
          {/* Backdrop — captura clicks fuera del menú */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 'var(--z-dropdown-backdrop)' }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Menú — position: fixed escapa cualquier stacking context */}
          <div
            className="fixed w-48 bg-card border border-border rounded-[12px] shadow-[0_4px_20px_rgba(0,18,25,0.15)] py-1.5 overflow-hidden"
            style={{ zIndex: 'var(--z-dropdown)', top: menuPos.top, right: menuPos.right }}
            role="menu"
          >
            <div className="px-3 py-2.5 border-b border-border mb-1">
              <p className="text-sm font-semibold text-foreground">{user.display_name}</p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
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
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rojo-tierra hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}
