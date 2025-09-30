import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Reset from '../../src/app/components/reset'

// Mock localStorage et reload
beforeEach(() => {
  const store: Record<string, string> = {
    'olive-pos': '1',
    'bottle-pos': '1',
    'bottle-unlocked': 'true',
    'newsletter-subscribed': 'true',
    'glass-filled': 'true',
  }
  const ls = {
    getItem: jest.fn((k: string) => store[k] ?? null),
    setItem: jest.fn((k: string, v: string) => { store[k] = v }),
    removeItem: jest.fn((k: string) => { delete store[k] }),
    clear: jest.fn(() => { for (const k of Object.keys(store)) delete store[k] })
  } as unknown as Storage
  Object.defineProperty(window, 'localStorage', { value: ls, writable: true })

  Object.defineProperty(window, 'location', {
    value: { reload: jest.fn() },
    writable: true,
  })
})

describe('Reset', () => {
  it('rend un bouton accessible', () => {
    render(<Reset />)
    const btn = screen.getByRole('button', { name: /Reset/i })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('title', "Réinitialiser l'expérience")
  })

  it('supprime les clés de localStorage et recharge la page', () => {
    render(<Reset />)
    const btn = screen.getByRole('button', { name: /Reset/i })
    fireEvent.click(btn)

    const ls = window.localStorage as any
    expect(ls.removeItem).toHaveBeenCalledWith('olive-pos')
    expect(ls.removeItem).toHaveBeenCalledWith('bottle-pos')
    expect(ls.removeItem).toHaveBeenCalledWith('bottle-unlocked')
    expect(ls.removeItem).toHaveBeenCalledWith('newsletter-subscribed')
    expect(ls.removeItem).toHaveBeenCalledWith('glass-filled')

    expect(window.location.reload).toHaveBeenCalled()
  })
})
