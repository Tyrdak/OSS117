# Backend — Endpoint unique Next.js (ingestion)

Ce projet expose un seul endpoint backend (API Next.js) chargé d’ingérer des événements envoyés par des appareils (ex: Raspberry). Il écrit dans la table `motions` de Supabase.

## Fichier et signature

- Fichier: endpoint API Next.js exportant `export default async function handler(req: NextApiRequest, res: NextApiResponse)`
- Méthode: `POST` uniquement (réponse `405` sinon)

## Variables d’environnement

- `SUPABASE_URL`: URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: clé service role (écriture) — ne jamais exposer côté client
- `INGEST_SECRET`: secret d’ingestion requis en production
- `MOTIONS_TABLE` (optionnel): nom de la table (défaut: `motions`). Un mécanisme normalise le nom pour éviter `public.public.motions` si un schéma était inclus

Note: en production, `INGEST_SECRET` est obligatoire et vérifié strictement; en développement, si `INGEST_SECRET` est défini, il doit quand même correspondre, sinon l’accès est refusé.

## Validation et parsing de la requête

- Le body est accepté en JSON. Le code tente:
  - `JSON.parse(body)`
  - si échec: remplace les `'` par `"` puis réessaie
  - sinon renvoie `400 { ok: false, error: "Invalid JSON body" }`

- Authentification:
  - La clé est lue dans `Key` ou `key` du body
  - En production: `INGEST_SECRET` doit être défini et correspondre, sinon `403 ACCESS DENIED`
  - En développement: si `INGEST_SECRET` est défini et ne correspond pas, `403`

## Champs acceptés (tolérance de formats)

- Message: `Msg` (string), défaut: `"Vodka-Martini"`
- Hôte: `Host` (string), défaut: `"unknown"`
- URL libre: `Url` | `url` | `URL` (insensible à la casse du nom clé via détection), stockée dans `url` si string
- Coordonnées:
  - `lat` | `latitude` (number|string)
  - `lon` | `longitude` (number|string)
  - Alternative: `loc` en chaîne `"lat,lon"`

## Enrichissement serveur

- `ip`: récupérée via `x-forwarded-for` (première IP) sinon `req.socket.remoteAddress`
- `raspberry_id`: dérivé de l’IP, format `rpi-<ip-avec-tirets>`
- `message_date` et `timestamp`: `new Date().toISOString()` (horodatage serveur)

## Écriture Supabase

- Préconditions: `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` doivent être définies, sinon `500`
- Client: `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })`
- Table: normalisée à partir de `MOTIONS_TABLE` (ou `motions` par défaut)
- Insertion d’un unique enregistrement:
  - `raspberry_id`
  - `message`
  - `latitude`/`longitude` (ou `null` si non numériques)
  - `host`
  - `url` (ou `null`)
  - `ip_address`
  - `message_date`, `timestamp`
- Réponses:
  - Succès: `200 { ok: true, received: payload }`
  - Erreur Supabase: `500 { ok: false, error: <message> }`

## Exemple de payload (client)

```json
{
  "Key": "<INGEST_SECRET>",
  "Msg": "motion detected",
  "Host": "rpi-salon",
  "loc": "43.604, 1.443"
}
```

## Schéma minimal attendu (table `motions`)

- `id` (uuid, pk, default gen_random_uuid())
- `raspberry_id` (text, not null)
- `message` (text, not null)
- `latitude` (double precision, null)
- `longitude` (double precision, null)
- `host` (text, null)
- `url` (text, null)
- `ip_address` (text, null)
- `message_date` (timestamptz, not null)
- `timestamp` (timestamptz, not null)

Voir `documentation/code/database.md` pour des DDL et index recommandés.
