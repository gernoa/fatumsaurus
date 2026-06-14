'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Plus, TrendingUp, TrendingDown, Pencil, Minus,
  BarChart2, WalletCards, Clock, CheckCircle2, X, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import {
  getProductStats,
  getPortfolioTotals,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_EMOJIS,
  type InversionProduct,
  type Aportacion,
  type Valoracion,
  type ProductoStats,
} from '@/lib/inversiones'
import { useInversiones } from '@/contexts/inversionesContext'
import { useUsers } from '@/lib/users'
import { NuevoProductoModal, type NuevoProductoData } from './NuevoProductoModal'
import { AportacionModal }    from './AportacionModal'
import { ValoracionModal }    from './ValoracionModal'
import { ProductDetailModal } from './ProductDetailModal'

type View = 'mia' | 'pareja' | 'conjunta'

const TODAY = new Date().toISOString().split('T')[0]

// ─── Simple SVG line chart ────────────────────────────────────────────────────

function LineChart({
  data,
  color = '#0A9396',
}: {
  data:  { date: string; value: number }[]
  color?: string
}) {
  if (data.length < 2) return null
  const W = 600; const H = 100
  const vals  = data.map((d) => d.value)
  const min   = Math.min(...vals)
  const max   = Math.max(...vals)
  const range = max - min || 1
  const pad   = { t: 8, b: 8, l: 4, r: 4 }

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r),
    y: pad.t + (1 - (d.value - min) / range) * (H - pad.t - pad.b),
  }))

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }} aria-hidden>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} />
    </svg>
  )
}

// ─── Confirm pending modal ────────────────────────────────────────────────────

