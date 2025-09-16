import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_ANON_KEY || process.env.SUPABASE_ANON;
const TABLE_NAME = process.env.MOTIONS_TABLE || "motions";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

export default async function handler(req, res) {
  try {
    // Récupérer le dernier message reçu
    const { data: latest, error: latestError } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') {
      return res.status(500).json({ ok: false, error: latestError.message });
    }

    // Récupérer tous les messages avec positions GPS
    const { data: allMessages, error: messagesError } = await supabase
      .from(TABLE_NAME)
      .select("id, raspberry_id, message, latitude, longitude, altitude, gps_accuracy, host, ip_address, raw_date, message_date, timestamp")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (messagesError) {
      return res.status(500).json({ ok: false, error: messagesError.message });
    }

    // Statistiques générales
    const totalMessages = allMessages.length;
    const uniqueRaspberries = new Set(allMessages.map(m => m.raspberry_id)).size;
    
    // Messages des dernières 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMessages = allMessages.filter(m => new Date(m.timestamp) > oneDayAgo);

    return res.status(200).json({ 
      ok: true,
      latest_message: latest || null,
      all_messages: allMessages,
      statistics: {
        total_messages: totalMessages,
        unique_raspberries: uniqueRaspberries,
        messages_last_24h: recentMessages.length
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}
