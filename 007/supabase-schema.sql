-- Création de la table pour stocker les événements de mouvement des Raspberry Pi
CREATE TABLE IF NOT EXISTS motions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    raspberry_id VARCHAR(50) NOT NULL, -- ID unique du Raspberry Pi
    message TEXT NOT NULL, -- Message de l'événement (ex: "Vodka-Martini")
    latitude DECIMAL(10, 8), -- Coordonnée GPS latitude (-90 à +90)
    longitude DECIMAL(11, 8), -- Coordonnée GPS longitude (-180 à +180)
    altitude DECIMAL(8, 2), -- Altitude en mètres (optionnel)
    gps_accuracy DECIMAL(6, 2), -- Précision GPS en mètres (optionnel)
    host VARCHAR(100), -- Nom d'hôte du Raspberry Pi
    ip_address INET, -- Adresse IP du Raspberry Pi
    raw_date TEXT, -- Date brute envoyée par le Raspberry Pi
    message_date TIMESTAMPTZ, -- Date du message (par le Raspberry Pi)
    timestamp TIMESTAMPTZ DEFAULT NOW(), -- Timestamp de réception
    created_at TIMESTAMPTZ DEFAULT NOW() -- Date de création de l'enregistrement
);

-- Index pour optimiser les requêtes par Raspberry Pi et par date
CREATE INDEX IF NOT EXISTS idx_motions_raspberry_id ON motions(raspberry_id);
CREATE INDEX IF NOT EXISTS idx_motions_timestamp ON motions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_motions_created_at ON motions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_motions_message_date ON motions(message_date DESC);
CREATE INDEX IF NOT EXISTS idx_motions_raspberry_timestamp ON motions(raspberry_id, timestamp DESC);

-- Index spatial pour les requêtes GPS (PostGIS requis)
-- CREATE INDEX IF NOT EXISTS idx_motions_location ON motions USING GIST (ST_Point(longitude, latitude));

-- RLS (Row Level Security) - permet la lecture publique mais écriture via service role uniquement
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'motions' AND n.nspname = 'public'
    ) THEN
        ALTER TABLE motions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Politique pour permettre la lecture publique (pour le dashboard)
DROP POLICY IF EXISTS "Allow public read access" ON motions;
CREATE POLICY "Allow public read access" ON motions
    FOR SELECT USING (true);

-- Politique pour permettre l'insertion via service role (pour l'API)
DROP POLICY IF EXISTS "Allow service role insert" ON motions;
CREATE POLICY "Allow service role insert" ON motions
    FOR INSERT WITH CHECK (true);

-- Vue pour faciliter les requêtes du dashboard
CREATE OR REPLACE VIEW recent_motions AS
SELECT 
    id,
    raspberry_id,
    message,
    latitude,
    longitude,
    altitude,
    gps_accuracy,
    host,
    ip_address,
    raw_date,
    message_date,
    timestamp,
    created_at
FROM motions
ORDER BY timestamp DESC
LIMIT 500;

-- Vue pour les statistiques par Raspberry Pi
CREATE OR REPLACE VIEW raspberry_stats AS
SELECT 
    raspberry_id,
    COUNT(*) as total_messages,
    MIN(timestamp) as first_seen,
    MAX(timestamp) as last_seen,
    COUNT(DISTINCT DATE(timestamp)) as active_days,
    AVG(gps_accuracy) as avg_accuracy
FROM motions
GROUP BY raspberry_id
ORDER BY last_seen DESC;

-- Fonction pour nettoyer les anciens enregistrements (optionnel)
CREATE OR REPLACE FUNCTION cleanup_old_motions()
RETURNS void AS $$
BEGIN
    -- Supprime les enregistrements plus anciens que 30 jours
    DELETE FROM motions 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Commentaires sur la table
COMMENT ON TABLE motions IS 'Table pour stocker les événements de mouvement détectés par les Raspberry Pi avec coordonnées GPS';
COMMENT ON COLUMN motions.raspberry_id IS 'Identifiant unique du Raspberry Pi (ex: rpi-001, rpi-002)';
COMMENT ON COLUMN motions.message IS 'Message de l''événement envoyé par le Raspberry Pi';
COMMENT ON COLUMN motions.latitude IS 'Coordonnée GPS latitude (-90 à +90)';
COMMENT ON COLUMN motions.longitude IS 'Coordonnée GPS longitude (-180 à +180)';
COMMENT ON COLUMN motions.altitude IS 'Altitude en mètres (optionnel)';
COMMENT ON COLUMN motions.gps_accuracy IS 'Précision GPS en mètres (optionnel)';
COMMENT ON COLUMN motions.host IS 'Nom d''hôte du Raspberry Pi';
COMMENT ON COLUMN motions.ip_address IS 'Adresse IP du Raspberry Pi';
COMMENT ON COLUMN motions.raw_date IS 'Date brute formatée par le Raspberry Pi';
COMMENT ON COLUMN motions.message_date IS 'Date du message selon le Raspberry Pi';
COMMENT ON COLUMN motions.timestamp IS 'Timestamp de réception de l''événement';
