import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { MOCK_TRICOUNT_GROUPS, groupTotal } from '@/lib/mock-tricount'
import { formatCurrency } from '@/lib/format'
import { TricountGroupView } from '@/components/modules/finanzas/tricount/TricountGroupView'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TricountGroupPage({ params }: Props) {
  const { id } = await params
  const group = MOCK_TRICOUNT_GROUPS.find((g) => g.id === id)

  if (!group) notFound()

  const total = groupTotal(group)

  return (
    <div>
      {/* Back + group title */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-border bg-background">
        <Link
          href="/finanzas/tricount"
          className="p-1.5 -ml-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Volver a Tricount"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-semibold text-foreground leading-tight">{group.name}</h2>
          <p className="text-xs text-muted-foreground">Total {formatCurrency(total)}</p>
        </div>
        {group.settled && (
          <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-brand/10 text-teal-brand">
            Saldado
          </span>
        )}
      </div>

      <TricountGroupView group={group} />
    </div>
  )
}

export function generateStaticParams() {
  return MOCK_TRICOUNT_GROUPS.map((g) => ({ id: g.id }))
}
