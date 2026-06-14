import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PatrimonioProvider } from '@/contexts/patrimonioContext'
import { InversionesProvider } from '@/contexts/inversionesContext'
import { GastosProvider } from '@/contexts/gastosContext'
import { ModuleColorsProvider } from '@/contexts/moduleColorsContext'
import { SessionProvider, type UserProfile } from '@/contexts/sessionContext'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_type, avatar_value, partner_id')
    .eq('id', user.id)
    .single()

  const { data: allProfilesData } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_type, avatar_value, partner_id')

  type RawProfile = { id: string; display_name: string | null; avatar_type: string | null; avatar_value: string | null; partner_id: string | null }

  const toProfile = (p: RawProfile, email = ''): UserProfile => ({
    id:           p.id,
    display_name: p.display_name ?? p.id.substring(0, 8),
    avatar_type:  p.avatar_type  ?? 'initial',
    avatar_value: p.avatar_value ?? null,
    email,
    partner_id:   p.partner_id   ?? null,
  })

  const userProfile = toProfile(
    profile ?? { id: user.id, display_name: user.email?.split('@')[0] ?? 'Usuario', avatar_type: 'initial', avatar_value: null, partner_id: null },
    user.email ?? ''
  )

  const allUsers: UserProfile[] = (allProfilesData ?? []).map((p) => toProfile(p))
  const partner: UserProfile | null = userProfile.partner_id
    ? (allUsers.find((u) => u.id === userProfile.partner_id) ?? null)
    : null

  return (
    <SessionProvider user={userProfile} allUsers={allUsers} partner={partner}>
    <GastosProvider>
    <PatrimonioProvider>
    <InversionesProvider>
    <ModuleColorsProvider>
      {/* Root shell with orbs */}
      <div className="relative flex h-screen overflow-hidden bg-background">

        {/* Orbs de fondo — CSS blur circles, no JS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
          {/* Teal grande — ocupa esquina top-right del área principal */}
          <div className="orb w-[660px] h-[660px] opacity-55"
               style={{ background: 'oklch(0.58 0.105 192)', top: '-160px', right: '-60px' }} />
          {/* Petroleo azul oscuro — cruza sidebar y área principal por abajo-izquierda */}
          <div className="orb w-[520px] h-[520px] opacity-55"
               style={{ background: 'oklch(0.24 0.058 209)', bottom: '-80px', left: '-80px' }} />
          {/* Ámbar dorado — acento cálido en el centro */}
          <div className="orb w-[340px] h-[340px] opacity-40"
               style={{ background: 'oklch(0.72 0.170 67)', top: '35%', right: '28%' }} />
        </div>

        <Sidebar />

        <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden z-[1]">
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            {children}
          </main>
        </div>

        <MobileNav />
      </div>
    </ModuleColorsProvider>
    </InversionesProvider>
    </PatrimonioProvider>
    </GastosProvider>
    </SessionProvider>
  )
}
