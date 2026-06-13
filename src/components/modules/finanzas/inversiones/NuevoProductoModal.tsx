'use client'

import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPE_EMOJIS,
  FREQ_LABELS_INV,
  calcProximaFecha,
  type InversionProduct,
  type ProductType,
  type FrecuenciaPeriodicidad,
  type ProductPeriodicidad,
} from '@/lib/inversiones'
import { useUsers } from '@/lib/users'

const TIPOS: ProductType[] = ['fondo', 'etf', 'accion', 'cripto', 'plan_pensiones', 'otro']
const DIVISAS = ['EUR', 'USD', 'GBP', 'CHF', 'BTC', 'ETH']
const FREQ_OPTIONS: FrecuenciaPeriodicidad[] = ['monthly', 'weekly', 'yearly']

export interface NuevoProductoData extends Omit<InversionProduct, 'id'> {
  paraAmbos: boolean
}

interface Props {
  initial?: InversionProduct
  onSave:  (p: NuevoProductoData) => void
  onClose: () => void
}

export function NuevoProductoModal({ initial, onSave, onClose }: Props) {
  const { currentUser, partnerUser } = useUsers()

  const [name,     setName]     = useState(initial?.name ?? '')
  const [platform, setPlatform] = useState(initial?.platform ?? '')
  const [type,     setType]     = useState<ProductType>(initial?.type ?? 'fondo')
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR')
  const [paraAmbos, setParaAmbos] = useState(false)

  // Periodicidad
  const [periActiva,     setPeriActiva]     = useState(initial?.periodicidad?.activa ?? false)
  const [periFrecuencia, setPeriFrecuencia] = useState<FrecuenciaPeriodicidad>(initial?.periodicidad?.frecuencia ?? 'monthly')
  const [periDiaMes,     setPeriDiaMes]     = useState(initial?.periodicidad?.diaMes ?? 1)
  const [periImporte,    setPeriImporte]    = useState(initial?.periodicidad?.importePorDefecto?.toString() ?? '')

  const proximaFecha = periActiva ? calcProximaFecha(periFrecuencia, periDiaMes) : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isValid       = name.trim().length > 0 && platform.trim().length > 0
  const periImporteNum = parseFloat(periImporte.replace(',', '.')) || 0
  const periValid     = !periActiva || periImporteNum > 0
  const isEditing     = !!initial

  function handleSave() {
    if (!isValid || !periValid) return

    const periodicidad: ProductPeriodicidad | undefined = periActiva
      ? {
          activa:            true,
          frecuencia:        periFrecuencia,
          diaMes:            periDiaMes,
          importePorDefecto: periImporteNum,
          paraAmbos:         paraAmbos,
          proximaFecha:      calcProximaFecha(periFrecuencia, periDiaMes),
        }
      : undefined

    onSave({
      name:     name.trim(),
      platform: platform.trim(),
      type,
      currency,
      ownerId:  initial?.ownerId ?? currentUser.id,
      isActive: true,
      periodicidad,
      paraAmbos,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md max-h-[90vh] flex flex-col bg-background rounded-t-[24px] sm:rounded-[20px] shadow-xl overflow-hidden">

        <div className="flex justify-center pt-3 pb-0 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Nombre</label>
            <input
              type="text" placeholder="ej: Cartera indexada" value={name} onChange={(e) => setName(e.target.value)} autoFocus
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
            />
          </div>

          {/* Plataforma */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Plataforma</label>
            <input
              type="text" placeholder="ej: Indexa Capital, Degiro, Coinbase…" value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button key={t} onClick={() => setType(t)} className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                  type === t ? 'bg-petroleo text-white border-petroleo' : 'bg-secondary/40 text-muted-foreground border-border hover:border-petroleo/40'
                )}>
                  <span>{PRODUCT_TYPE_EMOJIS[t]}</span>
                  {PRODUCT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Divisa */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Divisa</label>
            <div className="flex flex-wrap gap-2">
              {DIVISAS.map((d) => (
                <button key={d} onClick={() => setCurrency(d)} className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                  currency === d ? 'bg-petroleo text-white border-petroleo' : 'bg-secondary/40 text-muted-foreground border-border hover:border-petroleo/40'
                )}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Propietarios — chips con iniciales, solo al crear */}
          {!isEditing && partnerUser && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Propietarios
              </label>
              <div className="flex items-center gap-3">
                {/* Current user: always selected, not clickable */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-petroleo text-white text-sm font-bold flex items-center justify-center shadow-sm ring-2 ring-petroleo/30">
                    {currentUser.initial}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{currentUser.name}</p>
                    <p className="text-[10px] text-petroleo font-medium">Siempre incluido</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex-1 h-px bg-border" />

                {/* Partner: toggleable */}
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground text-right">{partnerUser.name}</p>
                    <p className={cn(
                      'text-[10px] font-medium text-right',
                      paraAmbos ? 'text-petroleo' : 'text-muted-foreground'
                    )}>
                      {paraAmbos ? 'Incluido' : 'No incluido'}
                    </p>
                  </div>
                  <button
                    onClick={() => setParaAmbos((v) => !v)}
                    title={paraAmbos ? `Quitar a ${partnerUser.name}` : `Añadir a ${partnerUser.name}`}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-bold border-2 transition-all',
                      paraAmbos
                        ? 'bg-petroleo text-white border-petroleo shadow-sm ring-2 ring-petroleo/30'
                        : 'bg-secondary text-muted-foreground border-border hover:border-petroleo/50 hover:text-petroleo/80'
                    )}
                  >
                    {partnerUser.initial}
                  </button>
                </div>
              </div>

              {paraAmbos && (
                <p className="mt-2 text-[11px] text-muted-foreground bg-secondary/50 rounded-[8px] px-3 py-2">
                  Se crearán dos productos independientes con el mismo nombre. Al registrar aportaciones o valorar, aparecerán como una única fila <span className="font-semibold text-petroleo">×2</span>.
                </p>
              )}
            </div>
          )}

          {/* Periodicidad */}
          <div>
            <button
              onClick={() => setPeriActiva((v) => !v)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border transition-colors text-left',
                periActiva ? 'bg-petroleo/8 border-petroleo/20' : 'bg-secondary/40 border-transparent hover:border-border'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors',
                periActiva ? 'bg-petroleo text-white' : 'bg-border text-muted-foreground'
              )}>
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Aportación periódica</p>
                <p className="text-[11px] text-muted-foreground">
                  {periActiva && periImporteNum > 0
                    ? `${periImporteNum.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} ${FREQ_LABELS_INV[periFrecuencia].toLowerCase()}${paraAmbos ? ' · para los dos' : ''} · próxima ${proximaFecha}`
                    : 'Se programa automáticamente y requiere validación'}
                </p>
              </div>
              <div className={cn(
                'w-10 h-5 rounded-full transition-colors flex-shrink-0 relative',
                periActiva ? 'bg-petroleo' : 'bg-border'
              )}>
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform',
                  periActiva ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </div>
            </button>

            {periActiva && (
              <div className="mt-2 p-4 bg-secondary/50 rounded-[12px] space-y-3">

                {/* Frecuencia */}
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Frecuencia</label>
                  <div className="flex gap-1.5">
                    {FREQ_OPTIONS.map((f) => (
                      <button key={f} onClick={() => setPeriFrecuencia(f)} className={cn(
                        'flex-1 py-1.5 text-xs font-medium rounded-[8px] transition-colors',
                        periFrecuencia === f ? 'bg-petroleo text-white' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                      )}>
                        {FREQ_LABELS_INV[f]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Día del mes */}
                {(periFrecuencia === 'monthly' || periFrecuencia === 'yearly') && (
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      {periFrecuencia === 'monthly' ? 'Día del mes' : 'Día del mes (anual)'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min={1} max={28} value={periDiaMes}
                        onChange={(e) => setPeriDiaMes(Math.min(28, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 px-3 py-1.5 text-sm text-foreground bg-card rounded-[8px] border border-border focus:outline-none focus:border-petroleo text-center"
                      />
                      <p className="text-xs text-muted-foreground">
                        Próxima: <span className="font-medium text-foreground">{proximaFecha}</span>
                      </p>
                    </div>
                  </div>
                )}

                {periFrecuencia === 'weekly' && proximaFecha && (
                  <p className="text-xs text-muted-foreground">
                    Próxima: <span className="font-medium text-foreground">{proximaFecha}</span>
                  </p>
                )}

                {/* Importe por defecto */}
                <div>
                  <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Importe por defecto</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                    <input
                      type="number" min={0} step="0.01" placeholder="0,00" value={periImporte}
                      onChange={(e) => setPeriImporte(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-sm text-foreground bg-card rounded-[8px] border border-border focus:outline-none focus:border-petroleo"
                    />
                  </div>
                  {!periImporteNum && periActiva && (
                    <p className="text-[10px] text-rojo-tierra mt-1">El importe es obligatorio para activar la periodicidad</p>
                  )}
                </div>

                {/* Info si paraAmbos está activo */}
                {paraAmbos && partnerUser && (
                  <div className="bg-petroleo/6 border border-petroleo/15 rounded-[8px] px-3 py-2">
                    <p className="text-[11px] text-petroleo">
                      La aportación periódica se programará para {currentUser.name} y {partnerUser.name} de forma independiente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-3 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || !periValid}
            className="flex-1 py-2.5 rounded-[10px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? 'Guardar cambios' : (paraAmbos && partnerUser ? `Añadir para los dos` : 'Añadir producto')}
          </button>
        </div>
      </div>
    </div>
  )
}
