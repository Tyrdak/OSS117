import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../../src/App'

// Mocks décoratifs pour éviter les effets
jest.mock('../../src/app/components/draggableOlive', () => ({ __esModule: true, default: () => <div data-testid="olive" /> }))
jest.mock('../../src/app/components/draggableBottle', () => ({ __esModule: true, default: () => <div data-testid="bottle" /> }))

// Mock des sous-pages pour assertions plus robustes
jest.mock('../../src/app/fanpage/landing', () => ({ __esModule: true, default: () => <h1>AGENT 007</h1> }))
jest.mock('../../src/app/application/dashboard', () => ({ __esModule: true, default: () => <h1>QG SECRET</h1> }))

describe('App', () => {
  const originalHash = window.location.hash
  afterEach(() => { window.location.hash = originalHash })

  it('rend la fanpage sur la route par défaut', () => {
    window.location.hash = '#'
    render(<App />)
    expect(screen.getByText('AGENT 007')).toBeInTheDocument()
  })

  it('rend le dashboard sur #/control', () => {
    window.location.hash = '#/control'
    render(<App />)
    expect(screen.getByText('QG SECRET')).toBeInTheDocument()
  })
})
