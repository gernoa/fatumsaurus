'use client'

import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, Pencil, Minus, BarChart2, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  getProductStats,
  getPortfolioTotals,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_EMOJIS,
  type InversionProduct,
  type ProductoStats,
} from '@/lib/inversiones'
import { useInversiones } from '@/contexts/inversionesContext'
import { APP_USERS, CURRENT_USER_ID, getUser } from '@/lib/users'
import { NuevoProductoModal } from './NuevoProductoModal'
import { AportacionModal }    from './AportacionModal'
import { ValoracionModal }    from './ValoracionModal'

type View = 'mia' | 'pareja' | 'conjunta'

const PARTNER = APP_USERS.find((u) => u.id !== CURRENT_USER_ID && u.id !== 'madre')
  ?? { id: 'javier', name: 'Javier', initial: 'J' }

export function InversionesView() {
  const { products, aportaciones, valoraciones, addProduct, updateProduct, addAportaciones, addValoraciones } =
    useInversiones()

  const [view,           setView]           = useState<View>('mia')
  const [showProducto,   setShowProducto]   = useState(false)
  const [editingProduct, setEditingProduct] = useState<InversionProduct | undefined>()
  const [showAportacion, setShowAportacion] = useState(false)
  const [showValoracion, setShowValoracion] = useState(false)

  // ─── Derived ──────────────────────────────────────────────────────────────

  const activeProducts = products.filter((p) => p.isActive)

  const viewProducts = useMemo(() => {
    if (view === 'mia')     return activeProducts.filter((p) => p.ownerId === CURRENT_USER_ID)
    if (view === 'pareja')  return activeProducts.filter((p) => p.ownerId === PARTNER.id)
    return activeProducts   // conjunta: all
  }, [activeProducts, view])

  const statsFor = (p: InversionProduct, userId: string): ProductoStats =>
    getProductStats(p, userId, aportaciones, valoraciones)

  const allStats: ProductoStats[] = viewProducts.map((p) =>
    statsFor(p, p.ownerId)
  )

  const totals = useMemo(() => getPortfolioTotals(allStats), [allStats])

  // Map for ValoracionModal (needs access to current stats)
  const statsByProductUser = useMemo(() => {
    const map = new Map<string, ProductoStats>()
    activeProducts.forEach((p) => {
      const s = statsFor(p, p.ownerId)
      map.set(`${p.id}:${p.ownerId}`, s)
    })
    return map
  }, [activeProducts, aportaciones, valoraciones])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleAddProduct(data: Omit<InversionProduct, 'id'>) {
    if (editingProduct) {
      updateProduct(editingProduct.id, data)
      toast.success('Producto actualizado')
    } else {
      addProduct(data)
      toast.success('Producto añadido')
    }
    setShowProducto(false)
    setEditingProduct(undefined)
  }

  function handleEditProduct(p: InversionProduct) {
    setEditingProduct(p)
    setShowProducto(true)
  }

  function handleSaveAportaciones(items: Parameters<typeof addAportaciones>[0]) {
    addAportaciones(items)
    toast.success(`${items.length} aportación${items.length !== 1 ? 'es' : ''} guardada${items.length !== 1 ? 's' : ''}`)
    setShowAportacion(false)
  }

  function handleSaveValoraciones(items: Parameters<typeof addValoraciones>[0]) {
    addValoraciones(items)
    toast.success(`${items.length} valoración${items.length !== 1 ? 'es' : ''} actualizada${items.length !== 1 ? 's' : ''}`)
    setShowValoracion(false)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const viewLabels: Record<View, string> = {
    mia:      `Mi cartera`,
    pareja:   PARTNER.name,
    conjunta: 'Conjunta',
  }

  return (
    <>
      <div className="px-6 pt-4 pb-24 space-y-5">

        {/* View selector */}
        <div className="flex gap-1.5 bg-secondary/60 rounded-[12px] p-1">
          {(['mia', 'pareja', 'conjunta'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'flex-1 py-2 text-xs font-semibold rounded-[9px] transition-all',
                view === v
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>

        {/* Summary card */}
        <SummaryCard totals={totals} viewLabel={viewLabels[view]} />

        {/* Products */}
        {viewProducts.length === 0 ? (
          <EmptyState onAddProduct={() => setShowProducto(true)} />
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Productos
              {view === 'conjunta' && (
                <span className="ml-1 font-normal normal-case">
                  ({CURRENT_USER_ID === 'ainhoa' ? 'Ainhoa' : ''}
                  {' + '}
                  {PARTNER.name})
                </span>
              )}
            </p>
            {viewProducts.map((p) => {
              const stats = statsFor(p, p.ownerId)
              return (
                <ProductCard
                  key={p.id}
                  stats={stats}
                  showOwner={view === 'conjunta'}
                  onEdit={() => handleEditProduct(p)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 pointer-events-none z-40">
        <div className="max-w-2xl mx-auto px-6 pb-4 pointer-events-auto">
          <div className="flex gap-2 bg-card/90 backdrop-blur-md rounded-[16px] border border-border shadow-lg p-2">
            <button
              onClick={() => { setEditingProduct(undefined); setShowProducto(true) }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Producto
            </button>
            <button
              onClick={() => setShowAportacion(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold text-white bg-petroleo hover:bg-teal-brand transition-colors"
            >
              <WalletCards className="w-3.5 h-3.5" />
              Registrar aportación
            </button>
            <button
              onClick={() => setShowValoracion(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] text-xs font-semibold text-petroleo bg-petroleo/10 hover:bg-petroleo/15 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Actualizar valor
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProducto && (
        <NuevoProductoModal
          initial={editingProduct}
          onSave={handleAddProduct}
          onClose={() => { setShowProducto(false); setEditingProduct(undefined) }}
        />
      )}
      {showAportacion && (
        <AportacionModal
          products={activeProducts}
          onSave={handleSaveAportaciones}
          onClose={() => setShowAportacion(false)}
        />
      )}
      {showValoracion && (
        <ValoracionModal
          products={activeProducts}
          statsByProductUser={statsByProductUser}
          onSave={handleSaveValoraciones}
          onClose={() => setShowValoracion(false)}
        />
      )}
    </>
  )
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  totals,
  viewLabel,
}: {
  totals:    ReturnType<typeof getPortfolioTotals>
  viewLabel: string
}) {
  const { totalAportado, valorActual, ganancia, rentabilidad } = totals
  const sinVals = valorActual === null

  return (
    <div className="bg-petroleo rounded-[16px] p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
        {viewLabel}
      </p>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] text-white/60 mb-0.5">Valor actual</p>
          <p className="text-3xl font-bold tracking-tight">
            {sinVals ? '—' : formatCurrency(valorActual)}
          </p>
        </div>

        {rentabilidad !== null && (
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-sm font-semibold flex-shrink-0 mt-1',
            rentabilidad >= 0
              ? 'bg-white/15 text-white'
              : 'bg-rojo-tierra/30 text-white'
          )}>
            {rentabilidad >= 0
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />
            }
            {rentabilidad > 0 ? '+' : ''}{rentabilidad.toFixed(1)}%
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-4 border-t border-white/15">
        <div>
          <p className="text-[11px] text-white/60 mb-0.5">Aportado</p>
          <p className="text-sm font-semibold">{formatCurrency(totalAportado)}</p>
        </div>
        {!sinVals && ganancia !== null && (
          <div>
            <p className="text-[11px] text-white/60 mb-0.5">Ganancia</p>
            <p className={cn('text-sm font-semibold', ganancia >= 0 ? 'text-menta' : 'text-rojo-tierra/80')}>
              {ganancia > 0 ? '+' : ''}{formatCurrency(ganancia)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Product card ──────────────────────────────────────────────────────────────

function ProductCard({
  stats,
  showOwner,
  onEdit,
}: {
  stats:     ProductoStats
  showOwner: boolean
  onEdit:    () => void
}) {
  const { product, totalAportado, valorActual, ganancia, rentabilidad, lastValoracionDate } = stats
  const sinVal = valorActual === null

  return (
    <div className="bg-card rounded-[14px] border border-border shadow-[0_1px_8px_rgba(0,18,25,0.05)] px-4 py-3.5">
      <div className="flex items-start gap-3">

        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-[10px] bg-secondary/70 flex items-center justify-center text-lg">
          {PRODUCT_TYPE_EMOJIS[product.type]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
              <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{product.platform}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {PRODUCT_TYPE_LABELS[product.type]}
                </span>
                {showOwner && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-arena/30 text-petroleo">
                    {getUser(product.ownerId).name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onEdit}
              className="flex-shrink-0 p-1.5 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Numbers */}
          <div className="flex items-end justify-between mt-3 pt-3 border-t border-border">
            <div className="flex gap-5">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Aportado</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(totalAportado)}</p>
              </div>
              {!sinVal && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Valor actual</p>
                  <p className="text-sm font-bold text-foreground">{formatCurrency(valorActual)}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              {rentabilidad !== null && (
                <div className={cn(
                  'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold',
                  rentabilidad > 0
                    ? 'bg-teal-brand/10 text-teal-brand'
                    : rentabilidad < 0
                    ? 'bg-rojo-tierra/10 text-rojo-tierra'
                    : 'bg-secondary text-muted-foreground'
                )}>
                  {rentabilidad > 0
                    ? <TrendingUp className="w-3 h-3" />
                    : rentabilidad < 0
                    ? <TrendingDown className="w-3 h-3" />
                    : <Minus className="w-3 h-3" />
                  }
                  {rentabilidad > 0 ? '+' : ''}{rentabilidad.toFixed(1)}%
                </div>
              )}
              {ganancia !== null && (
                <p className={cn(
                  'text-[10px] font-medium',
                  ganancia > 0 ? 'text-teal-brand' : ganancia < 0 ? 'text-rojo-tierra' : 'text-muted-foreground'
                )}>
                  {ganancia > 0 ? '+' : ''}{formatCurrency(ganancia)}
                </p>
              )}
              {lastValoracionDate && (
                <p className="text-[9px] text-muted-foreground/60">
                  val. {formatDateShort(lastValoracionDate)}
                </p>
              )}
              {sinVal && (
                <p className="text-[10px] text-muted-foreground/60">sin valoración</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-[16px] border border-dashed border-border bg-secondary/30">
      <div className="w-12 h-12 rounded-[12px] bg-secondary flex items-center justify-center text-2xl">
        📈
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Sin productos de inversión</p>
        <p className="text-xs text-muted-foreground mt-1">
          Añade tus fondos, ETFs, acciones o criptos para empezar a seguir tu cartera.
        </p>
      </div>
      <button
        onClick={onAddProduct}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand transition-colors"
      >
        <Plus className="w-4 h-4" />
        Añadir producto
      </button>
    </div>
  )
}
