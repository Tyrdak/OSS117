import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeroSection from '../../src/app/fanpage/heroSection'

describe('HeroSection', () => {
  it('affiche le titre et les CTA', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading', { name: /James Bond/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explorer les dossiers/i })).toHaveAttribute('href', '#dossiers')
    expect(screen.getByRole('link', { name: /Voir les gadgets/i })).toHaveAttribute('href', '#gadgets')
  })
})
