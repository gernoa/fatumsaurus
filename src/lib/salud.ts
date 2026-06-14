import { createClient } from '@/lib/supabase/client'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EstadoCita = 'pendiente' | 'realizada' | 'cancelada'

export interface Cita {
  id:          string
  user_id:     string
  fecha:       string
  hora:        string
  especialidad: string
  medico:      string | null
  centro:      string | null
  estado:      EstadoCita
  notas:       string | null
  resultado:   string | null
  created_at:  string
}

export type PagadoVia = 'personal' | 'conjunta'

export interface Especialista {
  id:                   string
  user_id:              string
  nombre:               string
  tipo:                 string
  modalidad:            'bono' | 'por_sesion'
  duracion_sesion:      number
  precio_total:         number | null
  sesiones_contratadas: number | null
  fecha_pago:           string | null
  precio_sesion:        number | null
  pagado_via:           PagadoVia
  activo:               boolean
  created_at:           string
  sesiones?:            Sesion[]
}

export interface Sesion {
  id:              string
  especialista_id: string
  user_id:         string
  fecha:           string
  duracion:        number
  notas:           string | null
  pagado_via:      PagadoVia | null
  gasto_id:        string | null
  created_at:      string
}

export type TipoMedicamento = 'Medicamento' | 'Suplemento' | 'Vitamina'

export interface Medicamento {
  id:          string
  user_id:     string
  nombre:      string
  tipo:        TipoMedicamento
  stock:       number
  stock_minimo: number
  activo:      boolean
  created_at:  string
  tramo_activo?: Tramo | null
  tomas_hoy?:  TomaHoy[]
}

export interface Tramo {
  id:             string
  medicamento_id: string
  dosis:          number
  unidad:         string
  frecuencia:     string
  momentos:       string[]
  inicio:         string
  fin:            string | null
  activo:         boolean
  created_at:     string
}

export type EstadoToma = 'tomada' | 'saltada'

export interface Toma {
  id:             string
  medicamento_id: string
  tramo_id:       string | null
  user_id:        string
  fecha_prevista: string
  momento:        string | null
  estado:         EstadoToma
  hora_real:      string | null
  notas:          string | null
  created_at:     string
}

export interface TomaHoy {
  momento:  string
  estado:   'tomada' | 'saltada' | 'pendiente'
  hora?:    string
  toma_id?: string
}

export type TipoHistorial = 'Consulta' | 'Diagnóstico' | 'Intervención' | 'Analítica' | 'Vacuna' | 'Otro'

export interface EntradaHistorial {
  id:          string
  user_id:     string
  fecha:       string
  tipo:        TipoHistorial
  titulo:      string
  descripcion: string | null
  medico:      string | null
  centro:      string | null
  etiquetas:   string[]
  created_at:  string
}

export interface Documento {
  id:        string
  user_id:   string
  nombre:    string
  tipo:      string
  categoria: string | null
  url:       string
  tamaño_kb: number | null
  fecha:     string | null
  created_at: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── CITAS ─────────────────────────────────────────────────────────────────────

export async function getCitas(): Promise<Cita[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('salud_citas')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throw error
  return (data ?? []) as Cita[]
}

export async function createCita(payload: Omit<Cita, 'id' | 'user_id' | 'created_at'>): Promise<Cita> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data, error } = await sb
    .from('salud_citas')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as Cita
}

export async function updateCita(id: string, payload: Partial<Omit<Cita, 'id' | 'user_id' | 'created_at'>>): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_citas').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteCita(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_citas').delete().eq('id', id)
  if (error) throw error
}

// ─── ESPECIALISTAS ─────────────────────────────────────────────────────────────

export async function getEspecialistas(): Promise<Especialista[]> {
  const sb = createClient()
  const { data: esps, error } = await sb
    .from('salud_especialistas')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: true })
  if (error) throw error

  // Fetch sesiones for each
  const ids = (esps ?? []).map((e: Especialista) => e.id)
  if (ids.length === 0) return []

  const { data: sesiones, error: err2 } = await sb
    .from('salud_sesiones')
    .select('*')
    .in('especialista_id', ids)
    .order('fecha', { ascending: false })
  if (err2) throw err2

  return (esps ?? []).map((e: Especialista) => ({
    ...e,
    sesiones: (sesiones ?? []).filter((s: Sesion) => s.especialista_id === e.id),
  })) as Especialista[]
}

