'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, Pencil, X, KeyRound, Eye, EyeOff,
  Heart, HeartOff, ChevronDown, Plus,
  Star, ChevronUp, Eye as EyeIcon, EyeOff as EyeOffIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useSession } from '@/contexts/sessionContext'
import { MODULES, MODULE_GROUPS } from '@/lib/constants'
import { useModuleColors, MODULE_PALETTE } from '@/contexts/moduleColorsContext'

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1">
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

// ─── Avatar section ───────────────────────────────────────────────────────────

function AvatarSection() {
  const { user } = useSession()
  const supabase = createClient()
  const router   = useRouter()
  const emojiInputRef = useRef<HTMLInputElement>(null)

  const [type,   setType]   = useState<'initial' | 'emoji'>(
    user.avatar_type === 'emoji' ? 'emoji' : 'initial'
  )
  const [emoji,  setEmoji]  = useState(user.avatar_value ?? '')
  const [saving, setSaving] = useState(false)

  const displayChar = type === 'emoji' && emoji
    ? emoji
    : user.display_name.charAt(0).toUpperCase()

  async function saveAvatar(newType: 'initial' | 'emoji', newEmoji?: string) {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        avatar_type:  newType,
        avatar_value: newType === 'emoji' ? (newEmoji ?? emoji) : null,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Error al guardar el avatar')
    } else {
      toast.success('Avatar actualizado')
      router.refresh()
    }
    setSaving(false)
  }

  function handleEmojiInput(raw: string) {
    const chars = [...raw]
    const first = chars.slice(0, 2).join('')
    setEmoji(first)
  }

  return (
    <Row>
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-14 h-14 rounded-full bg-petroleo text-white flex items-center justify-center font-bold flex-shrink-0 select-none',
          type === 'emoji' && emoji ? 'text-3xl' : 'text-2xl'
        )}>
          {displayChar}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm font-semibold text-foreground">Avatar</p>

          <div className="flex gap-1.5">
            <button
              onClick={() => { setType('initial'); saveAvatar('initial') }}
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
              onClick={() => {
                setType('emoji')
                setTimeout(() => emojiInputRef.current?.focus(), 50)
              }}
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

          {type === 'emoji' && (
            <div className="flex items-center gap-3">
              <input
                ref={emojiInputRef}
                type="text"
                value={emoji}
                onChange={(e) => handleEmojiInput(e.target.value)}
                placeholder="😀"
                className="w-14 h-12 text-3xl text-center rounded-[10px] border border-border bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo transition"
              />
              <div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Escribe o pega cualquier emoji.<br />
                  <span className="font-medium text-foreground/70">Mac:</span> Cmd+Ctrl+Espacio
                </p>
              </div>
              <button
                onClick={() => saveAvatar('emoji')}
                disabled={!emoji || saving}
                className="px-3 py-2 rounded-[8px] text-xs font-semibold text-white bg-petroleo hover:bg-teal-brand disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                {saving
                  ? <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  : <Check className="w-3.5 h-3.5" />
                }
                Guardar
              </button>
            </div>
          )}
        </div>
      </div>
    </Row>
  )
}

// ─── Editable field ───────────────────────────────────────────────────────────

