-- Extension nécessaire pour gen_random_uuid()
create extension if not exists pgcrypto;

-- Création de la table motions
create table if not exists public.motions (
  id uuid primary key default gen_random_uuid(),
  raspberry_id text not null,
  message text not null,
  latitude double precision null,
  longitude double precision null,
  altitude double precision null,
  gps_accuracy double precision null,
  host text null,
  ip_address text null,
  url text null,
  raw_date timestamptz null,
  message_date timestamptz not null,
  timestamp timestamptz not null
);

-- Index pour optimiser les requêtes
create index if not exists motions_ts_idx on public.motions (timestamp desc);
create index if not exists motions_rpi_ts_idx on public.motions (raspberry_id, timestamp desc);
create index if not exists motions_geo_idx on public.motions (latitude, longitude) where latitude is not null and longitude is not null;

-- Contraintes de validation
alter table public.motions
  add constraint if not exists motions_latitude_range 
  check (latitude is null or (latitude >= -90 and latitude <= 90));

alter table public.motions
  add constraint if not exists motions_longitude_range 
  check (longitude is null or (longitude >= -180 and longitude <= 180));

alter table public.motions
  add constraint if not exists motions_message_timestamp_not_future
  check (timestamp <= now() + interval '5 minutes');

-- Activation de Row Level Security (RLS)
alter table public.motions enable row level security;

-- Policy de lecture pour les utilisateurs anonymes (frontend)
create policy if not exists motions_read_anon
on public.motions for select
using (true);

-- Pas de policy d'insertion pour les anonymes
-- L'insertion se fait uniquement via l'API avec la clé service role