function ConfirmarAportacionModal({
  aportacion, productName, onConfirm, onClose,
}: {
  aportacion:  Aportacion
  productName: string
  onConfirm:   (amount: number, date: string) => void
  onClose:     () => void
}) {
  const [amount, setAmount] = useState(aportacion.amount.toString())
  const [date,   setDate]   = useState(aportacion.date)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md glass rounded-[20px] shadow-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">Confirmar aportación</p>
            <p className="text-xs text-muted-foreground mt-0.5">{productName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Importe real</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
              <input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
                className="w-full pl-7 pr-3 py-2 text-sm text-foreground bg-secondary border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-petroleo/30" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha real</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm text-foreground bg-secondary border border-border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-petroleo/30" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary border border-border hover:bg-secondary/80 transition-colors">Cancelar</button>
          <button
            onClick={() => {
              const amt = parseFloat(amount.replace(',', '.'))
              if (!amt || amt <= 0) { toast.error('Importe inválido'); return }
              onConfirm(amt, date)
            }}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function InversionesView() {
  const {
    products, aportaciones, valoraciones,
    addProduct, updateProduct, deleteProduct,
    addAportaciones, addValoraciones,
    confirmAportacion, deleteAportacion,
    generatePendingAportaciones,
  } = useInversiones()
  const { currentUser, partnerUser, getUser } = useUsers()

  const [view,            setView]            = useState<View>('mia')
  const [showProducto,    setShowProducto]    = useState(false)
  const [editingProduct,  setEditingProduct]  = useState<InversionProduct | undefined>()
  const [detailProduct,   setDetailProduct]   = useState<InversionProduct | undefined>()
  const [showAportacion,  setShowAportacion]  = useState(false)
  const [showValoracion,  setShowValoracion]  = useState(false)
  const [confirmingAp,    setConfirmingAp]    = useState<Aportacion | undefined>()

  useEffect(() => {
    generatePendingAportaciones(TODAY, partnerUser?.id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Derived ──────────────────────────────────────────────────────────────

  const activeProducts = products.filter((p) => p.isActive)

  const viewUserIds = useMemo<string[]>(() => {
    if (view === 'mia')     return [currentUser.id]
    if (view === 'pareja')  return partnerUser ? [partnerUser.id] : []
    return [currentUser.id, ...(partnerUser ? [partnerUser.id] : [])]
  }, [view, currentUser.id, partnerUser])

  const viewProducts = useMemo(
    () => activeProducts.filter((p) => viewUserIds.includes(p.ownerId)),
    [activeProducts, viewUserIds]
  )

  // Group by platform → alphabetical
  const grouped = useMemo(() => {
    const sorted = [...viewProducts].sort((a, b) =>
      a.platform.localeCompare(b.platform) || a.name.localeCompare(b.name)
    )
    const map = new Map<string, InversionProduct[]>()
    for (const p of sorted) {
      if (!map.has(p.platform)) map.set(p.platform, [])
      map.get(p.platform)!.push(p)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [viewProducts])

  const statsFor = (p: InversionProduct): ProductoStats =>
    getProductStats(p, p.ownerId, aportaciones, valoraciones)

  const allStats = useMemo(() => viewProducts.map(statsFor), [viewProducts, aportaciones, valoraciones])
  const totals   = useMemo(() => getPortfolioTotals(allStats), [allStats])

  const statsByProductUser = useMemo(() => {
    const map = new Map<string, ProductoStats>()
    activeProducts.forEach((p) => { map.set(`${p.id}:${p.ownerId}`, statsFor(p)) })
    return map
  }, [activeProducts, aportaciones, valoraciones])

  // Pending aportaciones
  const pendingAportaciones = useMemo(() =>
    aportaciones
      .filter((a) => a.estado === 'pendiente' && viewUserIds.includes(a.userId))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [aportaciones, viewUserIds]
  )

  // Portfolio chart data: aggregate valoraciones by date for the view
  const chartData = useMemo(() => {
    const byDate = new Map<string, number>()
    valoraciones.forEach((v) => {
      if (!viewUserIds.includes(v.userId)) return
      byDate.set(v.date, (byDate.get(v.date) ?? 0) + v.value)
    })
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }))
  }, [valoraciones, viewUserIds])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleAddProduct(data: NuevoProductoData) {
    const { paraAmbos, ...productData } = data
    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      toast.success('Producto actualizado')
    } else {
      // Always create for current user
      addProduct({ ...productData, ownerId: currentUser.id })
      // If "para ambos", create an independent copy for partner
      if (paraAmbos && partnerUser) {
        addProduct({
          ...productData,
          ownerId: partnerUser.id,
          // Partner's copy: periodicidad sin paraAmbos para evitar loops
          periodicidad: productData.periodicidad
            ? { ...productData.periodicidad, paraAmbos: false }
            : undefined,
        })
        toast.success(`Producto añadido para ${currentUser.name} y ${partnerUser.name}`)
      } else {
        toast.success('Producto añadido')
      }
    }
    setShowProducto(false)
    setEditingProduct(undefined)
  }

  function handleSaveAportaciones(items: Omit<Aportacion, 'id'>[]) {
    addAportaciones(items)
    toast.success(`${items.length} aportación${items.length !== 1 ? 'es' : ''} guardada${items.length !== 1 ? 's' : ''}`)
    setShowAportacion(false)
  }

  function handleSaveValoraciones(items: Omit<Valoracion, 'id'>[]) {
    addValoraciones(items)
    toast.success(`${items.length} valoración${items.length !== 1 ? 'es' : ''} actualizada${items.length !== 1 ? 's' : ''}`)
    setShowValoracion(false)
  }

  function handleConfirmPending(ap: Aportacion, amount: number, date: string) {
    confirmAportacion(ap.id, amount, date)
    setConfirmingAp(undefined)
    toast.success('Aportación confirmada')
  }

  function handleDeleteProduct(id: string) {
    deleteProduct(id)
    setDetailProduct(undefined)
    toast.success('Producto eliminado')
  }

  // ─── View labels ──────────────────────────────────────────────────────────

  const viewLabels: Record<View, string> = {
    mia:      'Mi cartera',
    pareja:   partnerUser ? partnerUser.name : 'Mi pareja',
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
                view === v ? 'bg-white/70 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>

        {/* Summary card */}
        <SummaryCard totals={totals} viewLabel={viewLabels[view]} chartData={chartData} />

        {/* Pending aportaciones */}
        {pendingAportaciones.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Pendientes de validar
            </p>
            {pendingAportaciones.map((ap) => {
              const product = products.find((p) => p.id === ap.productId)
              if (!product) return null
              const owner = getUser(ap.userId)
              return (
                <div key={ap.id} className="flex items-center gap-3 bg-ambar/5 border border-ambar/20 rounded-[12px] px-4 py-2.5">
                  <RefreshCw className="w-3.5 h-3.5 text-ambar flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(ap.amount)} · {formatDateShort(ap.date)}
                      {view === 'conjunta' && <span className="ml-1">· {owner.name}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setConfirmingAp(ap)} className="p-1.5 rounded-[8px] text-teal-brand bg-teal-brand/10 hover:bg-teal-brand/20 transition-colors" title="Confirmar">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { deleteAportacion(ap.id); toast.info('Descartada') }} className="p-1.5 rounded-[8px] text-muted-foreground hover:text-rojo-tierra hover:bg-rojo-tierra/8 transition-colors" title="Descartar">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Products grouped by platform */}
        {viewProducts.length === 0 ? (
          <EmptyState onAddProduct={() => setShowProducto(true)} />
        ) : (
          <div className="space-y-4">
            {grouped.map(([platform, ps]) => (
              <div key={platform} className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-0.5">{platform}</p>
                {ps.map((p) => {
                  const stats = statsFor(p)
                  return (
                    <ProductRow
                      key={p.id}
                      stats={stats}
                      showOwner={view === 'conjunta'}
                      ownerName={getUser(p.ownerId).name}
                      onClick={() => setDetailProduct(p)}
                      onEdit={(e) => { e.stopPropagation(); setEditingProduct(p); setShowProducto(true) }}
                      sparkData={
                        valoraciones
                          .filter((v) => v.productId === p.id && v.userId === p.ownerId)
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map((v) => ({ date: v.date, value: v.value }))
                      }
                    />
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 pointer-events-none z-40">
        <div className="max-w-2xl mx-auto px-6 pb-4 pointer-events-auto">
          <div className="flex gap-2 glass rounded-[16px] p-2">
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
              Aportación
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
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onEdit={() => { setDetailProduct(undefined); setEditingProduct(detailProduct); setShowProducto(true) }}
          onDelete={() => handleDeleteProduct(detailProduct.id)}
          onClose={() => setDetailProduct(undefined)}
        />
      )}
      {confirmingAp && (() => {
        const product = products.find((p) => p.id === confirmingAp.productId)
        return product ? (
          <ConfirmarAportacionModal
            aportacion={confirmingAp}
            productName={product.name}
            onConfirm={(amount, date) => handleConfirmPending(confirmingAp, amount, date)}
            onClose={() => setConfirmingAp(undefined)}
          />
        ) : null
      })()}
    </>
  )
}

// ─── Summary card with chart ──────────────────────────────────────────────────

function SummaryCard({
  totals,
  viewLabel,
  chartData,
}: {
  totals:    ReturnType<typeof getPortfolioTotals>
  viewLabel: string
  chartData: { date: string; value: number }[]
}) {
  const { totalAportado, valorActual, ganancia, rentabilidad } = totals
  const sinVals = valorActual === null

  return (
    <div className="bg-petroleo rounded-[16px] overflow-hidden text-white">
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{viewLabel}</p>
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
              rentabilidad >= 0 ? 'bg-white/15 text-white' : 'bg-rojo-tierra/30 text-white'
            )}>
              {rentabilidad >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
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
              <p className={cn('text-sm font-semibold', ganancia >= 0 ? 'text-[#94D2BD]' : 'text-[#AE2012]/80')}>
                {ganancia > 0 ? '+' : ''}{formatCurrency(ganancia)}
              </p>
            </div>
          )}
        </div>
      </div>
      {chartData.length >= 2 && (
        <div className="px-2 pb-2 opacity-80">
          <LineChart data={chartData} color="#94D2BD" />
        </div>
      )}
    </div>
  )
}

// ─── Compact product row ──────────────────────────────────────────────────────

function ProductRow({
  stats,
  showOwner,
  ownerName,
  onClick,
  onEdit,
  sparkData,
}: {
  stats:      ProductoStats
  showOwner:  boolean
  ownerName?: string
  onClick:    () => void
  onEdit:     (e: React.MouseEvent) => void
  sparkData:  { date: string; value: number }[]
}) {
  const { product, totalAportado, valorActual, rentabilidad } = stats
  const sinVal = valorActual === null

  return (
    <div
      onClick={onClick}
      className="card-tech px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-all"
    >
      <span className="text-base flex-shrink-0">{PRODUCT_TYPE_EMOJIS[product.type]}</span>

      {/* Name + owner */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
          {showOwner && ownerName && (
            <span className="text-[10px] font-semibold text-petroleo/70 bg-petroleo/8 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {ownerName}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">{PRODUCT_TYPE_LABELS[product.type]}</p>
      </div>

      {/* Sparkline */}
      {sparkData.length >= 2 && (
        <div className="w-16 flex-shrink-0">
          <LineChart
            data={sparkData}
            color={rentabilidad !== null && rentabilidad < 0 ? '#AE2012' : '#0A9396'}
          />
        </div>
      )}

      {/* Numbers */}
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-sm font-semibold text-foreground">
          {sinVal ? formatCurrency(totalAportado) : formatCurrency(valorActual)}
        </p>
        {rentabilidad !== null ? (
          <p className={cn(
            'text-[11px] font-semibold flex items-center justify-end gap-0.5',
            rentabilidad > 0 ? 'text-teal-brand' : rentabilidad < 0 ? 'text-rojo-tierra' : 'text-muted-foreground'
          )}>
            {rentabilidad > 0 ? <TrendingUp className="w-3 h-3" />
              : rentabilidad < 0 ? <TrendingDown className="w-3 h-3" />
              : <Minus className="w-3 h-3" />}
            {rentabilidad > 0 ? '+' : ''}{rentabilidad.toFixed(1)}%
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/60">sin valor</p>
        )}
      </div>

      <button
        onClick={onEdit}
        className="flex-shrink-0 p-1.5 rounded-[6px] text-muted-foreground/50 hover:text-petroleo hover:bg-petroleo/8 transition-colors"
        title="Editar producto"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onAddProduct }: { onAddProduct: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 rounded-[16px] border border-dashed border-border bg-secondary/30">
      <div className="w-12 h-12 rounded-[12px] bg-secondary flex items-center justify-center text-2xl">📈</div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">Sin productos de inversión</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
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
