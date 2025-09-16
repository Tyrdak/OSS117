// server.js
import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Config ---
const SECRET = "feur"; // 🔑 à changer
const LOG = path.join(process.cwd(), "logs.txt");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- API: POST ingest ---
app.post("/ingest", (req, res) => {
  const { key, msg = "no-msg", device = "unknown" } = req.body;

  if (!key || key !== SECRET) {
    return res.status(403).send("ACCESS DENIED");
  }

  // Sanitize
  const safeMsg = String(msg).replace(/[\n\r|]/g, " ");
  const safeDevice = String(device).replace(/[\n\r|]/g, " ");

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
  const ts = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

  const line = `${ts}|${ip}|${safeDevice}|${safeMsg}\n`;
  fs.appendFileSync(LOG, line, { encoding: "utf-8" });

  res.type("text/plain; charset=UTF-8").send(`OK :: ${ts}`);
});

// --- API: GET feed=1 -> JSON ---
app.get("/feed", (req, res) => {
  let out = [];

  if (fs.existsSync(LOG)) {
    const rows = fs.readFileSync(LOG, "utf-8").split("\n").filter(Boolean).reverse();
    const slice = rows.slice(0, 200);

    for (const r of slice) {
      const parts = r.split("|");
      if (parts.length >= 4) {
        out.push({
          ts: parts[0].trim(),
          ip: parts[1].trim(),
          device: parts[2].trim(),
          msg: parts[3].trim(),
        });
      } else if (parts.length === 3) {
        out.push({
          ts: parts[0].trim(),
          ip: parts[1].trim(),
          device: "",
          msg: parts[2].trim(),
        });
      }
    }
  }

  res.json({ ok: true, data: out });
});

// --- Page espion (GET simple) ---
app.get("/", (req, res) => {
  // tu peux mettre ton HTML direct ici ou utiliser res.sendFile
  res.sendFile(path.join(process.cwd(), "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
