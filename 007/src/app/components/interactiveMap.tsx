import { useEffect, useState, useRef } from 'react'
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

export default function InteractiveMap({ raspberries, onRaspberrySelect }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    // Initialiser la carte
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([48.8566, 2.3522], 6)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current)
    }

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Ajouter les nouveaux marqueurs
    raspberries.forEach((raspberry) => {
      const color = getMarkerColor(raspberry.is_online, raspberry.last_seen_minutes)
      const icon = createCustomIcon(color)
      
      const marker = L.marker([raspberry.latitude, raspberry.longitude], { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(createPopupContent(raspberry))
        .on('click', () => onRaspberrySelect?.(raspberry))
      
      markersRef.current.push(marker)
    })

    // Ajuster la vue pour voir tous les marqueurs
    if (raspberries.length > 0) {
      const group = L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker)
      })
      markersRef.current = []
    }
  }, [isClient, raspberries, onRaspberrySelect])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const getMarkerColor = (isOnline: boolean, lastSeenMinutes: number) => {
    if (isOnline) return '#10b981' // green-500
    if (lastSeenMinutes < 60) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">📡</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  }

  const createPopupContent = (raspberry: RaspberryPosition) => {
    return `
      <div style="font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.4;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${raspberry.raspberry_id}</div>
        <div style="color: #6b7280; margin-bottom: 4px;">📡 ${raspberry.host}</div>
        <div style="color: #6b7280; margin-bottom: 4px;">🌐 ${raspberry.ip_address}</div>
        <div style="color: ${raspberry.is_online ? '#059669' : '#dc2626'}; font-weight: 500; margin-bottom: 4px;">
          ${raspberry.is_online ? '🟢 En ligne' : '🔴 Hors ligne'}
        </div>
        <div style="color: #9ca3af; font-size: 12px; margin-bottom: 2px;">
          Dernière activité: ${raspberry.last_seen_minutes}min
        </div>
        <div style="color: #9ca3af; font-size: 12px; margin-bottom: 2px;">
          Dernier message: ${raspberry.last_message}
        </div>
        ${raspberry.altitude ? `<div style="color: #9ca3af; font-size: 12px; margin-bottom: 2px;">Altitude: ${raspberry.altitude.toFixed(1)}m</div>` : ''}
        ${raspberry.gps_accuracy ? `<div style="color: #9ca3af; font-size: 12px;">Précision: ±${raspberry.gps_accuracy.toFixed(1)}m</div>` : ''}
      </div>
    `
  }

  if (!isClient) {
    return (
      <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-white/60">Chargement de la carte...</div>
      </div>
    )
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-white/10">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}
