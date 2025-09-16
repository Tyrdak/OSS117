import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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

type InteractiveMapProps = {
  raspberries: RaspberryPosition[]
  onRaspberrySelect?: (raspberry: RaspberryPosition) => void
}

// Composant pour centrer la carte sur tous les markers
function MapController({ raspberries }: { raspberries: RaspberryPosition[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (raspberries.length > 0) {
      const bounds = L.latLngBounds(
        raspberries.map(r => [r.latitude, r.longitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [raspberries, map])
  
  return null
}

export default function InteractiveMap({ raspberries, onRaspberrySelect }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-white/60">Chargement de la carte...</div>
      </div>
    )
  }

  const getMarkerColor = (isOnline: boolean, lastSeenMinutes: number) => {
    if (isOnline) return 'green'
    if (lastSeenMinutes < 60) return 'orange'
    return 'red'
  }

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">📡</div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-white/10">
      <MapContainer
        center={[48.8566, 2.3522]} // Paris par défaut
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController raspberries={raspberries} />
        
        {raspberries.map((raspberry) => {
          const color = getMarkerColor(raspberry.is_online, raspberry.last_seen_minutes)
          const icon = createCustomIcon(color)
          
          return (
            <Marker
              key={raspberry.raspberry_id}
              position={[raspberry.latitude, raspberry.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onRaspberrySelect?.(raspberry)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-gray-900">{raspberry.raspberry_id}</div>
                  <div className="text-gray-600 mt-1">
                    <div>📡 {raspberry.host}</div>
                    <div>🌐 {raspberry.ip_address}</div>
                    <div className={`font-medium ${raspberry.is_online ? 'text-green-600' : 'text-red-600'}`}>
                      {raspberry.is_online ? '🟢 En ligne' : '🔴 Hors ligne'}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Dernière activité: {raspberry.last_seen_minutes}min
                    </div>
                    <div className="text-gray-500 text-xs">
                      Dernier message: {raspberry.last_message}
                    </div>
                    {raspberry.altitude && (
                      <div className="text-gray-500 text-xs">
                        Altitude: {raspberry.altitude.toFixed(1)}m
                      </div>
                    )}
                    {raspberry.gps_accuracy && (
                      <div className="text-gray-500 text-xs">
                        Précision: ±{raspberry.gps_accuracy.toFixed(1)}m
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
