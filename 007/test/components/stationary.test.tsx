import { render, screen } from '@testing-library/react'
import { act } from 'react'
import '@testing-library/jest-dom'
import StationaryGlass from '../../src/app/components/stationaryGlass'

// Mock localStorage sécurisé
beforeEach(() => {
  const store: Record<string, string> = {}
  const ls = {
    getItem: jest.fn((k: string) => store[k] ?? null),
    setItem: jest.fn((k: string, v: string) => { store[k] = v }),
    removeItem: jest.fn((k: string) => { delete store[k] }),
    clear: jest.fn(() => { for (const k of Object.keys(store)) delete store[k] })
  } as unknown as Storage
  Object.defineProperty(window, 'localStorage', { value: ls, writable: true })
})

function dispatchMove(kind: 'olive' | 'bottle', x: number, y: number, width = 10, height = 10) {
  const ev = new CustomEvent('olive:move', { detail: { x, y, width, height } as any })
  const ev2 = new CustomEvent('bottle:move', { detail: { x, y, width, height } as any })
  window.dispatchEvent(kind === 'olive' ? ev : ev2)
}

describe('StationaryGlass', () => {
  it('rend en mode header et affiche le verre', () => {
    render(<StationaryGlass mode="header" />)
    expect(screen.getByLabelText('verre')).toBeInTheDocument()
  })

  it('rend en mode overlay et affiche le verre', () => {
    render(<StationaryGlass mode="overlay" />)
    expect(screen.getByLabelText('verre')).toBeInTheDocument()
  })

  it('affiche le bouton quand olive et bouteille sont sur le verre (mode header)', async () => {
    render(<StationaryGlass mode="header" />)
    const glass = screen.getByLabelText('verre')
    const rect = { left: 100, top: 100, right: 200, bottom: 200 } as any
    jest.spyOn(glass, 'getBoundingClientRect').mockReturnValue(rect)

    await act(async () => {
      dispatchMove('olive', 150, 150)
      dispatchMove('bottle', 150, 150)
    })

    expect(await screen.findByRole('link', { name: /QG secret/i })).toBeInTheDocument()
  })

  it("n'affiche pas le bouton si un seul élément est sur le verre", async () => {
    render(<StationaryGlass mode="header" />)
    const glass = screen.getByLabelText('verre')
    const rect = { left: 100, top: 100, right: 200, bottom: 200 } as any
    jest.spyOn(glass, 'getBoundingClientRect').mockReturnValue(rect)

    await act(async () => {
      dispatchMove('olive', 150, 150)
    })

    expect(screen.queryByRole('link', { name: /QG secret/i })).toBeNull()
  })
})
