import { Settings } from 'lucide-react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { AjustesView } from '@/components/modules/ajustes/AjustesView'

export default function AjustesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Ajustes" icon={Settings} />
      <AjustesView />
    </div>
  )
}
