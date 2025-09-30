import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from '../../src/app/application/dashboard'

// Mock configurable de Supabase
let mockData: any[] = []
let mockMode: 'ok' | 'error' = 'ok'

jest.mock('../../src/app/lib/supabaseClient', () => {
  const makeChain = () => {
    const c: any = {}
    c.select = jest.fn(() => c)
    c.order = jest.fn(() => c)
    c.limit = jest.fn(() => (mockMode === 'ok' ? { data: mockData, error: null } : { data: null, error: { message: 'boom' } }))
    return c
  }
  return {
    __esModule: true,
    supabase: {
      from: jest.fn(() => makeChain()),
    },
  }
})

// Mock de la carte pour éviter Leaflet dans JSDOM
jest.mock('../../src/app/components/interactiveMap', () => ({ __esModule: true, default: ({ raspberries }: { raspberries: any[] }) => (
  <div data-testid="interactive-map">{raspberries.length} points</div>
)}))

// Mocks fetch utilisés par probe
const originalFetch = global.fetch
beforeAll(() => {
  // @ts-expect-error assign mock
  global.fetch = jest.fn(async (url: RequestInfo) => {
    const u = String(url)
    if (u.endsWith('/alive')) {
      return { ok: true, headers: new Headers({ 'content-type': 'text/plain' }), text: async () => 'alive' } as any
    }
    if (u.endsWith('/loc')) {
      return { ok: true, headers: new Headers({ 'content-type': 'text/plain' }), text: async () => '48.8566, 2.3522' } as any
    }
    return { ok: true, headers: new Headers(), text: async () => 'ok' } as any
  })
})
afterAll(() => {
  global.fetch = originalFetch
})

describe('Dashboard', () => {
  beforeEach(() => {
    mockMode = 'ok'
    mockData = [
      {
        id: '1', raspberry_id: 'rpi-1', message: 'Hello world', latitude: 1.234567, longitude: 2.345678,
        altitude: null, gps_accuracy: null, host: 'host-1', ip_address: '192.168.0.10', url: '',
        message_date: new Date().toISOString(), timestamp: new Date().toISOString(),
      },
      {
        id: '2', raspberry_id: 'rpi-2', message: 'Ping', latitude: null, longitude: null,
        altitude: null, gps_accuracy: null, host: 'host-2', ip_address: '192.168.0.11', url: 'http://192.168.0.11:8000',
        message_date: new Date().toISOString(), timestamp: new Date().toISOString(),
      },
      {
        id: '3', raspberry_id: 'rpi-1', message: 'Newer with coords', latitude: 5.55, longitude: 6.66,
        altitude: null, gps_accuracy: null, host: 'host-1', ip_address: '192.168.0.10', url: '',
        message_date: new Date().toISOString(), timestamp: new Date(Date.now() + 1000).toISOString(),
      },
    ]
  })

  it('affiche en-têtes et au moins une ligne d’événement après chargement', async () => {
    render(<Dashboard />)
    // Trouve la row contenant 'rpi-1' pour éviter les ambiguïtés ARIA
    const rows = await screen.findAllByRole('row')
    const rowRpi1 = rows.find((r) => within(r).queryByText(/rpi-1/i)) as HTMLElement | undefined
    expect(rowRpi1).toBeTruthy()

    expect(screen.getByRole('columnheader', { name: /Date/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Raspberry/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Message/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /GPS/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Hôte \/ IP/i })).toBeInTheDocument()

    const utils = within(rowRpi1 as HTMLElement)
    expect(utils.getByText(/rpi-1/)).toBeInTheDocument()
  })

  it('bouton Rafraîchir relance la récupération', async () => {
    render(<Dashboard />)
    const refresh = await screen.findByRole('button', { name: /Rafraîchir/i })
    fireEvent.click(refresh)
    await screen.findByRole('table')
  })

  it('agrège les points de carte (dernier par raspberry avec coordonnées)', async () => {
    render(<Dashboard />)
    const map = await screen.findByTestId('interactive-map')
    expect(map).toHaveTextContent('1 points')
  })

  it('ouvre les filtres et filtre par Raspberry/Host', async () => {
    render(<Dashboard />)
    const toggleBtn = await screen.findByRole('button', { name: /Filtres/i })
    fireEvent.click(toggleBtn)

    const raspberryFilter = screen.getByPlaceholderText('ex: rpi-01') as HTMLInputElement
    fireEvent.change(raspberryFilter, { target: { value: 'nope' } })

    await waitFor(() => {
      const dataRows = screen.getAllByRole('row').slice(1)
      expect(dataRows.length).toBe(0)
    })

    fireEvent.change(raspberryFilter, { target: { value: '' } })
    const hostFilter = screen.getByPlaceholderText('ex: hostname ou 192.168') as HTMLInputElement
    fireEvent.change(hostFilter, { target: { value: 'host-1' } })

    const rows2 = await screen.findAllByRole('row')
    const row = rows2.find((r) => within(r).queryByText(/host-1/i))
    expect(row).toBeTruthy()
  })

  it('sélecteur Raspberry met à jour les champs URL/IP', async () => {
    render(<Dashboard />)
    const ipInput = await screen.findByPlaceholderText('192.168.x.x') as HTMLInputElement
    const urlInput = screen.getByPlaceholderText('http://x.x.x.x:8000') as HTMLInputElement

    // Attendre la sélection automatique initiale
    await waitFor(() => {
      expect(ipInput.value).toBe('192.168.0.10')
    })

    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'rpi-2' } })
    expect(ipInput.value).toBe('192.168.0.11')
    expect(urlInput.value).toBe('http://192.168.0.11:8000')
  })

  it('probe life passe au statut En ligne et loc affiche des coordonnées', async () => {
    render(<Dashboard />)

    // Assure IP initialisée
    const ipInput = await screen.findByPlaceholderText('192.168.x.x') as HTMLInputElement
    await waitFor(() => expect(ipInput.value).toBe('192.168.0.10'))

    const lifeBtn = await screen.findByRole('button', { name: /Vérifier état \(life\)/i })
    fireEvent.click(lifeBtn)
    await waitFor(() => {
      expect(screen.getByText(/En ligne/i)).toBeInTheDocument()
    })

    const locBtn = screen.getByRole('button', { name: /Demander position \(loc\)/i })
    fireEvent.click(locBtn)
    await screen.findByText(/48\.856600, 2\.352200|48\.8566, 2\.3522/)
  })

  it('affiche une erreur si Supabase renvoie une erreur', async () => {
    mockMode = 'error'
    render(<Dashboard />)
    await screen.findByText(/Erreur:/)
  })
})
