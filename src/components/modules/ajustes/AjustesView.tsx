'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, X, KeyRound, Eye, EyeOff, Heart, HeartOff, ChevronDown, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/contexts/sessionContext'
import { MODULES } from '@/lib/constants'
import { useModuleColors, MODULE_PALETTE } from '@/contexts/moduleColorsContext'

// ─── Emoji picker ─────────────────────────────────────────────────────────────

const AVATAR_EMOJIS = [
  '🦕','🦖','🌵','🌿','🍄','🦊','🐺','🐻','🦁','🐯',
  '🐸','🦋','🌻','🌙','⭐','🔥','💎','🎯','🌈','🎭',
]

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1">
        {icon}
        {title}
      </h2>
      <div className="glass rounded-[16px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('px-5 py-4', !last && 'border-b border-border')}>
      {children}
    </div>
  )
}

// ─── Avatar block ─────────────────────────────────────────────────────────────

function AvatarSection() {
  const { user } = useSession()
  const supabase = createClient()
  const router   = useRouter()

  const [type,          setType]          = useState<'initial' | 'emoji'>(
    user.avatar_type === 'emoji' ? 'emoji' : 'initial'
  )
  const [selectedEmoji, setSelectedEmoji] = useState(user.avatar_value ?? '🦕')
  const [showPicker,    setShowPicker]    = useState(false)
  const [saving,        setSaving]        = useState(false)

  const displayChar = type === 'emoji' ? selectedEmoji : user.display_name.charAt(0).toUpperCase()

  async function handleSaveAvatar(newType: 'initial' | 'emoji', emoji?: string) {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_type:  newType,
        avatar_value: newType === 'emoji' ? (emoji ?? selectedEmoji) : null,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al guardar el avatar')
    } else {
      toast.success('Avatar actualizado')
      router.refresh()
    }
    setSaving(false)
    setShowPicker(false)
  }

  return (
    <Row>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-petroleo text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {displayChar}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Avatar</p>
          <p className="text-xs text-muted-foreground mt-0.5">Inicial o emoji</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setType('initial'); handleSaveAvatar('initial') }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                type === 'initial'
                  ? 'bg-petroleo text-white border-petroleo'
                  : 'bg-secondary text-muted-foreground border-border hover:border-petroleo/40'
              )}
            >
              Inicial
            </button>
            <button
              onClick={() => { setType('emoji'); setShowPicker(true) }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                type === 'emoji'
                  ? 'bg-petroleo text-white border-petroleo'
                  : 'bg-secondary text-muted-foreground border-border hover:border-petroleo/40'
              )}
            >
              Emoji
            </button>
          </div>
        </div>

        {saving && (
          <span className="w-4 h-4 rounded-full border-2 border-petroleo/30 border-t-petroleo animate-spin flex-shrink-0" />
        )}
      </div>

      {showPicker && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map((em) => (
              <button
                key={em}
                onClick={() => { setSelectedEmoji(em); handleSaveAvatar('emoji', em) }}
                className={cn(
                  'w-9 h-9 rounded-[8px] text-xl flex items-center justify-center transition-colors',
                  selectedEmoji === em
                    ? 'bg-petroleo/15 ring-2 ring-petroleo'
                    : 'bg-secondary hover:bg-secondary/80'
                )}
              >
                {em}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowPicker(false)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </Row>
  )
}

// ─── Editable field ───────────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
  type = 'text',
  readonly,
}: {
  label:     string
  value:     string
  onSave?:   (v: string) => Promise<void>
  type?:     string
  readonly?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)
  const [saving,  setSaving]  = useState(false)

  async function handleSave() {
    if (!onSave || draft.trim() === value) { setEditing(false); return }
    setSaving(true)
    await onSave(draft.trim())
    setSaving(false)
    setEditing(false)
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setDraft(value); setEditing(false) }
            }}
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-[8px] border border-ring bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 rounded-[6px] bg-petroleo text-white hover:bg-teal-brand disabled:opacity-50 transition-colors"
          >
            {saving
              ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin block" />
              : <Check className="w-3.5 h-3.5" />
            }
          </button>
          <button
            onClick={() => { setDraft(value); setEditing(false) }}
            className="p-1.5 rounded-[6px] text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{value || '—'}</p>
          {!readonly && onSave && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Change password ──────────────────────────────────────────────────────────

function ChangePassword() {
  const supabase = createClient()
  const [open,    setOpen]    = useState(false)
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [showC,   setShowC]   = useState(false)
  const [showN,   setShowN]   = useState(false)
  const [saving,  setSaving]  = useState(false)

  async function handleChange() {
    if (!next || next.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: next })
    setSaving(false)
    if (error) {
      toast.error('Error al cambiar la contraseña')
    } else {
      toast.success('Contraseña actualizada')
      setCurrent(''); setNext(''); setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-petroleo hover:text-teal-brand transition-colors font-medium"
      >
        <KeyRound className="w-4 h-4" />
        Cambiar contraseña
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type={showC ? 'text' : 'password'}
          placeholder="Contraseña actual"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full pl-3.5 pr-10 py-2 rounded-[8px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo"
        />
        <button type="button" onClick={() => setShowC(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {showC ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="relative">
        <input
          type={showN ? 'text' : 'password'}
          placeholder="Nueva contraseña (mín. 6 caracteres)"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="w-full pl-3.5 pr-10 py-2 rounded-[8px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo"
        />
        <button type="button" onClick={() => setShowN(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {showN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 py-2 rounded-[8px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">
          Cancelar
        </button>
        <button onClick={handleChange} disabled={saving || !next} className="flex-1 py-2 rounded-[8px] text-sm font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 transition-colors">
          {saving ? 'Guardando…' : 'Cambiar'}
        </button>
      </div>
    </div>
  )
}

// ─── Partner section ──────────────────────────────────────────────────────────

function PartnerSection() {
  const { user, allUsers, partner } = useSession()
  const supabase = createClient()
  const router   = useRouter()
  const [saving, setSaving] = useState(false)

  const candidates = allUsers.filter((u) => u.id !== user.id)

  async function selectPartner(partnerId: string | null) {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ partner_id: partnerId })
      .eq('id', user.id)
    if (error) {
      toast.error('Error al guardar')
    } else {
      toast.success(partnerId ? 'Pareja configurada' : 'Pareja desvinculada')
      router.refresh()
    }
    setSaving(false)
  }

  if (candidates.length === 0) {
    return (
      <Row last>
        <p className="text-xs text-muted-foreground">
          No hay otros usuarios en la app. Los usuarios se crean desde el panel de Supabase.
        </p>
      </Row>
    )
  }

  return (
    <>
      {candidates.map((u, idx) => {
        const isPartner = partner?.id === u.id
        const isLast = idx === candidates.length - 1
        return (
          <Row key={u.id} last={isLast && !isPartner}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-full text-sm font-semibold flex items-center justify-center flex-shrink-0',
                isPartner ? 'bg-petroleo text-white' : 'bg-secondary text-muted-foreground'
              )}>
                {u.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{u.display_name}</p>
                <p className="text-[11px] text-muted-foreground">{u.email}</p>
              </div>
              <button
                onClick={() => selectPartner(isPartner ? null : u.id)}
                disabled={saving}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors disabled:opacity-50',
                  isPartner
                    ? 'bg-rojo-tierra/10 text-rojo-tierra hover:bg-rojo-tierra/20'
                    : 'bg-petroleo/10 text-petroleo hover:bg-petroleo/20'
                )}
              >
                {isPartner ? (
                  <><HeartOff className="w-3.5 h-3.5" /> Desvincular</>
                ) : (
                  <><Heart className="w-3.5 h-3.5" /> Mi pareja</>
                )}
              </button>
            </div>
          </Row>
        )
      })}
      {partner && (
        <Row last>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Al vincular una pareja, las secciones de cuenta conjunta e inversiones
            mostrarán sus datos en pestañas separadas.
          </p>
        </Row>
      )}
    </>
  )
}

// ─── Module colors section ────────────────────────────────────────────────────

const NEUTRAL_HEX = '#8e9196'   // gris neutro para "sin color"

function ModuleColorsSection() {
  const { getColor, setColor, isColorTaken } = useModuleColors()
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  const displayModules = MODULES.filter((m) => m.slug !== 'ajustes')

  return (
    <>
      {displayModules.map((mod, idx) => {
        const color  = getColor(mod.slug)
        const isOpen = openSlug === mod.slug
        const isLast = idx === displayModules.length - 1

        return (
          <div key={mod.slug}>
            {/* Module row */}
            <button
              onClick={() => setOpenSlug(isOpen ? null : mod.slug)}
              className={cn(
                'w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors text-left',
                !isLast && !isOpen && 'border-b border-border'
              )}
            >
              <div className="flex items-center gap-3">
                <mod.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{mod.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {/* Color swatch */}
                <div
                  className="w-5 h-5 rounded-full border border-border/80 flex-shrink-0"
                  style={{ backgroundColor: color ?? NEUTRAL_HEX }}
                />
                {!color && (
                  <span className="text-[10px] text-muted-foreground/70 font-medium">sin color</span>
                )}
                <ChevronDown className={cn(
                  'w-3.5 h-3.5 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
              </div>
            </button>

            {/* Inline color picker */}
            {isOpen && (
              <div className={cn(
                'px-5 pb-4 pt-1 bg-secondary/30',
                !isLast && 'border-b border-border'
              )}>
                <p className="text-[10px] text-muted-foreground mb-2.5">
                  Un color solo puede pertenecer a un módulo a la vez. Pon &quot;sin color&quot; primero para liberar un tono asignado.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Sin color option */}
                  <button
                    onClick={() => { setColor(mod.slug, null); setOpenSlug(null) }}
                    title="Sin color"
                    className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                      !color
                        ? 'border-foreground scale-110 shadow-md'
                        : 'border-border/60 hover:scale-105 hover:border-border bg-secondary'
                    )}
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {/* 17 palette swatches */}
                  {MODULE_PALETTE.map((p) => {
                    const taken    = isColorTaken(p.hex, mod.slug)
                    const selected = color === p.hex
                    return (
                      <button
                        key={p.hex}
                        onClick={() => { if (!taken) { setColor(mod.slug, p.hex); setOpenSlug(null) } }}
                        disabled={taken}
                        title={taken ? `Ya asignado a otro módulo` : p.name}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 transition-all',
                          selected  && 'border-foreground scale-110 shadow-md',
                          !selected && !taken && 'border-transparent hover:scale-105 hover:border-white/60',
                          taken     && 'border-transparent opacity-25 cursor-not-allowed'
                        )}
                        style={{ backgroundColor: p.hex }}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function AjustesView() {
  const { user }  = useSession()
  const supabase  = createClient()
  const router    = useRouter()

  async function saveName(name: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', user.id)
    if (error) { toast.error('Error al guardar'); return }
    toast.success('Nombre actualizado')
    router.refresh()
  }

  return (
    <div className="px-6 pt-4 pb-10 space-y-6 max-w-lg">

      {/* Perfil */}
      <Section title="Perfil">
        <AvatarSection />
        <Row>
          <EditableField label="Nombre" value={user.display_name} onSave={saveName} />
        </Row>
        <Row>
          <EditableField label="Email" value={user.email} readonly />
        </Row>
        <Row last>
          <p className="text-xs text-muted-foreground mb-2">Contraseña</p>
          <ChangePassword />
        </Row>
      </Section>

      {/* Pareja */}
      <Section title="Mi pareja">
        <PartnerSection />
      </Section>

      {/* Colores de módulo */}
      <Section
        title="Colores de módulo"
        icon={<Palette className="w-3 h-3" />}
      >
        <ModuleColorsSection />
      </Section>

      {/* Módulos activos */}
      <Section title="Módulos activos">
        {MODULES.filter((m) => m.slug !== 'ajustes').map((mod, idx, arr) => {
          const isLast = idx === arr.length - 1
          return (
            <div
              key={mod.slug}
              className={cn('flex items-center justify-between px-5 py-3.5', !isLast && 'border-b border-border')}
            >
              <div className="flex items-center gap-3">
                <mod.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{mod.name}</span>
              </div>
              {mod.canDisable ? (
                <div className="w-9 h-5 rounded-full bg-teal-brand flex items-center px-0.5 cursor-pointer transition-colors">
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm translate-x-4 transition-transform" />
                </div>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary px-2 py-0.5 rounded-full">
                  Siempre activo
                </span>
              )}
            </div>
          )
        })}
      </Section>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Fatumsaurus · versión local
      </p>
    </div>
  )
}
