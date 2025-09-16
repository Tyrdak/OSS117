import { useEffect, useState } from 'react'

// removed unused RpiStatus

type MotionEvent = { id: string; timestamp: string; message: string }

export default function Dashboard() {
  const [motions, setMotions] = useState<MotionEvent[]>([])


  async function fetchMotions() {
    try {
      const res = await fetch(`/api/motions`, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setMotions(json.items ?? [])
    } catch (e: unknown) {
    }
  }
  useEffect(() => {
    fetchMotions()
    const id = setInterval(fetchMotions, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between">
          <a href="#/" className="text-sm text-white/70 hover:text-white">← Retour</a>
          <h1 className="text-xl tracking-widest">QG SECRET</h1>
          <div />
        </header>

        <main className="mt-8 space-y-4">
          <div className="text-sm text-white/60">
            Dernier mouvement à : {motions.length ? new Date(motions[motions.length - 1].timestamp).toLocaleString() : '—'}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5">
            <ul className="max-h-[70vh] overflow-auto divide-y divide-white/10">
              {motions.slice().reverse().map((m) => (
                <li key={m.id} className="py-3 px-4">
                  <div className="text-white/90 text-sm">{m.message}</div>
                  <div className="text-white/50 text-xs">{new Date(m.timestamp).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}



