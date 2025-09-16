import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_ANON_KEY || process.env.SUPABASE_ANON;
const TABLE_NAME = process.env.MOTIONS_TABLE || "motions";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

export default async function handler(_req, res) {
  try {
    // Récupérer les statistiques des Raspberry Pi
    const { data: stats, error: statsError } = await supabase
      .from(TABLE_NAME)
      .select("raspberry_id, timestamp, gps_accuracy")
      .order("timestamp", { ascending: false });

    if (statsError) {
      return res.status(500).json({ ok: false, error: statsError.message });
    }

    // Grouper par Raspberry Pi
    const raspberryStats = {};
    stats.forEach(motion => {
      const id = motion.raspberry_id;
      if (!raspberryStats[id]) {
        raspberryStats[id] = {
          raspberry_id: id,
          total_messages: 0,
          first_seen: motion.timestamp,
          last_seen: motion.timestamp,
          active_days: new Set(),
          accuracy_sum: 0,
          accuracy_count: 0
        };
      }
      
      raspberryStats[id].total_messages++;
      raspberryStats[id].first_seen = motion.timestamp; // Plus récent en premier
      if (motion.gps_accuracy !== null) {
        raspberryStats[id].accuracy_sum += motion.gps_accuracy;
        raspberryStats[id].accuracy_count++;
      }
      
      // Compter les jours actifs
      const date = new Date(motion.timestamp).toDateString();
      raspberryStats[id].active_days.add(date);
    });

    // Convertir en array et calculer les moyennes
    const result = Object.values(raspberryStats).map(stat => ({
      raspberry_id: stat.raspberry_id,
      total_messages: stat.total_messages,
      first_seen: stat.first_seen,
      last_seen: stat.last_seen,
      active_days: stat.active_days.size,
      avg_accuracy: stat.accuracy_count > 0 ? stat.accuracy_sum / stat.accuracy_count : null
    })).sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));

    return res.status(200).json({ ok: true, raspberries: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}
