import { render } from '@testing-library/react'
import InteractiveMap from '../../src/app/components/interactiveMap'

// Mock global window for client detection
Object.defineProperty(window, 'scrollX', { value: 0, writable: true })
Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

// Mock leaflet API used
jest.mock('leaflet', () => {
  const addTo = jest.fn().mockReturnThis()
  const bindPopup = jest.fn().mockReturnThis()
  const on = jest.fn().mockReturnThis()
  const fitBounds = jest.fn()

  const marker = jest.fn(() => ({ addTo, bindPopup, on }))
  const tileLayer = jest.fn(() => ({ addTo }))
  const featureGroup = jest.fn(() => ({ getBounds: () => ({ pad: jest.fn().mockReturnValue({}) }) }))
  const map = jest.fn(() => ({ setView: jest.fn().mockReturnThis(), remove: jest.fn(), fitBounds, removeLayer: jest.fn() }))
  const divIcon = jest.fn(() => ({}))
  const Icon = { Default: { prototype: {}, mergeOptions: jest.fn() } }

  const LDefault = { Icon, marker, tileLayer, featureGroup, map, divIcon }


  return {
    __esModule: true,
    default: LDefault,
    Icon,
    marker,
    tileLayer,
    featureGroup,
    map,
    divIcon,
  }
})

describe('InteractiveMap', () => {
  test('rend sans crash avec des points', () => {
    const raspberries = [
      {
        raspberry_id: 'rpi-1', latitude: 1, longitude: 2, altitude: null, gps_accuracy: null,
        timestamp: new Date().toISOString(), last_message: 'hello', host: 'h', ip_address: '1.2.3.4', is_online: false, last_seen_minutes: 10
      }
    ]
    const { container } = render(<InteractiveMap raspberries={raspberries} />)
    expect(container.querySelector('div[style*="height: 100%"]')).toBeInTheDocument()
  })
})


