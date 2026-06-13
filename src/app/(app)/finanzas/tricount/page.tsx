import Link from 'next/link'
import { Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import {
  MOCK_TRICOUNT_GROUPS,
  MOCK_USERS,
  CURRENT_USER_ID,
  groupTotal,
  myNetInGroup,
} from '@/lib/mock-tricount'

function UserInitialCircle({ userId }: { userId: string }) {
  const user = MOCK_USERS[userId]
  return (
    <div className="w-6 h-6 rounded-full bg-petroleo text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
      {user?.initial ?? '?'}
    </div>
  )
}

export default function TricountPage() {
  const active = MOCK_TRICOUNT_GROUPS.filter((g) => !g.settled)
  const settled = MOCK_TRICOUNT_GROUPS.filter((g) => g.settled)

  return (
    <div className="px-6 pt-4 pb-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {active.length} grupos activos
        </p>
        <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-petroleo hover:bg-teal-brand rounded-[10px] transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo grupo
        </button>
      </div>

      {/* Active groups */}
      <div className="space-y-3">
        {active.map((group) => {
          const myNet = myNetInGroup(group)
          const total = groupTotal(group)
          return (
            <Link
              key={group.id}
              href={`/finanzas/tricount/${group.id}`}
              className="block bg-card rounded-[16px] border border-border shadow-[0_2px_12px_rgba(0,18,25,0.08)] hover:shadow-[0_4px_20px_rgba(0,18,25,0.12)] transition-shadow p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{group.name}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {group.participantIds.map((id) => (
                      <UserInitialCircle key={id} userId={id} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      {group.participantIds.map((id) => MOCK_USERS[id]?.name).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-base font-bold text-foreground">{formatCurrency(total)}</p>
                </div>
              </div>

              {/* My balance chip */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{group.expenses.length} gastos</span>
                <span
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    myNet > 0.01
                      ? 'bg-teal-brand/10 text-teal-brand'
                      : myNet < -0.01
                      ? 'bg-rojo-tierra/10 text-rojo-tierra'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {myNet > 0.01
                    ? `Te deben ${formatCurrency(myNet)}`
                    : myNet < -0.01
                    ? `Debes ${formatCurrency(Math.abs(myNet))}`
                    : 'Al día'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Settled groups */}
      {settled.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Saldados
          </p>
          {settled.map((group) => {
            const total = groupTotal(group)
            return (
              <Link
                key={group.id}
                href={`/finanzas/tricount/${group.id}`}
                className="flex items-center justify-between bg-card/60 rounded-[12px] border border-border px-4 py-3 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-teal-brand flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{group.name}</p>
                    <div className="flex gap-1.5 mt-0.5">
                      {group.participantIds.map((id) => (
                        <UserInitialCircle key={id} userId={id} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{formatCurrency(total)}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
