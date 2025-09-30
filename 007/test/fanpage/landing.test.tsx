import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Landing from '../../src/app/fanpage/landing'

// Mocks légers pour les composants enfants décoratifs si nécessaire
jest.mock('../../src/app/components/stationaryGlass', () => ({ __esModule: true, default: () => <div data-testid="stationary-glass" /> }))
jest.mock('../../src/app/components/reset', () => ({ __esModule: true, default: () => <button>Reset</button> }))


describe('Landing', () => {
  it('rend les sections principales de la fanpage', () => {
    render(<Landing />)
    expect(screen.getByRole('heading', { name: /AGENT/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Gadgets iconiques/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Gadgets confidentiels/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /À propos/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /FAQ/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Newsletter MI6/i })).toBeInTheDocument()

    const fanPageMatches = screen.getAllByText(/Fan Page/i)
    expect(fanPageMatches.length).toBeGreaterThan(0)
  })
})
