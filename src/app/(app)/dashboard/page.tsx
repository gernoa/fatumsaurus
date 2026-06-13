import { LayoutDashboard } from 'lucide-react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { DashboardView } from '@/components/modules/dashboard/DashboardView'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Dashboard" icon={LayoutDashboard} />
      <DashboardView />
    </div>
  )
}
