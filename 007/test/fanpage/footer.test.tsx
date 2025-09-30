import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Footer from '../../src/app/fanpage/footer'

describe('Footer', () => {
  it('rend un élément footer avec le texte attendu', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveTextContent('App non officielle, à but éducatif.')
  })
})
