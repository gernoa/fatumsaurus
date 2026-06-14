-- ──────────────────────────────────────────────────────────────────────────────
-- Módulo SALUD
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
create table salud_especialistas (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid references profiles(id) not null,
  nombre               text not null,
  tipo                 text not null,
  modalidad            text not null,              -- bono | por_sesion
  duracion_sesion      int  not null default 60,   -- minutos
  precio_total         numeric(10,2),              -- solo bono
  sesiones_contratadas int,                        -- solo bono
  fecha_pago           date,                       -- solo bono
  precio_sesion        numeric(10,2),              -- solo por_sesion
  pagado_via           text not null default 'personal',  -- personal | conjunta
  activo               boolean not null default true,
  created_at           timestamptz default now()
);
alter table salud_especialistas enable row level security;
create policy "especialistas propios" on salud_especialistas for all using (user_id = auth.uid());

-- Sesiones de especialista
create table salud_sesiones (
  id              uuid primary key default gen_random_uuid(),
  especialista_id uuid references salud_especialistas(id) on delete cascade not null,
  user_id         uuid references profiles(id) not null,
  fecha           date not null,
  duracion        int  not null,
  notas           text,
  pagado_via      text,  -- solo para por_sesion: personal | conjunta
  gasto_id        uuid,  -- FK a gastos (se rellena al guardar)
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

-- Tramos de dosificación (un med puede tener varios en fechas distintas)
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
  exists (
    select 1 from salud_medicamentos
    where id = medicamento_id and user_id = auth.uid()
  )
);

-- Tomas individuales (se crean al marcar como tomada o saltada)
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

-- Documentos (PDFs, imágenes)
create table salud_documentos (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references profiles(id) not null,
  nombre    text not null,
  tipo      text not null,     -- PDF | Imagen
  categoria text,
  url       text not null,
  tamaño_kb int,
  fecha     date,
  created_at timestamptz default now()
);
alter table salud_documentos enable row level security;
create policy "documentos propios" on salud_documentos for all using (user_id = auth.uid());