export async function createEspecialista(
  payload: Omit<Especialista, 'id' | 'user_id' | 'created_at' | 'sesiones'>
): Promise<Especialista> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await sb
    .from('salud_especialistas')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()
  if (error) throw error

  // Registrar gasto en Finanzas si es un bono con precio
  if (payload.modalidad === 'bono' && payload.precio_total && payload.fecha_pago) {
    await sb.from('gastos').insert({
      user_id:     user.id,
      paid_by_id:  user.id,
      description: `Bono ${payload.tipo} – ${payload.nombre} (${payload.sesiones_contratadas} sesiones)`,
      amount:      payload.precio_total,
      date:        payload.fecha_pago,
      category:    'salud',
      paid_via:    payload.pagado_via,
      origin:      'salud',
      origin_id:   data.id,
    })
  }

  return { ...data, sesiones: [] } as Especialista
}

export async function registrarSesion(payload: {
  especialista_id: string
  especialista_nombre: string
  especialista_tipo: string
  fecha:        string
  duracion:     number
  notas?:       string
  pagado_via?:  PagadoVia
  precio?:      number   // para por_sesion
}): Promise<Sesion> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Si es pago por sesión con precio → insertar gasto primero
  let gastoId: string | null = null
  if (payload.pagado_via && payload.precio) {
    const { data: g, error: ge } = await sb.from('gastos').insert({
      user_id:     user.id,
      paid_by_id:  user.id,
      description: `Sesión ${payload.especialista_tipo} – ${payload.especialista_nombre}`,
      amount:      payload.precio,
      date:        payload.fecha,
      category:    'salud',
      paid_via:    payload.pagado_via,
      origin:      'salud',
    }).select('id').single()
    if (ge) throw ge
    gastoId = g.id
  }

  const { data, error } = await sb
    .from('salud_sesiones')
    .insert({
      especialista_id: payload.especialista_id,
      user_id:         user.id,
      fecha:           payload.fecha,
      duracion:        payload.duracion,
      notas:           payload.notas ?? null,
      pagado_via:      payload.pagado_via ?? null,
      gasto_id:        gastoId,
    })
    .select()
    .single()
  if (error) throw error
  return data as Sesion
}

export async function deleteEspecialista(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_especialistas').update({ activo: false }).eq('id', id)
  if (error) throw error
}

// ─── MEDICAMENTOS ──────────────────────────────────────────────────────────────

export async function getMedicamentos(): Promise<Medicamento[]> {
  const sb = createClient()
  const today = todayStr()

  const { data: meds, error } = await sb
    .from('salud_medicamentos')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  if (!meds || meds.length === 0) return []

  const ids = meds.map((m: Medicamento) => m.id)

  // Tramo activo para cada medicamento
  const { data: tramos, error: err2 } = await sb
    .from('salud_tramos')
    .select('*')
    .in('medicamento_id', ids)
    .eq('activo', true)
    .order('inicio', { ascending: false })
  if (err2) throw err2

  // Tomas de hoy
  const { data: tomasHoy, error: err3 } = await sb
    .from('salud_tomas')
    .select('*')
    .in('medicamento_id', ids)
    .eq('fecha_prevista', today)
  if (err3) throw err3

  return meds.map((med: Medicamento) => {
    const tramo = (tramos ?? []).find((t: Tramo) => t.medicamento_id === med.id && t.activo) ?? null
    const tomasDelMed = (tomasHoy ?? []).filter((t: Toma) => t.medicamento_id === med.id)

    // Build tomas_hoy: for each momento in tramo, check if there's a toma record
    let tomasHoyArr: TomaHoy[] = []
    if (tramo && tramo.frecuencia !== 'si_necesario' && tramo.momentos.length > 0) {
      tomasHoyArr = tramo.momentos.map((momento: string) => {
        const toma = tomasDelMed.find((t: Toma) => t.momento === momento)
        if (toma) {
          return { momento, estado: toma.estado as 'tomada' | 'saltada', hora: toma.hora_real ?? undefined, toma_id: toma.id }
        }
        return { momento, estado: 'pendiente' as const }
      })
    }

    return { ...med, tramo_activo: tramo, tomas_hoy: tomasHoyArr }
  })
}

