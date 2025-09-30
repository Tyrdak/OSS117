import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import FaqSection from '../../src/app/fanpage/faqSection'

describe('FaqSection', () => {
  it('affiche le titre et deux questions', () => {
    render(<FaqSection />)
    expect(screen.getByRole('heading', { level: 3, name: /FAQ/i })).toBeInTheDocument()
    expect(screen.getByText(/officielle \?/i)).toBeInTheDocument()
    expect(screen.getByText(/QG secret existe-t-il vraiment \?/i)).toBeInTheDocument()
  })
})
