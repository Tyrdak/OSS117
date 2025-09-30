import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import InteractiveMap from '../components/interactiveMap'

type MotionEvent = {
  id: string;
  raspberry_id: string;
  message: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  gps_accuracy: number | null;
  host: string;
  ip_address: string;
  url?: string | null;
  message_date: string | null;
  timestamp: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<MotionEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selectedRaspberry, setSelectedRaspberry] = useState<string>("")
  const [selectedIp, setSelectedIp] = useState<string>("")
  const [selectedUrl, setSelectedUrl] = useState<string>("")
  const [probeLoading, setProbeLoading] = useState<boolean>(false)
  // Etat synthétique
  const [lifeOnline, setLifeOnline] = useState<boolean | null>(null)
  const [locCoords, setLocCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [probeError, setProbeError] = useState<string>("")

  // Filtres liste
  const [filterDateFrom, setFilterDateFrom] = useState<string>("") // ISO date (yyyy-mm-dd)
  const [filterDateTo, setFilterDateTo] = useState<string>("")
  const [filterRaspberry, setFilterRaspberry] = useState<string>("")
  const [filterHost, setFilterHost] = useState<string>("")
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  async function fetchItems() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('motions')
        .select('id, raspberry_id, message, latitude, longitude, altitude, gps_accuracy, host, ip_address, url, message_date, timestamp')
        .order('timestamp', { ascending: false })
        .limit(1000)
      if (error) throw new Error(error.message)
      setItems(data ?? [])
      setError(null)
      setLastUpdated(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Realtime: recharge automatiquement à chaque nouvelle insertion dans la table "motions"
  useEffect(() => {
    const channel = supabase
      .channel('realtime-motions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'motions' }, () => {
        fetchItems()
      })
      .subscribe()

    return () => {
      try { channel.unsubscribe() } catch {}
    }
  }, [])

  // Récupère la liste des raspberries (dernier IP connu)
  const raspberries = useMemo(() => {
    const latestByRpi = new Map<string, MotionEvent>()
    for (const m of items) {
      const prev = latestByRpi.get(m.raspberry_id)
      if (!prev || new Date(m.timestamp) > new Date(prev.timestamp)) {
        latestByRpi.set(m.raspberry_id, m)
      }
    }
    const arr = Array.from(latestByRpi.values()).map((m) => ({
      id: m.raspberry_id,
      ip: m.ip_address || '',
      url: (m as any).url || ''
    }))
    // Sélection automatique du premier si rien
    if (!selectedRaspberry && arr.length > 0) {
      setSelectedRaspberry(arr[0].id)
      setSelectedIp(arr[0].ip)
      setSelectedUrl(arr[0].url || '')
    }
    return arr
  }, [items, selectedRaspberry])

  async function probe(endpoint: 'life' | 'loc') {
    try {
      setProbeLoading(true)
      setProbeError("")
      if (endpoint === 'life') setLifeOnline(null)
      if (endpoint === 'loc') setLocCoords(null)
      const base = (selectedUrl || '').trim() || (selectedIp ? `http://${selectedIp}:8000` : '')
      if (!base) throw new Error('Aucune base URL ni IP disponibles pour ce Raspberry')
      const suffix = endpoint === 'loc' ? '/loc' : '/alive'
      const requestUrl = `${base.replace(/\/$/, '')}${suffix}`
      const res = await fetch(requestUrl, { method: 'GET' })
      const ct = res.headers.get('content-type') || ''
      if (endpoint === 'life') {
        let ok = res.ok
        try {
          if (ct.includes('application/json')) {
            const j = await res.json()
            if (typeof j?.ok === 'boolean') ok = j.ok
          } else {
            const t = (await res.text()).toLowerCase()
            if (t.includes('ok') || t.includes('alive')) ok = true
          }
        } catch {}
        setLifeOnline(ok)
      } else {
        let lat: number | null = null
        let lon: number | null = null
        try {
          if (ct.includes('application/json')) {
            const j = await res.json()
            if (typeof j?.loc === 'string') {
              const m = j.loc.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/)
              if (m) { lat = parseFloat(m[1]); lon = parseFloat(m[2]) }
            } else {
              lat = parseFloat(j.lat ?? j.latitude)
              lon = parseFloat(j.lon ?? j.lng ?? j.longitude)
            }
          } else {
            const t = await res.text()
            const m = t.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/)
            if (m) { lat = parseFloat(m[1]); lon = parseFloat(m[2]) }
          }
        } catch {}
        if (isFinite(lat as number) && isFinite(lon as number)) {
          setLocCoords({ lat: lat as number, lon: lon as number })
        } else {
          setProbeError('Pas de signal')
        }
      }
    } catch (e: unknown) {
      let errorMsg = 'Pas de signal'
      if (e instanceof Error && !e.message.toLowerCase().includes('fetch')) {
        errorMsg = e.message
      }
      setProbeError(errorMsg)
    } finally {
      setProbeLoading(false)
    }
  }

  // Prépare les points uniques (dernier point par raspberry) pour la carte
  const mapPoints = useMemo(() => {
    const latestByRpi = new Map<string, MotionEvent>()
    for (const m of items) {
      if (m.latitude == null || m.longitude == null) continue
      const prev = latestByRpi.get(m.raspberry_id)
      if (!prev || new Date(m.timestamp) > new Date(prev.timestamp)) {
        latestByRpi.set(m.raspberry_id, m)
      }
    }
    const now = Date.now()
    return Array.from(latestByRpi.values()).map((m) => ({
      raspberry_id: m.raspberry_id,
      latitude: m.latitude as number,
      longitude: m.longitude as number,
      altitude: m.altitude ?? null,
      gps_accuracy: m.gps_accuracy ?? null,
      timestamp: m.timestamp,
      last_message: m.message,
      host: m.host,
      ip_address: m.ip_address,
      // Force rouge: on marque offline pour utiliser le code couleur rouge du composant
      is_online: false,
      last_seen_minutes: Math.max(0, Math.floor((now - new Date(m.timestamp).getTime()) / 60000)),
    }))
  }, [items])

  // Table filtrée
  const filteredItems = useMemo(() => {
    const fromTs = filterDateFrom ? new Date(filterDateFrom + 'T00:00:00').getTime() : -Infinity
    const toTs = filterDateTo ? new Date(filterDateTo + 'T23:59:59').getTime() : Infinity
    const rpi = filterRaspberry.trim().toLowerCase()
    const host = filterHost.trim().toLowerCase()

    return items.filter((m) => {
      const ts = new Date(m.timestamp).getTime()
      if (ts < fromTs || ts > toTs) return false
      if (rpi && !String(m.raspberry_id).toLowerCase().includes(rpi)) return false
      if (host && !(`${m.host} ${m.ip_address || ''}`.toLowerCase().includes(host))) return false
      return true
    })
  }, [items, filterDateFrom, filterDateTo, filterRaspberry, filterHost])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-6">
          <a href="#/" className="text-sm text-white/70 hover:text-white">← Retour</a>
          <h1 className="text-xl tracking-widest">QG <span className='text-yellow-600'>SECRET</span></h1>
          <div className="flex items-center gap-3 text-xs text-white/60">
            {lastUpdated && <span>Maj: {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </header>

        {/* Contrôles de requêtes directes vers un Raspberry */}
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/60">Raspberry</label>
              <select
                value={selectedRaspberry}
                onChange={(e) => {
                  const id = e.target.value
                  setSelectedRaspberry(id)
                  const found = raspberries.find(r => r.id === id)
                  setSelectedIp(found?.ip || '')
                  setSelectedUrl(found?.url || '')
                }}
                className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
              >
                {raspberries.map(r => (
                  <option key={r.id} value={r.id}>{r.id}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-64">
              <label className="text-xs text-white/60">Base URL (modifiable)</label>
              <input
                value={selectedUrl}
                onChange={(e) => setSelectedUrl(e.target.value)}
                placeholder="http://x.x.x.x:8000"
                className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="w-full md:w-64">
              <label className="text-xs text-white/60">IP (modifiable)</label>
              <input
                value={selectedIp}
                onChange={(e) => setSelectedIp(e.target.value)}
                placeholder="192.168.x.x"
                className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => probe('life')}
                disabled={probeLoading || !selectedIp}
                className={`px-3 py-2 rounded border border-white/20 text-sm ${probeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
              >
                Vérifier état (life)
              </button>
              <button
                onClick={() => probe('loc')}
                disabled={probeLoading}
                className={`px-3 py-2 rounded border border-white/20 text-sm ${probeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
              >
                Demander position (loc)
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {/* Etat visuel */}
            <div className="flex items-center gap-2">
              <span className="text-white/60">Etat:</span>
              {lifeOnline === null ? (
                <span className="text-white/40">—</span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${lifeOnline ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className={lifeOnline ? 'text-green-400' : 'text-red-400'}>
                    {lifeOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </span>
              )}
            </div>

            {/* Coordonnées */}
            <div className="flex items-center gap-2">
              <span className="text-white/60">Position:</span>
              {locCoords ? (
                <span className="text-white/80">{locCoords.lat.toFixed(6)}, {locCoords.lon.toFixed(6)}</span>
              ) : (
                <span className="text-white/40">—</span>
              )}
            </div>

            {/* Erreur */}
            {probeError && (
              <span className="text-red-400 text-xs">{probeError}</span>
            )}
          </div>
          <div className="text-[11px] text-white/40 mt-2">Note: Ces requêtes contactent directement le Raspberry sur le réseau local (CORS du navigateur peut bloquer selon la config).</div>
        </div>

        {loading && <div className="text-white/60 text-sm">Chargement…</div>}
        {error && <div className="text-red-400 text-sm">Erreur: {error}</div>}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Carte avec points (rouge) */}
            <InteractiveMap raspberries={mapPoints} />

            {/* Tableau des événements */}
            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
              {/* Bouton Filtres + panneau repliable */}
              <div className="flex items-center justify-between px-4 pt-3 pb-3">
                <button
                  onClick={() => setFiltersOpen(v => !v)}
                  className="px-3 py-1.5 rounded border border-white/20 text-xs hover:bg-white/10"
                >
                  {filtersOpen ? 'Masquer les filtres' : 'Filtres'}
                </button>
              </div>
              {filtersOpen && (
                <div className="px-4 pb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-white/60">Date de début</label>
                    <div className="mt-1 relative">
                      <input
                        ref={dateFromRef}
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = dateFromRef.current
                          if (!el) return
                          const anyEl = el as unknown as { showPicker?: () => void }
                          if (typeof anyEl.showPicker === 'function') anyEl.showPicker(); else el.focus()
                        }}
                        className="absolute inset-y-0 right-0 px-2 flex items-center text-white/70 hover:text-white"
                        aria-label="Choisir la date de début"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm11 7H3v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9ZM3 8h14V6a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V5H7v1a1 1 0 1 1-2 0V5H4a1 1 0 0 0-1 1v2Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Date de fin</label>
                    <div className="mt-1 relative">
                      <input
                        ref={dateToRef}
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = dateToRef.current
                          if (!el) return
                          const anyEl = el as unknown as { showPicker?: () => void }
                          if (typeof anyEl.showPicker === 'function') anyEl.showPicker(); else el.focus()
                        }}
                        className="absolute inset-y-0 right-0 px-2 flex items-center text-white/70 hover:text-white"
                        aria-label="Choisir la date de fin"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm11 7H3v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9ZM3 8h14V6a1 1 0 0 0-1-1h-1v1a1 1 0 1 1-2 0V5H7v1a1 1 0 1 1-2 0V5H4a1 1 0 0 0-1 1v2Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Raspberry (contient)</label>
                    <input
                      value={filterRaspberry}
                      onChange={(e) => setFilterRaspberry(e.target.value)}
                      placeholder="ex: rpi-01"
                      className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60">Hôte/IP (contient)</label>
                    <input
                      value={filterHost}
                      onChange={(e) => setFilterHost(e.target.value)}
                      placeholder="ex: hostname ou 192.168"
                      className="mt-1 w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
              <div className="max-h-[75vh] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-yellow-600 text-white">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Raspberry</th>
                      <th className="px-4 py-2">Message</th>
                      <th className="px-4 py-2">GPS</th>
                      <th className="px-4 py-2">Hôte / IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredItems
                      .slice()
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((m) => (
                        <tr key={m.id} className="hover:bg-white/5">
                          <td className="px-4 py-2 whitespace-nowrap">{new Date(m.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{m.raspberry_id}</td>
                          <td className="px-4 py-2">{m.message}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {m.latitude != null && m.longitude != null
                              ? `${m.latitude.toFixed(6)}, ${m.longitude.toFixed(6)}`
                              : '—'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">{m.host} {m.ip_address ? `(${m.ip_address})` : ''}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