function EditableField({
  label, value, onSave, type = 'text', readonly,
}: {
  label: string; value: string
  onSave?: (v: string) => Promise<void>
  type?: string; readonly?: boolean
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
            type={type} value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setDraft(value); setEditing(false) }
            }}
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-[8px] border border-ring bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-petroleo/30"
          />
          <button onClick={handleSave} disabled={saving}
            className="p-1.5 rounded-[6px] bg-petroleo text-white hover:bg-teal-brand disabled:opacity-50 transition-colors">
            {saving
              ? <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin block" />
              : <Check className="w-3.5 h-3.5" />
            }
          </button>
          <button onClick={() => { setDraft(value); setEditing(false) }}
            className="p-1.5 rounded-[6px] text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{value || '—'}</p>
          {!readonly && onSave && (
            <button onClick={() => setEditing(true)}
              className="p-1.5 rounded-[6px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
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
  const [open,   setOpen]   = useState(false)
  const [next,   setNext]   = useState('')
  const [showN,  setShowN]  = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleChange() {
    if (!next || next.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: next })
    setSaving(false)
    if (error) { toast.error('Error al cambiar la contraseña') }
    else { toast.success('Contraseña actualizada'); setNext(''); setOpen(false) }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-petroleo hover:text-teal-brand transition-colors font-medium">
        <KeyRound className="w-4 h-4" /> Cambiar contraseña
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input type={showN ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)}
          placeholder="Nueva contraseña (mín. 6 caracteres)" autoFocus
          className="w-full pl-3.5 pr-10 py-2 rounded-[8px] border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-petroleo/30 focus:border-petroleo" />
        <button type="button" onClick={() => setShowN(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {showN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setOpen(false)} className="flex-1 py-2 rounded-[8px] text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary transition-colors">Cancelar</button>
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
    const { error } = await supabase.from('profiles').update({ partner_id: partnerId }).eq('id', user.id)
    if (error) { toast.error('Error al guardar') }
    else { toast.success(partnerId ? 'Pareja configurada' : 'Pareja desvinculada'); router.refresh() }
    setSaving(false)
  }

  if (candidates.length === 0) {
    return (
      <Row last>
        <p className="text-xs text-muted-foreground">No hay otros usuarios en la app todavía.</p>
      </Row>
    )
  }

  return (
    <>
      {candidates.map((u, idx) => {
        const isPartner = partner?.id === u.id
        const isLast = idx === candidates.length - 1
        return (
          <Row key={u.id} last={isLast}>
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
              <button onClick={() => selectPartner(isPartner ? null : u.id)} disabled={saving}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors disabled:opacity-50',
                  isPartner ? 'bg-rojo-tierra/10 text-rojo-tierra hover:bg-rojo-tierra/20' : 'bg-petroleo/10 text-petroleo hover:bg-petroleo/20'
                )}>
                {isPartner ? <><HeartOff className="w-3.5 h-3.5" /> Desvincular</> : <><Heart className="w-3.5 h-3.5" /> Mi pareja</>}
              </button>
            </div>
          </Row>
        )
      })}
    </>
  )
}

// ─── Modules section ──────────────────────────────────────────────────────────

const NEUTRAL_HEX   = '#8e9196'
const MAX_FAVORITES = 5

function getDefaultGroup(slug: string): { id: string; label: string } | null {
  const g = MODULE_GROUPS.find((g) => g.modulesSlugs.includes(slug))
  return g ? { id: g.id, label: g.label } : null
}

