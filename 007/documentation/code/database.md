# Base de données — Schéma et politiques

Ce document décrit la table principale utilisée par l'application, déduite du code backend et frontend. Le fichier `supabase-schema.sql` n'étant plus présent, ce document sert de référence vivante.

## Table `motions`

- Finalité: tracer les événements envoyés par des appareils (Raspberry Pi), optionnellement avec position GPS.
- Colonnes et types suggérés:
  - `id` UUID primary key default `gen_random_uuid()`
  - `raspberry_id` text not null
  - `message` text not null
  - `latitude` double precision null
  - `longitude` double precision null
  - `altitude` double precision null
  - `gps_accuracy` double precision null
  - `host` text null
  - `ip_address` text null
  - `raw_date` timestamptz null            -- date brute fournie par le client si existante
  - `message_date` timestamptz not null    -- horodatage serveur (message)
  - `timestamp` timestamptz not null       -- horodatage serveur (réception)

Index recommandés:

- `create index on motions (timestamp desc);`
- `create index on motions (raspberry_id, timestamp desc);`
- `create index on motions (latitude, longitude) where latitude is not null and longitude is not null;`

Exemple de DDL (PostgreSQL/Supabase):

```sql
create extension if not exists pgcrypto;

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
  raw_date timestamptz null,
  message_date timestamptz not null,
  timestamp timestamptz not null
);

create index if not exists motions_ts_idx on public.motions (timestamp desc);
create index if not exists motions_rpi_ts_idx on public.motions (raspberry_id, timestamp desc);
create index if not exists motions_geo_idx on public.motions (latitude, longitude) where latitude is not null and longitude is not null;
```

## RLS (Row Level Security)

Activer RLS et définir des politiques minimales:

```sql
alter table public.motions enable row level security;

-- Lecture ouverte aux clients anonymes (si nécessaire côté frontend)
create policy if not exists motions_read_anon
on public.motions for select
using (true);

-- Insertion strictement via clé service role (les fonctions serverless l'utilisent)
-- Pas de policy insert pour les utilisateurs anonymes.
```

Note: si vous souhaitez limiter la lecture aux seules colonnes non sensibles, créez une vue `public.motions_read` et une policy sur la vue.

## Contraintes et validations

- Vérifier que `latitude` ∈ [-90, 90] et `longitude` ∈ [-180, 180] si non null:
```sql
alter table public.motions
  add constraint motions_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90));
alter table public.motions
  add constraint motions_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180));
```

- Garantir la cohérence temporelle:
```sql
alter table public.motions
  add constraint motions_message_timestamp_not_future
  check (timestamp <= now() + interval '5 minutes');
```

## Ingestion côté API

- L'API `/api/motion` renseigne toujours `message_date` et `timestamp` côté serveur.
- `raspberry_id` est dérivé de l'IP: `rpi-<ip-avec-tirets>`.
- `raw_date` conserve la date fournie par l'appareil si transmise (sans confiance forte).

## Exemples de requêtes

- Dernière position connue par appareil (équivalent `/api/health`):
```sql
with latest as (
  select distinct on (raspberry_id)
    raspberry_id, latitude, longitude, altitude, gps_accuracy, timestamp, message, host, ip_address
  from public.motions
  where latitude is not null and longitude is not null
  order by raspberry_id, timestamp desc
)
select * from latest order by timestamp desc;
```

- Statistiques par appareil (équivalent `/api/stats`):
```sql
select
  raspberry_id,
  count(*) as total_messages,
  min(timestamp) as first_seen,
  max(timestamp) as last_seen,
  count(distinct (date_trunc('day', timestamp))) as active_days,
  avg(nullif(gps_accuracy, null)) as avg_accuracy
from public.motions
group by raspberry_id
order by last_seen desc;
```
