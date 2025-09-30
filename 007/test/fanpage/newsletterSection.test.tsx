import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import NewsletterSection from '../../src/app/fanpage/newsletterSection'

describe('NewsletterSection', () => {
  beforeEach(() => {
    // Mock minimal localStorage
    const store: Record<string, string> = {}
    const ls = {
      getItem: jest.fn((k: string) => store[k] ?? null),
      setItem: jest.fn((k: string, v: string) => { store[k] = v }),
      removeItem: jest.fn((k: string) => { delete store[k] }),
      clear: jest.fn(() => { for (const k of Object.keys(store)) delete store[k] })
    } as unknown as Storage
    Object.defineProperty(window, 'localStorage', { value: ls, writable: true })
  })

  it("désactive le bouton si l'email est invalide et passe à 'Abonné' après submit valide", () => {
    render(<NewsletterSection />)
    const input = screen.getByPlaceholderText('email@exemple.com') as HTMLInputElement
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: 'invalid' } })
    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: 'user@example.com' } })
    expect(button).not.toBeDisabled()

    fireEvent.click(button)

    expect(button).toHaveTextContent('Abonné')
    expect(screen.getByText(/Bouteille débloquée/i)).toBeInTheDocument()
  })
})
