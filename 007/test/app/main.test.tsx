import { createRoot } from 'react-dom/client'
import '../setupTests'

// Mock supabaseClient pour éviter import.meta dans l’environnement Jest
jest.mock('../../src/app/lib/supabaseClient', () => ({
  __esModule: true,
  supabase: { from: () => ({ select: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }) }) },
}))

jest.mock('react-dom/client', () => {
  const actual = jest.requireActual('react-dom/client')
  return {
    ...actual,
    createRoot: jest.fn(() => ({ render: jest.fn() })),
  }
})

describe('main.tsx bootstrap', () => {
  it('monte App dans #root', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import('../../src/main')
    expect(createRoot).toHaveBeenCalled()
  })
})
