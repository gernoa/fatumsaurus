import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { PatrimonioProvider } from '@/contexts/patrimonioContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatrimonioProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </PatrimonioProvider>
  )
}
