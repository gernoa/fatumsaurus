import { Wallet } from 'lucide-react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { FinanzasTabs } from '@/components/modules/finanzas/FinanzasTabs'

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Finanzas" icon={Wallet} />
      <FinanzasTabs />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
