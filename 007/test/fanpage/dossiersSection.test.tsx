import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DossiersSection from '../../src/app/fanpage/dossiersSection'

describe('DossiersSection', () => {
  it('rend le titre et 6 images', () => {
    render(<DossiersSection />)
    expect(screen.getByRole('heading', { level: 3, name: /Gadgets confidentiels/i })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /Gadget \d+/i })).toHaveLength(6)
  })
})
