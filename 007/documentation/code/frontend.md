# Frontend — Architecture et composants

Application React (Vite + TypeScript) avec un écran fanpage et un écran de contrôle (dashboard) alimenté par Supabase.

## Démarrage

- Point d'entrée: `src/main.tsx` monte `<App />` dans `#root` (StrictMode).
- `src/App.tsx` gère un routing hash ultra-simple:
  - `#` → fanpage (`Landing`)
  - `#/control` → `Dashboard`
  - Widgets décoratifs: `DraggableOlive`, `DraggableBottle` sont toujours montés.

## Accès données — Supabase

- Client: `src/app/lib/supabaseClient.ts`
  - Utilise `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
  - `persistSession: false` (pas d'auth utilisateur gérée côté client).
- Lecture principale (dans `Dashboard`):
  - `from('motions').select(...).order('timestamp', { descending: true }).limit(1000)`

Variables d'environnement (fichier `.env` Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Écran contrôle — `src/app/application/dashboard.tsx`

Fonctionnalités:

- Chargement des derniers événements (`motions`) et rafraîchissement manuel.
- Carte: utilise `InteractiveMap` pour afficher un point par Raspberry (dernier message géolocalisé). Les points sont marqués offline par design pour un code couleur homogène.
- Tableau filtrable: filtres par date début/fin, texte `raspberry_id`, texte `host/ip`.
- Zone "requêtes directes" vers le Raspberry:
  - Bouton "Vérifier état (life)": GET vers une URL Cloudflare (proxy) et déduit un statut binaire.
  - Bouton "Demander position (loc)": GET vers la même base; parse `{lat,lon}` ou une chaîne `"lat,lon"`.

États principaux:

- `items`: liste des événements tipés `MotionEvent`.
- `loading`, `error`, `lastUpdated`.
- Filtres: `filterDateFrom`, `filterDateTo`, `filterRaspberry`, `filterHost`.
- Probes: `lifeOnline`, `locCoords`, `probeLoading`, `probeError`.

Dérivations notables:

- `raspberries`: dernier événement par `raspberry_id` afin d'alimenter le select.
- `mapPoints`: dernier point géo par `raspberry_id` (avec calcul `last_seen_minutes`).
- `filteredItems`: application des filtres avant rendu du tableau.

## Composants UI

- `InteractiveMap`: affiche les points des Raspberry avec `raspberry_id`, `timestamp`, précision GPS éventuelle.
- `DraggableOlive` et `DraggableBottle`: éléments décoratifs interactifs.
- Fanpage (`src/app/fanpage/*`): sections marketing (hero, carousel, dossiers, FAQ, newsletter, footer) utilisées par `Landing`.

## Styles

- Styles globaux: `src/index.css` (inclut Tailwind-like utilitaires dans les classes; pas de config Tailwind explicite ici).
- Thème: fond sombre, accent `text-yellow-600`.

## Navigation

- Routing hash minimaliste; pas de lib de routing.
- Changement d'onglet géré par `window.addEventListener('hashchange', ...)`.

## Intégration backend

- Le frontend lit directement Supabase pour la visualisation.
- Les endpoints `/api/*` côté serveur sont plutôt consommés par des intégrations externes (ingestion) ou par des outils, pas par ce frontend.
