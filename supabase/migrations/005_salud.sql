-- ──────────────────────────────────────────────────────────────────────────────
-- Módulo SALUD
-- Los bonos de especialista van en salud_bonos (varios por especialista).
-- ──────────────────────────────────────────────────────────────────────────────

-- Citas médicas
create table salud_citas (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) not null,
  fecha        date not null,
  hora         time not null,
  especialidad text not null,
  medico       text,
  centro       text,
  estado       text not null default 'pendiente',   -- pendiente | realizada | cancelada
  notas        text,
  resultado    text,
  created_at   timestamptz default now()
);
alter table salud_citas enable row level security;
create policy "citas propias" on salud_citas for all using (user_id = auth.uid());

-- Especialistas (fisio, psicólogo, nutricionista...)
-- Los campos de bono YA NO están aquí — están en salud_bonos
create table salud_especialistas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) not null,
  nombre          text not null,
  tipo            text not null,
  modalidad       text not null,              -- bono | por_sesion
  duracion_sesion int  not null default 60,   -- minutos por sesión estándar
  precio_sesion   numeric(10,2),              -- solo por_sesion
  activo          boolean not null default true,
  created_at      timestamptz default now()
);
alter table salud_especialistas enable row level security;
create policy "especialistas propios" on salud_especialistas for all using (user_id = auth.uid());

-- Bonos de sesiones — uno o más por especialista
-- Cada bono genera un gasto en la tabla gastos (FK añadida en 006)
create table salud_bonos (
  id                   uuid primary key default gen_random_uuid(),
  especialista_id      uuid references salud_especialistas(id) on delete cascade not null,
  user_id              uuid references profiles(id) not null,
  sesiones_contratadas int            not null,
  precio_total         numeric(10,2)  not null,
  fecha_pago           date           not null,
  pagado_via           text           not null default 'personal',  -- personal | conjunta
  compartido           boolean        not null default true,        -- 50-50 con pareja
  activo               boolean        not null default true,
  gasto_id             uuid,          -- FK a gastos añadida en 006
  created_at           timestamptz    default now()
);
alter table salud_bonos enable row level security;
create policy "bonos propios" on salud_bonos for all using (user_id = auth.uid());

-- Sesiones de especialista
create table salud_sesiones (
  id              uuid primary key default gen_random_uuid(),
  especialista_id uuid references salud_especialistas(id) on delete cascade not null,
  user_id         uuid references profiles(id) not null,
  fecha           date not null,
  duracion        int  not null,
  notas           text,
  pagado_via      text,   -- solo por_sesion: personal | conjunta
  gasto_id        uuid,   -- FK a gastos (por_sesion), añadida en 006
  created_at      timestamptz default now()
);
alter table salud_sesiones enable row level security;
create policy "sesiones propias" on salud_sesiones for all using (user_id = auth.uid());

-- Medicamentos y suplementos
create table salud_medicamentos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) not null,
  nombre       text not null,
  tipo         text not null default 'Medicamento',  -- Medicamento | Suplemento | Vitamina
  stock        int  not null default 0,
  stock_minimo int  not null default 10,
  activo       boolean not null default true,
  created_at   timestamptz default now()
);
alter table salud_medicamentos enable row level security;
create policy "medicamentos propios" on salud_medicamentos for all using (user_id = auth.uid());

-- Tramos de dosificación
create table salud_tramos (
  id             uuid primary key default gen_random_uuid(),
  medicamento_id uuid references salud_medicamentos(id) on delete cascade not null,
  dosis          numeric(5,2) not null,
  unidad         text not null,
  frecuencia     text not null,   -- diaria | semanal | si_necesario
  momentos       text[] not null default '{}',
  inicio         date not null,
  fin            date,
  activo         boolean not null default true,
  created_at     timestamptz default now()
);
alter table salud_tramos enable row level security;
create policy "tramos via medicamento" on salud_tramos for all using (
  exists (select 1 from salud_medicamentos where id = medicamento_id and user_id = auth.uid())
);

-- Tomas individuales
create table salud_tomas (
  id             uuid primary key default gen_random_uuid(),
  medicamento_id uuid references salud_medicamentos(id) on delete cascade not null,
  tramo_id       uuid references salud_tramos(id) on delete set null,
  user_id        uuid references profiles(id) not null,
  fecha_prevista date not null,
  momento        text,
  estado         text not null default 'tomada',  -- tomada | saltada
  hora_real      text,
  notas          text,
  created_at     timestamptz default now(),
  unique (medicamento_id, fecha_prevista, momento)
);
alter table salud_tomas enable row level security;
create policy "tomas propias" on salud_tomas for all using (user_id = auth.uid());

-- Historial médico
create table salud_historial (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) not null,
  fecha       date not null,
  tipo        text not null,    -- Consulta | Diagnóstico | Intervención | Analítica | Vacuna | Otro
  titulo      text not null,
  descripcion text,
  medico      text,
  centro      text,
  etiquetas   text[] not null default '{}',
  created_at  timestamptz default now()
);
alter table salud_historial enable row level security;
create policy "historial propio" on salud_historial for all using (user_id = auth.uid());

-- Documentos
create table salud_documentos (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) not null,
  nombre    text not null,
  tipo      text not null,
  categoria text,
  url       text not null,
  tamaño_kb int,
  fecha     date,
  created_at timestamptz default now()
);
alter table salud_documentos enable row level security;
create policy "documentos propios" on salud_documentos for all using (user_id = auth.uid());