export async function createMedicamento(
  med: Omit<Medicamento, 'id' | 'user_id' | 'created_at' | 'activo' | 'tramo_activo' | 'tomas_hoy'>,
  tramo: Omit<Tramo, 'id' | 'medicamento_id' | 'created_at'>
): Promise<void> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: medData, error } = await sb
    .from('salud_medicamentos')
    .insert({ nombre: med.nombre, tipo: med.tipo, stock: med.stock, stock_minimo: med.stock_minimo, user_id: user.id })
    .select()
    .single()
  if (error) throw error

  const { error: err2 } = await sb.from('salud_tramos').insert({
    medicamento_id: medData.id,
    dosis:          tramo.dosis,
    unidad:         tramo.unidad,
    frecuencia:     tramo.frecuencia,
    momentos:       tramo.momentos,
    inicio:         tramo.inicio,
    fin:            tramo.fin ?? null,
    activo:         true,
  })
  if (err2) throw err2
}

export async function updateStock(id: string, stock: number): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_medicamentos').update({ stock }).eq('id', id)
  if (error) throw error
}

export async function marcarToma(params: {
  medicamento_id: string
  tramo_id:       string | null
  fecha_prevista: string
  momento:        string
  estado:         'tomada' | 'saltada'
  hora_real?:     string
}): Promise<void> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await sb.from('salud_tomas').upsert(
    {
      medicamento_id: params.medicamento_id,
      tramo_id:       params.tramo_id ?? null,
      user_id:        user.id,
      fecha_prevista: params.fecha_prevista,
      momento:        params.momento,
      estado:         params.estado,
      hora_real:      params.hora_real ?? null,
    },
    { onConflict: 'medicamento_id,fecha_prevista,momento' }
  )
  if (error) throw error
}

export async function deleteMedicamento(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_medicamentos').update({ activo: false }).eq('id', id)
  if (error) throw error
}

// ─── HISTORIAL ─────────────────────────────────────────────────────────────────

export async function getHistorial(): Promise<EntradaHistorial[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('salud_historial')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throw error
  return (data ?? []) as EntradaHistorial[]
}

export async function createEntradaHistorial(
  payload: Omit<EntradaHistorial, 'id' | 'user_id' | 'created_at'>
): Promise<EntradaHistorial> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data, error } = await sb
    .from('salud_historial')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as EntradaHistorial
}

export async function updateEntradaHistorial(
  id: string,
  payload: Partial<Omit<EntradaHistorial, 'id' | 'user_id' | 'created_at'>>
): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_historial').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteEntradaHistorial(id: string): Promise<void> {
  const sb = createClient()
  const { error } = await sb.from('salud_historial').delete().eq('id', id)
  if (error) throw error
}

// ─── DOCUMENTOS ────────────────────────────────────────────────────────────────

export async function getDocumentos(): Promise<Documento[]> {
  const sb = createClient()
  const { data, error } = await sb
    .from('salud_documentos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Documento[]
}

export async function uploadDocumento(
  file:      File,
  categoria: string | null,
  fecha:     string | null
): Promise<void> {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const ext      = file.name.split('.').pop() ?? 'bin'
  const path     = `${user.id}/${Date.now()}.${ext}`
  const tipo     = ext === 'pdf' ? 'PDF' : 'Imagen'
  const bucket   = 'salud-documentos'

  const { error: uploadErr } = await sb.storage.from(bucket).upload(path, file)
  if (uploadErr) throw uploadErr

  const { data: { publicUrl } } = sb.storage.from(bucket).getPublicUrl(path)

  const { error: dbErr } = await sb.from('salud_documentos').insert({
    user_id:   user.id,
    nombre:    file.name,
    tipo,
    categoria,
    url:       publicUrl,
    tamaño_kb: Math.round(file.size / 1024),
    fecha,
  })
  if (dbErr) throw dbErr
}

export async function deleteDocumento(id: string, url: string): Promise<void> {
  const sb = createClient()

  // Delete from storage
  const path = url.split('/salud-documentos/')[1]
  if (path) await sb.storage.from('salud-documentos').remove([path])

  const { error } = await sb.from('salud_documentos').delete().eq('id', id)
  if (error) throw error
}
