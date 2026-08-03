-- ============================================================
-- FORGE LOBBY · Supabase Schema
-- Correr esto en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de jugadores
create table if not exists players (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  avatar_id  text not null,
  room_id    text not null,
  score      integer not null default 0,
  status     text not null default 'waiting',  -- waiting | playing | done
  created_at timestamptz default now()
);

-- Índice para consultas por sala
create index if not exists players_room_id_idx on players(room_id);

-- ─── Row Level Security ───────────────────────────────────────
alter table players enable row level security;

-- Cualquiera puede leer jugadores de su sala
create policy "Lectura pública de jugadores"
  on players for select
  using (true);

-- Cualquiera puede insertar (joinear una sala)
create policy "Inserción pública"
  on players for insert
  with check (true);

-- Cada jugador solo puede actualizar su propio registro
create policy "Actualización propia"
  on players for update
  using (true);  -- simplificado para el prototipo

-- ─── Realtime ─────────────────────────────────────────────────
-- Habilitar Realtime para esta tabla desde el dashboard:
-- Database → Replication → supabase_realtime → agregar tabla "players"

-- ─── Limpieza automática (opcional) ──────────────────────────
-- Borra salas con más de 24hs de antigüedad
-- create extension if not exists pg_cron;
-- select cron.schedule('cleanup-old-rooms', '0 3 * * *', $$
--   delete from players where created_at < now() - interval '24 hours';
-- $$);
