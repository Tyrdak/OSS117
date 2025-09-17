import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const INGEST_SECRET = process.env.INGEST_SECRET || process.env.SECRET || "feur";
const TABLE_NAME = process.env.MOTIONS_TABLE || "motions";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};

    // Support multiple payload shapes and casings
    const providedKey = body.Key || body.key || body.secret || "";
    if (!providedKey || providedKey !== INGEST_SECRET) {
      return res.status(403).json({ ok: false, error: "ACCESS DENIED" });
    }

    const message = body.Msg || body.msg || body.event || "Vodka-Martini";
    const host = body.Host || body.host || body.device || "unknown";
    const rawDate = body.date || body.ts || null;
    
    // Coordonnées GPS (supporte lat/lon séparés OU champ unique "loc" => "lat,lon")
    let latitude = parseFloat(body.lat || body.latitude || body.Lat || body.Latitude);
    let longitude = parseFloat(body.lon || body.longitude || body.Lon || body.Longitude);
    if ((isNaN(latitude) || isNaN(longitude)) && typeof body.loc === "string") {
      const m = body.loc.trim().match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
      if (m) {
        latitude = parseFloat(m[1]);
        longitude = parseFloat(m[2]);
      }
    }
    const altitude = parseFloat(body.alt || body.altitude || body.Alt || body.Altitude);
    const gpsAccuracy = parseFloat(body.accuracy || body.gps_accuracy || body.Accuracy);
    
    // Date/heure côté serveur (réception) — on force l'horodatage ici
    const now = new Date();
    const nowIso = now.toISOString();
    // Pour répondre à la demande, on stocke la date serveur dans message_date
    const messageDate = nowIso;
    
    const ip =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "0.0.0.0";

    // Générer un ID unique pour le Raspberry Pi basé sur l'IP ou host
    const raspberryId = `rpi-${ip.replace(/\./g, '-')}`;

    // nowIso déjà calculé ci-dessus

    const payload = {
      raspberry_id: raspberryId,
      message,
      latitude: isNaN(latitude) ? null : latitude,
      longitude: isNaN(longitude) ? null : longitude,
      altitude: isNaN(altitude) ? null : altitude,
      gps_accuracy: isNaN(gpsAccuracy) ? null : gpsAccuracy,
      host,
      ip_address: ip,
      raw_date: rawDate,
      message_date: messageDate,
      timestamp: nowIso,
    };

    const { error } = await supabase.from(TABLE_NAME).insert([payload]);
    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, received: payload });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}


