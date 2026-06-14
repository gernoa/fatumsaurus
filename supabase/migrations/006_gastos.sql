-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla central de GASTOS (Finanzas + todos los módulos)
-- "compartido: true" = gasto pagado por mí pero dividido 50-50 con pareja
-- ──────────────────────────────────────────────────────────────────────────────

create table gastos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) not null,  -- quién registra
  paid_by_id  uuid references profiles(id),           -- quién pagó
  description text not null,
  amount      numeric(10,2) not null,
  date        date not null,
  category    text not null default 'otro',
  -- salud | hogar | alimentacion | alquiler | transporte | personal | ocio
  -- suscripcion | suministros | trabajo | viaje | otro
  paid_via    text not null default 'personal',   -- personal | conjunta
  compartido  boolean not null default false,     -- 50-50 con pareja (pareja debe amount/2)
  origin      text,          -- módulo de origen: 'salud', 'hogar', 'vehiculos'...
  origin_id   uuid,          -- id del item en el módulo de origen
  notes       text,
  created_at  timestamptz default now()
);

alter table gastos enable row level security;

create policy "ver gastos propios o conjuntos" on gastos
  for select using (
    user_id    = auth.uid()
    or paid_by_id = auth.uid()
    or paid_via   = 'conjunta'
  );

create policy "insertar gastos" on gastos
  for insert with check (user_id = auth.uid());

create policy "editar gastos propios" on gastos
  for update using (user_id = auth.uid());

create policy "borrar gastos propios" on gastos
  for delete using (user_id = auth.uid());

-- FKs de tablas de Salud → gastos (aquí para evitar dependencia circular en 005)
alter table salud_sesiones
  add constraint salud_sesiones_gasto_id_fkey
  foreign key (gasto_id) references gastos(id) on delete set null;

alter table salud_bonos
  add constraint salud_bonos_gasto_id_fkey
  foreign key (gasto_id) references gastos(id) on delete set null;
