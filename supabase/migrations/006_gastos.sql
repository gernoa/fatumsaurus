-- ──────────────────────────────────────────────────────────────────────────────
-- Tabla central de GASTOS (Finanzas + todos los módulos)
-- Un dato se crea una sola vez y aparece en todos los módulos relevantes.
-- ──────────────────────────────────────────────────────────────────────────────

create table gastos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) not null,  -- quién registra el gasto
  paid_by_id  uuid references profiles(id),           -- quién pagó (puede ser otro usuario en conjunta)
  description text not null,
  amount      numeric(10,2) not null,
  date        date not null,
  category    text not null default 'otro',
  -- salud | hogar | alimentacion | alquiler | transporte | personal | ocio
  -- suscripcion | suministros | trabajo | viaje | otro
  paid_via    text not null default 'personal',        -- personal | conjunta
  origin      text,          -- módulo de origen: 'salud', 'hogar', 'vehiculos'...
  origin_id   uuid,          -- id del item en el módulo de origen
  notes       text,
  created_at  timestamptz default now()
);

alter table gastos enable row level security;

-- Ver: gastos que yo registré, que yo pagué, o de la cuenta conjunta
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

-- FK de sesiones → gastos (añadida aquí para no crear dependencia circular en 005)
alter table salud_sesiones
  add constraint salud_sesiones_gasto_id_fkey
  foreign key (gasto_id) references gastos(id) on delete set null;
