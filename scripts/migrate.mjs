/**
 * Script de migración para Fatumsaurus.
 * Uso: node scripts/migrate.mjs
 * Requiere SUPABASE_ACCESS_TOKEN en .env.local
 *   → Créalo en https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = resolve(__dir, '..')

// ── Leer .env.local ─────────────────────────────────────────────────────────
const envPath = resolve(root, '.env.local')
const envText = readFileSync(envPath, 'utf-8')

function readEnv(key) {
  const match = envText.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : null
}

const SUPABASE_URL    = readEnv('NEXT_PUBLIC_SUPABASE_URL')
const ACCESS_TOKEN    = readEnv('SUPABASE_ACCESS_TOKEN')

if (!SUPABASE_URL || !ACCESS_TOKEN) {
  console.error('\n❌  Faltan variables en .env.local:\n')
  if (!SUPABASE_URL)   console.error('   NEXT_PUBLIC_SUPABASE_URL   (ya deberías tenerla)')
  if (!ACCESS_TOKEN) {
    console.error('   SUPABASE_ACCESS_TOKEN      ← necesitas añadir esta')
    console.error('\n   Cómo obtenerla:')
    console.error('   1. Ve a https://supabase.com/dashboard/account/tokens')
    console.error('   2. Crea un nuevo token con cualquier nombre (ej: "fatumsaurus-local")')
    console.error('   3. Cópialo y añádelo a .env.local como:')
    console.error('      SUPABASE_ACCESS_TOKEN=tu_token_aqui\n')
  }
  process.exit(1)
}

const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0]

// ── Runner de SQL via Management API ─────────────────────────────────────────
async function sql(query, label) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  )

  let data
  try { data = await res.json() } catch { data = {} }

  if (!res.ok) {
    const msg = data?.message || data?.error || JSON.stringify(data)
    // "already exists" / "does not exist" no son errores reales
    if (msg?.includes('already exists') || msg?.includes('does not exist')) {
      console.log(`⚠️   ${label} — omitido (${msg.slice(0, 60)})`)
      return { ok: true }
    }
    console.error(`❌  ${label}\n    ${msg}`)
    return { ok: false }
  }

  console.log(`✅  ${label}`)
  return { ok: true }
}

// ── Migraciones ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🦕 Fatumsaurus — migraciones automáticas`)
  console.log(`   Proyecto: ${PROJECT_REF}\n`)

  // ─ 1. patrimonio_cuentas — habilitar RLS y políticas ─────────────────────
  await sql(
    `ALTER TABLE public.patrimonio_cuentas ENABLE ROW LEVEL SECURITY`,
    'patrimonio_cuentas → habilitar RLS'
  )

  // Limpiar políticas previas (nombres que pudiéramos haber creado antes)
  const oldPatrimonioPolicies = [
    'ver propias o conjuntas', 'crear', 'editar participadas',
    'eliminar propias o participadas', 'patrimonio_select',
    'patrimonio_insert', 'patrimonio_update', 'patrimonio_delete',
    'allow_select', 'allow_insert', 'allow_update', 'allow_delete',
  ]
  for (const name of oldPatrimonioPolicies) {
    await sql(
      `DROP POLICY IF EXISTS "${name}" ON public.patrimonio_cuentas`,
      `patrimonio_cuentas → borrar policy antigua "${name}"`
    )
  }

  // owner_id es text, participant_ids es uuid[] — casts específicos para cada campo
  await sql(
    `CREATE POLICY "ver propias o conjuntas" ON public.patrimonio_cuentas
     FOR SELECT USING (
       owner_id = auth.uid()::text
       OR auth.uid() = ANY(participant_ids)
     )`,
    'patrimonio_cuentas → SELECT: propias + conjuntas donde participas'
  )

  await sql(
    `CREATE POLICY "crear" ON public.patrimonio_cuentas
     FOR INSERT WITH CHECK (owner_id = auth.uid()::text)`,
    'patrimonio_cuentas → INSERT: solo el creador'
  )

  await sql(
    `CREATE POLICY "editar participadas" ON public.patrimonio_cuentas
     FOR UPDATE USING (
       owner_id = auth.uid()::text
       OR auth.uid() = ANY(participant_ids)
     )`,
    'patrimonio_cuentas → UPDATE: propias o participadas'
  )

  await sql(
    `CREATE POLICY "eliminar propias o participadas" ON public.patrimonio_cuentas
     FOR DELETE USING (
       owner_id = auth.uid()::text
       OR auth.uid() = ANY(participant_ids)
     )`,
    'patrimonio_cuentas → DELETE: propias o participadas'
  )

  // ─ 2. gastos — actualizar política SELECT ─────────────────────────────────
  // Borrar cualquier política SELECT existente (nombre desconocido)
  const oldGastosPolicies = [
    'ver gastos propios', 'usuarios ven sus gastos',
    'gastos select', 'ver gastos compartidos o propios',
    'allow_select', 'select_policy',
  ]
  for (const name of oldGastosPolicies) {
    await sql(
      `DROP POLICY IF EXISTS "${name}" ON public.gastos`,
      `gastos → borrar policy antigua "${name}"`
    )
  }

  await sql(
    `CREATE POLICY "ver gastos compartidos o propios" ON public.gastos
     FOR SELECT USING (
       user_id    = auth.uid()
       OR paid_by_id = auth.uid()
       OR compartido = true
     )`,
    'gastos → SELECT: propios + los que pagué + todos los compartidos'
  )

  // ─ 3. columnas origin/origin_id en gastos ────────────────────────────────
  await sql(
    `ALTER TABLE public.gastos ADD COLUMN IF NOT EXISTS origin    text`,
    'gastos → columna origin'
  )
  await sql(
    `ALTER TABLE public.gastos ADD COLUMN IF NOT EXISTS origin_id uuid`,
    'gastos → columna origin_id'
  )

  console.log('\n✨ Todas las migraciones completadas\n')
}

main().catch((e) => {
  console.error('\n❌ Error inesperado:', e.message || e)
  process.exit(1)
})
