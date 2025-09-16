# 🕵️ Agent 007 - Système de Surveillance Raspberry Pi

Système de surveillance en temps réel pour Raspberry Pi avec coordonnées GPS, carte interactive et dashboard professionnel.

## 🚀 Fonctionnalités

### Dashboard de Surveillance
- **Carte interactive** avec positions GPS en temps réel
- **Statut en ligne/hors ligne** des Raspberry Pi
- **Dernier message reçu** affiché en évidence
- **Liste complète des messages** avec filtrage par Raspberry Pi
- **Coordonnées GPS précises** avec altitude et précision
- **Mise à jour automatique** toutes les 5 secondes

### APIs
- `POST /api/motion` - Réception des données des Raspberry Pi
- `GET /api/motions` - Liste des messages avec GPS
- `GET /api/latest` - Dernières données et statistiques
- `GET /api/health` - Statut des Raspberry Pi opérationnels
- `GET /api/stats` - Statistiques par Raspberry Pi

## 🛠️ Installation

### 1. Dépendances
```bash
npm install --legacy-peer-deps
```

### 2. Variables d'environnement Vercel
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
INGEST_SECRET=feur
MOTIONS_TABLE=motions
```

### 3. Base de données Supabase
Exécutez le contenu de `supabase-schema.sql` dans l'éditeur SQL de Supabase.

## 🐍 Code Raspberry Pi

### Configuration GPS
Modifiez les coordonnées dans `raspberry-example.py` :
```python
GPS_LATITUDE = 48.8566  # Votre latitude
GPS_LONGITUDE = 2.3522  # Votre longitude
GPS_ALTITUDE = 35.0     # Votre altitude
GPS_ACCURACY = 5.0      # Précision en mètres
```

### Installation sur Raspberry Pi
```bash
pip install requests gpiozero
python raspberry-example.py
```

### Données envoyées
```python
data = {
    "Key": "feur",
    "Msg": "Vodka-Martini",
    "Host": "rpi-001",
    "date": "25-01 14:30:15",
    "lat": 48.8566,
    "lon": 2.3522,
    "alt": 35.0,
    "accuracy": 5.0,
    "timestamp": "2025-01-25T14:30:15.123456",
    "timezone": "Europe/Paris",
    "version": "1.0"
}
```

## 🗺️ Interface Dashboard

### Onglet Carte Interactive
- Marqueurs colorés par statut :
  - 🟢 **Vert** : En ligne (activité < 5min)
  - 🟠 **Orange** : Récent (activité < 1h)
  - 🔴 **Rouge** : Hors ligne (activité > 1h)
- **Clic sur marqueur** : Filtre les messages du Raspberry Pi
- **Popup détaillé** : Informations complètes

### Onglet Messages
- **Filtrage par Raspberry Pi** (cliquez sur la carte)
- **Coordonnées GPS** avec précision
- **Timestamps multiples** : réception + Raspberry Pi
- **Informations réseau** : host, IP

## 📊 Base de données

### Table `motions`
```sql
- id (UUID, PK)
- raspberry_id (VARCHAR) - ID unique du Raspberry Pi
- message (TEXT) - Message de l'événement
- latitude (DECIMAL) - Coordonnée GPS latitude
- longitude (DECIMAL) - Coordonnée GPS longitude
- altitude (DECIMAL) - Altitude en mètres
- gps_accuracy (DECIMAL) - Précision GPS en mètres
- host (VARCHAR) - Nom d'hôte
- ip_address (INET) - Adresse IP
- raw_date (TEXT) - Date brute du Raspberry Pi
- message_date (TIMESTAMPTZ) - Date parsée du message
- timestamp (TIMESTAMPTZ) - Timestamp de réception
- created_at (TIMESTAMPTZ) - Date de création
```

### Vues utiles
- `recent_motions` - 500 derniers messages
- `raspberry_stats` - Statistiques par Raspberry Pi

## 🔧 Développement

### Démarrer en local
```bash
npm run dev
```

### Build pour production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## 🚨 Surveillance

### Statut des Raspberry Pi
- **En ligne** : Message reçu dans les 5 dernières minutes
- **Hors ligne** : Aucun message depuis plus de 5 minutes
- **Dernière activité** : Affichée en minutes

### Alertes
- Messages d'erreur dans les logs du Raspberry Pi
- Statut de connexion visible sur le dashboard
- Historique des positions GPS

## 📱 Utilisation

1. **Déployez** l'application sur Vercel
2. **Configurez** Supabase avec le schéma fourni
3. **Installez** le code Python sur vos Raspberry Pi
4. **Modifiez** les coordonnées GPS dans le code Python
5. **Surveillez** via le dashboard en temps réel

## 🎯 Prochaines étapes

- [ ] Notifications push pour alertes
- [ ] Historique des trajets
- [ ] Géofencing (zones d'alerte)
- [ ] Export des données
- [ ] API de configuration à distance

---

**Agent 007** - Surveillance professionnelle des Raspberry Pi 🕵️‍♂️