import { useEffect, useState } from 'react'
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
  raw_date: string;
  message_date: string | null;
  timestamp: string; 
}

type RaspberryPosition = {
  raspberry_id: string
  latitude: number
  longitude: number
  altitude: number | null
  gps_accuracy: number | null
  timestamp: string
  last_message: string
  host: string
  ip_address: string
  is_online: boolean
  last_seen_minutes: number
}

type LatestData = {
  latest_message: MotionEvent | null
  all_messages: MotionEvent[]
  statistics: {
    total_messages: number
    unique_raspberries: number
    messages_last_24h: number
  }
}

export default function Dashboard() {
  const [latestData, setLatestData] = useState<LatestData | null>(null)
  const [raspberryPositions, setRaspberryPositions] = useState<RaspberryPosition[]>([])
  const [selectedRaspberry, setSelectedRaspberry] = useState<RaspberryPosition | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'messages'>('map')

  async function fetchLatestData() {
    try {
      const res = await fetch(`/api/latest`, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setLatestData(json)
    } catch (e: unknown) {
      console.error('Error fetching latest data:', e)
    }
  }

  async function fetchRaspberryPositions() {
    try {
      const res = await fetch(`/api/health`, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setRaspberryPositions(json.raspberries ?? [])
    } catch (e: unknown) {
      console.error('Error fetching raspberry positions:', e)
    }
  }

  useEffect(() => {
    fetchLatestData()
    fetchRaspberryPositions()
    const id = setInterval(() => {
      fetchLatestData()
      fetchRaspberryPositions()
    }, 5000) // Mise à jour toutes les 5 secondes
    return () => clearInterval(id)
  }, [])

  const handleRaspberrySelect = (raspberry: RaspberryPosition) => {
    setSelectedRaspberry(raspberry)
    setActiveTab('messages')
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-8">
          <a href="#/" className="text-sm text-white/70 hover:text-white">← Retour</a>
          <h1 className="text-xl tracking-widest">QG SECRET</h1>
          <div className="text-sm text-white/60">
            {latestData?.statistics.unique_raspberries || 0} Raspberry Pi • {latestData?.statistics.messages_last_24h || 0} messages/24h
          </div>
        </header>

        {/* Dernier message reçu */}
        {latestData?.latest_message && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-400 text-sm font-medium">DERNIER MESSAGE REÇU</div>
              <div className="text-white/60 text-xs">
                {new Date(latestData.latest_message.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="text-white/90 text-lg font-medium">{latestData.latest_message.message}</div>
            <div className="text-white/60 text-sm mt-1">
              {latestData.latest_message.raspberry_id} • {latestData.latest_message.host}
            </div>
            {latestData.latest_message.latitude && latestData.latest_message.longitude && (
              <div className="text-white/50 text-xs mt-1">
                📍 {latestData.latest_message.latitude.toFixed(6)}, {latestData.latest_message.longitude.toFixed(6)}
              </div>
            )}
          </div>
        )}

        {/* Onglets */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'map'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            🗺️ Carte Interactive
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            📋 Messages ({latestData?.all_messages.length || 0})
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <InteractiveMap 
              raspberries={raspberryPositions}
              onRaspberrySelect={handleRaspberrySelect}
            />
            
            {/* Liste des Raspberry Pi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {raspberryPositions.map((raspberry) => (
                <div 
                  key={raspberry.raspberry_id} 
                  className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                    raspberry.is_online 
                      ? 'border-green-500/20 bg-green-500/5' 
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                  onClick={() => handleRaspberrySelect(raspberry)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white/90 text-sm font-medium">{raspberry.raspberry_id}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      raspberry.is_online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {raspberry.is_online ? '🟢 En ligne' : '🔴 Hors ligne'}
                    </div>
                  </div>
                  <div className="text-white/60 text-xs">
                    📡 {raspberry.host}
                  </div>
                  <div className="text-white/50 text-xs mt-1">
                    🌐 {raspberry.ip_address}
                  </div>
                  <div className="text-white/50 text-xs mt-1">
                    Dernière activité: {raspberry.last_seen_minutes}min
                  </div>
                  <div className="text-white/40 text-xs mt-1">
                    Dernier message: {raspberry.last_message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4">
            {/* Filtre par Raspberry Pi */}
            {selectedRaspberry && (
              <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-400 text-sm font-medium">Filtré par: {selectedRaspberry.raspberry_id}</div>
                    <div className="text-white/60 text-xs">Dernière position: {selectedRaspberry.latitude.toFixed(6)}, {selectedRaspberry.longitude.toFixed(6)}</div>
                  </div>
                  <button
                    onClick={() => setSelectedRaspberry(null)}
                    className="text-white/60 hover:text-white text-xs"
                  >
                    ✕ Effacer filtre
                  </button>
                </div>
              </div>
            )}

            {/* Liste des messages */}
            <div className="rounded-lg border border-white/10 bg-white/5">
              <div className="max-h-[70vh] overflow-auto">
                {(selectedRaspberry 
                  ? latestData?.all_messages.filter(m => m.raspberry_id === selectedRaspberry.raspberry_id)
                  : latestData?.all_messages
                )?.map((message) => (
                  <div key={message.id} className="py-4 px-4 border-b border-white/10 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white/90 text-sm font-medium">{message.message}</div>
                      <div className="text-white/40 text-xs">{message.raspberry_id}</div>
                    </div>
                    
                    {/* Coordonnées GPS */}
                    {message.latitude && message.longitude && (
                      <div className="text-white/60 text-xs mb-2">
                        📍 {message.latitude.toFixed(6)}, {message.longitude.toFixed(6)}
                        {message.altitude && ` • ${message.altitude.toFixed(1)}m`}
                        {message.gps_accuracy && ` • ±${message.gps_accuracy.toFixed(1)}m`}
                      </div>
                    )}
                    
                    <div className="text-white/50 text-xs">
                      {message.host} ({message.ip_address}) • {new Date(message.timestamp).toLocaleString()}
                    </div>
                    
                    {message.message_date && (
                      <div className="text-white/30 text-xs mt-1">
                        Pi time: {new Date(message.message_date).toLocaleString()}
                      </div>
                    )}
                    
                    {message.raw_date && !message.message_date && (
                      <div className="text-white/30 text-xs mt-1">
                        Pi time: {message.raw_date}
                      </div>
                    )}
                  </div>
                )) || []}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



