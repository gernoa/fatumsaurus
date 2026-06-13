import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PatrimonioProvider } from '@/contexts/patrimonioContext'
import { InversionesProvider } from '@/contexts/inversionesContext'
import { SessionProvider, type UserProfile } from '@/contexts/sessionContext'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch del perfil real desde la tabla profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_type, avatar_value')
    .eq('id', user.id)
    .single()

  const userProfile: UserProfile = {
    id:           user.id,
    display_name: profile?.display_name ?? user.email?.split('@')[0] ?? 'Usuario',
    avatar_type:  profile?.avatar_type  ?? 'initial',
    avatar_value: profile?.avatar_value ?? null,
    email:        user.email ?? '',
  }

  return (
    <SessionProvider user={userProfile}>
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
    </SessionProvider>
  )
}
