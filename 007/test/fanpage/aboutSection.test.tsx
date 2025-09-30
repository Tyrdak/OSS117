import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AboutSection from '../../src/app/fanpage/aboutSection'

describe('AboutSection', () => {
  it('affiche le titre et le texte', () => {
    render(<AboutSection />)
    expect(screen.getByRole('heading', { level: 3, name: /À propos/i })).toBeInTheDocument()
    expect(screen.getByText(/Fan page non officielle/i)).toBeInTheDocument()
  })
})
