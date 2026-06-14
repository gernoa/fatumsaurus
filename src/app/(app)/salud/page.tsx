import { Heart } from 'lucide-react'
import { ModuleHeader } from '@/components/layout/ModuleHeader'
import { SaludView } from '@/components/modules/salud/SaludView'

export default function SaludPage() {
  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title="Salud" icon={Heart} />
      <SaludView />
    </div>
  )
}
