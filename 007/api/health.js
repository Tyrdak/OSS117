import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_ANON_KEY || process.env.SUPABASE_ANON;
const TABLE_NAME = process.env.MOTIONS_TABLE || "motions";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    // Récupérer les dernières positions de chaque Raspberry Pi
    const { data: motions, error } = await supabase
      .from(TABLE_NAME)
      .select("raspberry_id, latitude, longitude, altitude, gps_accuracy, timestamp, message, host, ip_address")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("timestamp", { ascending: false });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    // Grouper par Raspberry Pi et garder la position la plus récente
    const raspberryPositions = {};
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes

    motions.forEach(motion => {
      const id = motion.raspberry_id;
      const motionTime = new Date(motion.timestamp);
      
      if (!raspberryPositions[id] || motionTime > new Date(raspberryPositions[id].timestamp)) {
        raspberryPositions[id] = {
          raspberry_id: id,
          latitude: motion.latitude,
          longitude: motion.longitude,
          altitude: motion.altitude,
          gps_accuracy: motion.gps_accuracy,
          timestamp: motion.timestamp,
          last_message: motion.message,
          host: motion.host,
          ip_address: motion.ip_address,
          is_online: motionTime > fiveMinutesAgo, // En ligne si message récent
          last_seen_minutes: Math.floor((now - motionTime) / (1000 * 60))
        };
      }
    });

    // Convertir en array et trier par statut (en ligne d'abord)
    const result = Object.values(raspberryPositions).sort((a, b) => {
      if (a.is_online && !b.is_online) return -1;
      if (!a.is_online && b.is_online) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return res.status(200).json({ 
      ok: true, 
      raspberries: result,
      total_online: result.filter(r => r.is_online).length,
      total_offline: result.filter(r => !r.is_online).length
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}