function ModulesSection() {
  const {
    getColor, setColor, isColorTaken,
    isEnabled, setEnabled,
    getGroup, setGroup, allGroupIds, addGroup,
    favorites, isFavorite, toggleFavorite,
  } = useModuleColors()

  const [openColorSlug, setOpenColorSlug] = useState<string | null>(null)
  const [openGroupSlug, setOpenGroupSlug] = useState<string | null>(null)
  const [newGroupName,  setNewGroupName]  = useState('')

  const displayModules = MODULES.filter((m) => m.slug !== 'ajustes')

  return (
    <>
      <div className="px-4 py-2.5 border-b border-border bg-secondary/20">
        <p className="text-[11px] text-muted-foreground">
          <Star className="w-3 h-3 inline-block mr-1 text-ambar" />
          Máx. {MAX_FAVORITES} favoritos — aparecen arriba del todo en el sidebar
        </p>
      </div>

      {displayModules.map((mod, idx) => {
        const isLast    = idx === displayModules.length - 1
        const color     = getColor(mod.slug)
        const enabled   = isEnabled(mod.slug, mod.canDisable)
        const favorite  = isFavorite(mod.slug)
        const colorOpen = openColorSlug === mod.slug
        const groupOpen = openGroupSlug === mod.slug
        const canFav    = favorite || favorites.length < MAX_FAVORITES

        const overrideGroupId = getGroup(mod.slug)
        const defaultGroup    = getDefaultGroup(mod.slug)
        const effectiveGroup  = overrideGroupId
          ? (allGroupIds.find((g) => g.id === overrideGroupId) ?? defaultGroup)
          : defaultGroup

        const showBorder = !isLast && !colorOpen && !groupOpen

        return (
          <div key={mod.slug}>
            <div className={cn(
              'flex items-center gap-2.5 px-4 py-3 min-h-[52px]',
              showBorder && 'border-b border-border',
              !enabled && 'opacity-50'
            )}>
              <mod.icon
                className="w-4 h-4 flex-shrink-0"
                style={{ color: color ?? NEUTRAL_HEX }}
              />

              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium text-foreground', !enabled && 'line-through decoration-muted-foreground/40')}>
                  {mod.name}
                </p>
                <button
                  onClick={() => {
                    if (favorite) return
                    setOpenGroupSlug(groupOpen ? null : mod.slug)
                    setOpenColorSlug(null)
                  }}
                  className="text-[10px] text-muted-foreground/70 hover:text-foreground transition-colors mt-0.5 flex items-center gap-0.5"
                >
                  {favorite
                    ? <span className="text-ambar">★ Favorito</span>
                    : <>{effectiveGroup?.label ?? 'Sin grupo'}<ChevronDown className={cn('w-2.5 h-2.5 transition-transform', groupOpen && 'rotate-180')} /></>
                  }
                </button>
              </div>

              {/* Favorite star */}
              <button
                onClick={() => { if (canFav) toggleFavorite(mod.slug) }}
                disabled={!canFav}
                title={favorite ? 'Quitar de favoritos' : canFav ? 'Añadir a favoritos' : `Máximo ${MAX_FAVORITES} favoritos`}
                className={cn(
                  'p-1 rounded-[6px] transition-colors flex-shrink-0',
                  favorite ? 'text-ambar hover:text-ambar/70' : canFav ? 'text-muted-foreground/40 hover:text-ambar' : 'text-muted-foreground/20 cursor-not-allowed'
                )}
              >
                <Star className={cn('w-3.5 h-3.5', favorite && 'fill-current')} />
              </button>

              {/* Color swatch */}
              <button
                onClick={() => { setOpenColorSlug(colorOpen ? null : mod.slug); setOpenGroupSlug(null) }}
                className="w-5 h-5 rounded-full border-2 border-border/80 flex-shrink-0 transition-transform hover:scale-110"
                style={{ backgroundColor: color ?? NEUTRAL_HEX }}
                title="Cambiar color"
              />

              {/* Enabled toggle */}
              {mod.canDisable ? (
                <button
                  onClick={() => setEnabled(mod.slug, !enabled)}
                  className={cn(
                    'w-9 h-5 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0',
                    enabled ? 'bg-teal-brand' : 'bg-border'
                  )}
                >
                  <div className={cn('w-4 h-4 rounded-full bg-white shadow-sm transition-transform', enabled ? 'translate-x-4' : 'translate-x-0')} />
                </button>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground/50 bg-secondary px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  Fijo
                </span>
              )}
            </div>

            {/* Color picker */}
            {colorOpen && (
              <div className={cn('px-4 pb-3.5 pt-2 bg-secondary/25', !isLast && !groupOpen && 'border-b border-border')}>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Un color solo puede pertenecer a un módulo. Selecciona &ldquo;sin color&rdquo; para liberarlo.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => { setColor(mod.slug, null); setOpenColorSlug(null) }}
                    title="Sin color"
                    className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
                      !color ? 'border-foreground scale-110' : 'border-border/60 hover:scale-105 bg-secondary'
                    )}
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                  {MODULE_PALETTE.map((p) => {
                    const taken    = isColorTaken(p.hex, mod.slug)
                    const selected = color === p.hex
                    return (
                      <button
                        key={p.hex}
                        onClick={() => { if (!taken) { setColor(mod.slug, p.hex); setOpenColorSlug(null) } }}
                        disabled={taken}
                        title={taken ? 'Ya asignado' : p.name}
                        className={cn(
                          'w-7 h-7 rounded-full border-2 transition-all',
                          selected  && 'border-foreground scale-110 shadow-md',
                          !selected && !taken && 'border-transparent hover:scale-105 hover:border-white/60',
                          taken     && 'border-transparent opacity-20 cursor-not-allowed'
                        )}
                        style={{ backgroundColor: p.hex }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Group picker */}
            {groupOpen && !favorite && (
              <div className={cn('px-4 pb-3.5 pt-2 bg-secondary/25', !isLast && 'border-b border-border')}>
                <p className="text-[10px] text-muted-foreground mb-2">Grupo del módulo en el sidebar</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setGroup(mod.slug, null); setOpenGroupSlug(null) }}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                      !overrideGroupId ? 'bg-petroleo text-white border-petroleo' : 'bg-secondary text-muted-foreground border-border hover:border-petroleo/40'
                    )}
                  >
                    Por defecto
                  </button>
                  {allGroupIds.map((g) => (
                    <button key={g.id} onClick={() => { setGroup(mod.slug, g.id); setOpenGroupSlug(null) }}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                        overrideGroupId === g.id ? 'bg-petroleo text-white border-petroleo' : 'bg-secondary text-muted-foreground border-border hover:border-petroleo/40'
                      )}>
                      {g.label}
                    </button>
                  ))}
                  {newGroupName ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus type="text" value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newGroupName.trim()) {
                            const id = newGroupName.trim().toLowerCase().replace(/\s+/g, '-')
                            addGroup(id, newGroupName.trim())
                            setGroup(mod.slug, id)
                            setNewGroupName('')
                            setOpenGroupSlug(null)
                          }
                          if (e.key === 'Escape') setNewGroupName('')
                        }}
                        placeholder="Nombre del grupo"
                        className="px-2 py-0.5 text-xs rounded-[6px] border border-petroleo/40 bg-secondary/40 text-foreground focus:outline-none w-32"
                      />
                      <button onClick={() => setNewGroupName('')} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewGroupName(' ')}
                      className="flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:border-petroleo/40 hover:text-foreground transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Nuevo grupo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

// ─── Groups order & visibility section ────────────────────────────────────────

function GroupsSection() {
  const { allGroupIds, groupOrder, setGroupOrder, isGroupVisible, setGroupVisible } = useModuleColors()

  const baseGroupIds = allGroupIds.map((g) => g.id)
  const storedOrder  = groupOrder.filter((id) => baseGroupIds.includes(id))
  const notInOrder   = baseGroupIds.filter((id) => !storedOrder.includes(id))
  const orderedList  = [...storedOrder, ...notInOrder].map(
    (id) => ({ id, label: allGroupIds.find((g) => g.id === id)?.label ?? id })
  )

  function moveUp(idx: number) {
    if (idx === 0) return
    const ids = orderedList.map((g) => g.id)
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    setGroupOrder(ids)
  }

  function moveDown(idx: number) {
    if (idx === orderedList.length - 1) return
    const ids = orderedList.map((g) => g.id)
    ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    setGroupOrder(ids)
  }

  return (
    <>
      {orderedList.map((g, idx) => {
        const visible = isGroupVisible(g.id)
        const isLast  = idx === orderedList.length - 1
        return (
          <div key={g.id} className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b border-border')}>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={isLast}
                className="p-0.5 rounded text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <p className={cn('flex-1 text-sm font-medium', !visible && 'text-muted-foreground/50 line-through')}>
              {g.label}
            </p>

            <button
              onClick={() => setGroupVisible(g.id, !visible)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-xs font-medium transition-colors border',
                visible
                  ? 'text-petroleo border-petroleo/30 hover:bg-petroleo/10'
                  : 'text-muted-foreground border-border hover:border-petroleo/30'
              )}
            >
              {visible
                ? <><EyeIcon className="w-3 h-3" /> Visible</>
                : <><EyeOffIcon className="w-3 h-3" /> Oculto</>
              }
            </button>
          </div>
        )
      })}
    </>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function AjustesView() {
  const { user } = useSession()
  const supabase = createClient()
  const router   = useRouter()

  async function saveName(name: string) {
    const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', user.id)
    if (error) { toast.error('Error al guardar'); return }
    toast.success('Nombre actualizado')
    router.refresh()
  }

  return (
    <div className="px-6 pt-4 pb-10 space-y-6 max-w-lg">

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

      <Section title="Mi pareja">
        <PartnerSection />
      </Section>

      <Section title="Módulos">
        <ModulesSection />
      </Section>

      <Section title="Grupos del sidebar">
        <GroupsSection />
      </Section>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Fatumsaurus · versión local
      </p>
    </div>
  )
}
