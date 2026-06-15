'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router  = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      toast.error(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : 'Error al iniciar sesión. Inténtalo de nuevo.'
      )
      return
    }

    // Sesión creada — el middleware redirige al dashboard
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="text-center mb-8">
        <p
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--arena)', fontFamily: 'var(--font-poppins)' }}
        >
          FATUMSAURUS
        </p>
        <p className="text-sm mt-1.5" style={{ color: 'var(--menta)' }}>
          Tu destino, tu orden
        </p>
      </div>

      {/* Card */}
      <div className="glass rounded-[20px] shadow-[0_8px_40px_rgba(0,18,25,0.25)] p-7">
        <h1 className="text-lg font-bold text-foreground mb-5">Iniciar sesión</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-[10px] border border-border',
                'bg-secondary/40 text-sm text-foreground',
                'placeholder:text-muted-foreground/50',
                'focus:outline-none focus:ring-2 focus:ring-petroleo/40 focus:border-petroleo',
                'disabled:opacity-50 transition'
              )}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={cn(
                  'w-full pl-3.5 pr-10 py-2.5 rounded-[10px] border border-border',
                  'bg-secondary/40 text-sm text-foreground',
                  'placeholder:text-muted-foreground/50',
                  'focus:outline-none focus:ring-2 focus:ring-petroleo/40 focus:border-petroleo',
                  'disabled:opacity-50 transition'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'py-2.5 mt-2 rounded-[10px] text-sm font-semibold text-white',
              'bg-petroleo hover:bg-teal-brand transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
