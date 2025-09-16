import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLIC_ANON_KEY || process.env.SUPABASE_ANON;
const TABLE_NAME = process.env.MOTIONS_TABLE || "motions";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

export default async function handler(_req, res) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id, raspberry_id, message, latitude, longitude, altitude, gps_accuracy, host, ip_address, raw_date, message_date, timestamp")
      .order("timestamp", { ascending: true })
      .limit(500);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, items: data ?? [] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}


