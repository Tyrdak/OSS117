import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CarrouselSection from '../../src/app/fanpage/carrouselSection'

describe('CarrouselSection', () => {
  it('affiche le titre et 8 gadgets + 4 images', () => {
    render(<CarrouselSection />)
    expect(screen.getByRole('heading', { level: 3, name: /Gadgets iconiques/i })).toBeInTheDocument()
    const items = ['Aston Martin DB5','Montre laser','Stylo explosif','Chaise éjectable','Valise Q Branch','Mini sous-marin','Téléphone crypté','Carte 00']
    for (const label of items) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('img', { name: /Agent 007/i })).toHaveLength(4)
  })
})
