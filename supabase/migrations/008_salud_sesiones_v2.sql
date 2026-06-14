-- ──────────────────────────────────────────────────────────────────────────────
-- Salud sesiones v2: hora y campo realizada
-- realizada = false → sesión prevista (no consume tiempo del bono)
-- realizada = true  → sesión confirmada (sí consume tiempo del bono)
-- ──────────────────────────────────────────────────────────────────────────────

alter table salud_sesiones add column if not exists hora      time;
alter table salud_sesiones add column if not exists realizada boolean not null default false;

-- Las sesiones ya existentes se marcan como realizadas (ya ocurrieron)
update salud_sesiones set realizada = true where realizada = false;
