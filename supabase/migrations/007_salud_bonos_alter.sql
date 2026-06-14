-- ──────────────────────────────────────────────────────────────────────────────
-- SOLO ejecutar si ya habías corrido las versiones ANTIGUAS de 005 y 006.
-- Si aún no los has ejecutado, usa directamente los archivos 005 y 006
-- actualizados — no necesitas este archivo.
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Quitar campos de bono de salud_especialistas (se mueven a salud_bonos)
alter table salud_especialistas
  drop column if exists precio_total,
  drop column if exists sesiones_contratadas,
  drop column if exists fecha_pago,
  drop column if exists pagado_via;

-- 2. Crear tabla salud_bonos
create table if not exists salud_bonos (
  id                   uuid primary key default gen_random_uuid(),
  especialista_id      uuid references salud_especialistas(id) on delete cascade not null,
  user_id              uuid references profiles(id) not null,
  sesiones_contratadas int           not null,
  precio_total         numeric(10,2) not null,
  fecha_pago           date          not null,
  pagado_via           text          not null default 'personal',
  compartido           boolean       not null default true,
  activo               boolean       not null default true,
  gasto_id             uuid,
  created_at           timestamptz   default now()
);
alter table salud_bonos enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'salud_bonos' and policyname = 'bonos propios'
  ) then
    execute 'create policy "bonos propios" on salud_bonos for all using (user_id = auth.uid())';
  end if;
end $$;

-- 3. FK salud_bonos → gastos
do $$ begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'salud_bonos_gasto_id_fkey'
  ) then
    alter table salud_bonos
      add constraint salud_bonos_gasto_id_fkey
      foreign key (gasto_id) references gastos(id) on delete set null;
  end if;
end $$;

-- 4. Añadir compartido a gastos
alter table gastos add column if not exists compartido boolean not null default false;
