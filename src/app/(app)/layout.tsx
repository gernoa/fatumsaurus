import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PatrimonioProvider } from '@/contexts/patrimonioContext'
import { InversionesProvider } from '@/contexts/inversionesContext'
import { GastosProvider } from '@/contexts/gastosContext'
import { SessionProvider, type UserProfile } from '@/contexts/sessionContext'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch del perfil del usuario actual (incluyendo partner_id)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_type, avatar_value, partner_id')
    .eq('id', user.id)
    .single()

  // Fetch de todos los perfiles de la app
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
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
      </InversionesProvider>
      </PatrimonioProvider>
      </GastosProvider>
    </SessionProvider>
  )
}
